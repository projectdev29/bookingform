require("dotenv").config();

var Square = require("square");
const Client = Square.Client;

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const { paymentsApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: "production",
});

const createPayment = async (body) => {
  const { result } = await paymentsApi.createPayment({
    idempotencyKey: randomUUID(),
    sourceId: body.sourceId,
    amountMoney: {
      currency: "USD",
      amount: 100,
    },
  });
  return result;
};

module.exports = { createPayment };
