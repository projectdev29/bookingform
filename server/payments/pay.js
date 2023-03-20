require("dotenv").config();

var Square = require("square");
const Client = Square.Client;
const crypto = require("crypto");
const { insert, findById } = require("../database/mongodbhelper");

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const { paymentsApi, customersApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: "production",
});

const createPayment = async (body) => {
  try {
    const submission = await findById(body.submissionId, "FormSubmissions");
    if (submission.notFound) {
      console.log(
        "This should not happen. Submission Id not found: " + body.submissionId
      );
      return submission.error;
    }
    const customerResult = await customersApi.searchCustomers({
      query: { filter: { emailAddress: { exact: body.customer.email } } },
    });
    let customer = null;
    if (
      customerResult.result &&
      customerResult.result.customers &&
      customerResult.result.customers.length > 0
    ) {
      console.log(JSON.stringify(customerResult.result.customers[0]));
      customer = customerResult.result.customers[0];
    }
    if (customer === null) {
      const response = await customersApi.createCustomer({
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

    const { result } = await paymentsApi.createPayment({
      idempotencyKey: crypto.randomUUID(),
      sourceId: body.sourceId,
      amountMoney: {
        currency: "USD",
        //TODO: validate that the amount in the db matches what the client is passing
        amount: 100,
      },
      referenceId: submission.orderNumber,
      buyerEmailAddress: body.customer.email,
      billingAddress: body.customer.address,
      customerId: customer.id,
    });
    insert(result, "Payments");
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

module.exports = { createPayment };
