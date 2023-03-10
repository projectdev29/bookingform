require("dotenv").config();

import { Client } from "square";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const { paymentsApi } = new Client({
  accessToken: process.env.REACT_APP_SQUARE_ACCESS_TOKEN,
  environment: "sandbox",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { result } = await paymentsApi.createPayment({
      idempotencyKey: randomUUID(),
      sourceId: req.body.sourceId,
      amountMoney: {
        currency: "USD",
        amount: 100,
      },
    });
    console.log(result);
    res.status(200).json(result);
  } else {
    res.status(500).send();
  }
}
