require("dotenv").config();

var Square = require("square");
const Client = Square.Client;
const crypto = require("crypto");

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const { paymentsApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: "production",
});

const createPayment = async (body) => {
  const { result } = await paymentsApi.createPayment({
    idempotencyKey: crypto.randomUUID(),
    sourceId: body.sourceId,
    amountMoney: {
      currency: "USD",
      amount: 100,
    },
  });
  console.log("body: " + JSON.stringify(result));
  return result;
};

module.exports = { createPayment };
