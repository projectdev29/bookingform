var axios = require("axios");
const { findById } = require("../database/mongodbhelper");

const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
const baseURL = {
  sandbox: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com",
};

// use the orders api to create an order
async function createOrder(body) {
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

    const accessToken = await generateAccessToken();
    const url = `${baseURL.production}/v2/checkout/orders`;

    const response = await axios.post(
      url,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "Reservation - Booking For Visa",
            amount: {
              currency_code: "USD",
              value: submission.formData.price.totalCost.toString(),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: submission.formData.price.totalCost.toString(),
                },
              },
            },
            items: [
              {
                name: "Reservation - Booking For Visa",
                quantity: "1",
                unit_amount: {
                  currency_code: "USD",
                  value: submission.formData.price.totalCost.toString(),
                },
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    //const transaction = orderData.purchase_units[0].payments.captures[0];
    return response.data;
  } catch (error) {
    let err = error;
    if (error.body) {
      err = error.body;
    }
    console.log(err);
    return err;
  }
}

// use the orders api to capture payment for an order
async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL.production}/v2/checkout/orders/${orderId}/capture`;

  const response = await axios.post(url, null, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  //   const data = await response.json();
  return response.data;
}

// generate an access token using client id and app secret
async function generateAccessToken() {
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET).toString(
    "base64"
  );
  const response = await axios.post(
    `${baseURL.production}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}

module.exports = { createOrder, capturePayment };
