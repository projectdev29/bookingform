require("dotenv").config();

var Square = require("square");
const Client = Square.Client;
const crypto = require("crypto");
const { insert, findById } = require("../database/mongodbhelper");

BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Production client
const productionClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: "production",
});

// Sandbox client
const sandboxClient = new Client({
  accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN,
  environment: "sandbox",
});

// Production APIs
const { paymentsApi: productionPaymentsApi, customersApi: productionCustomersApi } = productionClient;

// Sandbox APIs
const { paymentsApi: sandboxPaymentsApi, customersApi: sandboxCustomersApi } = sandboxClient;

const createPayment = async (body) => {
  try {
    const submission = await findById(body.submissionId, "FormSubmissions");
    if (submission.notFound) {
      console.log(
        "This should not happen. Submission Id not found: " + body.submissionId
      );
      return submission.error;
    }
    if (
      !submission.formData ||
      !submission.formData.price ||
      !submission.formData.price.totalCost ||
      submission.formData.price.totalCost < 0
    ) {
      return '{"errors": [{"category": "INTERNAL", "code": "INTERNAL", "detail": "Invalid price for the order. Please contact support for assistance."}]}';
    }
    const customerResult = await productionCustomersApi.searchCustomers({
      query: { filter: { emailAddress: { exact: body.customer.email } } },
    });
    let customer = null;
    if (
      customerResult.result &&
      customerResult.result.customers &&
      customerResult.result.customers.length > 0
    ) {
      customer = customerResult.result.customers[0];
    }
    if (customer === null) {
      const response = await productionCustomersApi.createCustomer({
        givenName: body.customer.firstName,
        familyName: body.customer.lastName,
        emailAddress: body.customer.email,
        address: body.customer.address,
      });

      if (response.result.customer) {
        customer = response.result.customer;
      } else {
        console.log(response.result.errors);
        return response.result.errors;
      }
    }

    const { result } = await productionPaymentsApi.createPayment({
      idempotencyKey: crypto.randomUUID(),
      sourceId: body.sourceId,
      amountMoney: {
        currency: "USD",
        amount: submission.formData.price.totalCost * 100,
      },
      referenceId: submission.orderNumber,
      buyerEmailAddress: body.customer.email,
      billingAddress: body.customer.address,
      customerId: customer.id,
      note: "Reservation - Booking For Visa",
    });
    //TODO: decide if we need payments data as it should already be available
    // insert(result, "Payments");
    return result;
  } catch (error) {
    let err = error;
    if (error.body) {
      err = error.body;
    }
    console.log(err);
    return err;
  }
};

const createPaymentForGiftCertificate = async (body) => {
  try {
    const submission = await findById(body.submissionId, "GiftCertificates");
    if (submission.notFound) {
      console.log(
        "This should not happen. Submission Id not found: " + body.submissionId
      );
      return submission.error;
    }
    if (!submission.amount || submission.amount < 0) {
      return '{"errors": [{"category": "INTERNAL", "code": "INTERNAL", "detail": "Invalid gift certificate amount. Please contact support for assistance."}]}';
    }
    const netAmount = parseInt(submission.amount) - submission.discount;

    const customerResult = await productionCustomersApi.searchCustomers({
      query: { filter: { emailAddress: { exact: body.customer.email } } },
    });
    let customer = null;
    if (
      customerResult.result &&
      customerResult.result.customers &&
      customerResult.result.customers.length > 0
    ) {
      customer = customerResult.result.customers[0];
    }
    if (customer === null) {
      const response = await productionCustomersApi.createCustomer({
        givenName: body.customer.firstName,
        familyName: body.customer.lastName,
        emailAddress: body.customer.email,
        address: body.customer.address,
      });

      if (response.result.customer) {
        customer = response.result.customer;
      } else {
        console.log(response.result.errors);
        return response.result.errors;
      }
    }

    const { result } = await productionPaymentsApi.createPayment({
      idempotencyKey: crypto.randomUUID(),
      sourceId: body.sourceId,
      amountMoney: {
        currency: "USD",
        amount: netAmount * 100,
      },
      referenceId: body.submissionId,
      buyerEmailAddress: body.customer.email,
      billingAddress: body.customer.address,
      customerId: customer.id,
      note: "Gift Certificate - Booking For Visa",
    });
    return result;
  } catch (error) {
    let err = error;
    if (error.body) {
      err = error.body;
    }
    console.log(err);
    return err;
  }
};

const createPaymentForVisaScore = async (body) => {
  try {
    // Determine if we should use production or sandbox
    const useProduction = process.env.USE_PRODUCTION_PAYMENTS === 'true';
    const environment = useProduction ? 'production' : 'sandbox';
    
    // Select appropriate APIs based on environment
    const paymentsApi = useProduction ? productionPaymentsApi : sandboxPaymentsApi;
    const customersApi = useProduction ? productionCustomersApi : sandboxCustomersApi;
    
    // Check if the required access token is configured
    const requiredToken = useProduction ? 'SQUARE_ACCESS_TOKEN' : 'SQUARE_SANDBOX_ACCESS_TOKEN';
    const accessToken = useProduction ? process.env.SQUARE_ACCESS_TOKEN : process.env.SQUARE_SANDBOX_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.error(`Square ${environment} access token not configured`);
      return {
        errors: [{
          category: "CONFIGURATION_ERROR",
          code: `SQUARE_${environment.toUpperCase()}_NOT_CONFIGURED`,
          detail: `Square ${environment} payment system is not properly configured. Please set ${requiredToken} in your environment variables.`
        }]
      };
    }

    console.log(`Using Square ${environment} environment for visa score payments`);
    console.log(`Square ${environment} access token configured:`, !!accessToken);
    
    const submission = await findById(body.submissionId, "VisaScores");
    if (submission.notFound) {
      console.log(
        "This should not happen. Submission Id not found: " + body.submissionId
      );
      return {
        errors: [{
          category: "NOT_FOUND",
          code: "SUBMISSION_NOT_FOUND",
          detail: "Visa score submission not found"
        }]
      };
    }
    
    // Fixed price for visa score report
    const visaScorePrice = 9.99; // $9.99 for complete visa score report
    
    const customerResult = await customersApi.searchCustomers({
      query: { filter: { emailAddress: { exact: body.customer.email } } },
    });
    let customer = null;
    if (
      customerResult.result &&
      customerResult.result.customers &&
      customerResult.result.customers.length > 0
    ) {
      customer = customerResult.result.customers[0];
    }
    if (customer === null) {
      const response = await customersApi.createCustomer({
        givenName: body.customer.firstName,
        familyName: body.customer.lastName,
        emailAddress: body.customer.email,
      });

      if (response.result.customer) {
        customer = response.result.customer;
      } else {
        console.log(`Square ${environment} customer creation error:`, response.result.errors);
        return response.result.errors;
      }
    }

    const { result } = await paymentsApi.createPayment({
      idempotencyKey: crypto.randomUUID(),
      sourceId: body.sourceId,
      amountMoney: {
        currency: "USD",
        amount: Math.round(visaScorePrice * 100), // Convert to cents
      },
      referenceId: body.submissionId,
      buyerEmailAddress: body.customer.email,
      billingAddress: body.customer.address,
      customerId: customer.id,
      note: `Visa Score Report - Booking For Visa (${environment.charAt(0).toUpperCase() + environment.slice(1)})`,
    });
    return result;
  } catch (error) {
    const useProduction = process.env.USE_PRODUCTION_PAYMENTS === 'true';
    const environment = useProduction ? 'production' : 'sandbox';
    
    console.error(`Error in createPaymentForVisaScore (${environment}):`, error);
    
    // Handle Square API errors specifically
    if (error.errors && Array.isArray(error.errors)) {
      console.log(`Square ${environment} API errors:`, error.errors);
      return error; // Return the Square error directly
    }
    
    let err = error;
    if (error.body) {
      err = error.body;
    }
    console.log('Generic error:', err);
    return {
      errors: [{
        category: "INTERNAL_ERROR",
        code: "PAYMENT_CREATION_FAILED",
        detail: `Failed to create payment for visa score in ${environment}`
      }]
    };
  }
};

module.exports = { createPayment, createPaymentForGiftCertificate, createPaymentForVisaScore };
