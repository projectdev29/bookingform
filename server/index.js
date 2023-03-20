const path = require("path");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { insert, update } = require("./database/mongodbhelper");
const { createTicket } = require("./zendesk/tickethelper");
const { calculateTotal } = require("./pricing/pricinghelper");
const { createPayment } = require("./payments/pay");
const { validateCoupon } = require("./coupons/couponhelper");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// called when a form is submitted
app.post("/api/submission", async (req, res) => {
  const orderNumber = "BFV-" + Math.round(Date.now() / 1000);
  const submission = {
    ...req.body,
    orderNumber: orderNumber,
  };
  let resp = await insert(submission, "FormSubmissions");
  res.json({ message: { ...resp, orderNumber: orderNumber } });
});

// called when a form is updated
app.post("/api/update", async (req, res) => {
  let resp = await update(req.body.formData, req.body.id, "FormSubmissions");
  res.json({ message: resp });
});

// called when customer changes number of passengers/hotel/flights
app.post("/api/price", (req, res) => {
  let resp = calculateTotal(req.body);
  res.json({ message: resp });
});

//
app.get("/api/postpayment", (req, res) => {
  createTicket({}, "");
});

app.post("/api/pay", async (req, res) => {
  const result = await createPayment(req.body);
  // TODO: call zendesk to create a ticket
  // TODO: check if email needs to be sent. we could probably use zendesk for that.
  res.status(200).json(result);
});

app.get("/api/coupon", async (req, res) => {
  const { email, coupon } = req.query;
  const result = await validateCoupon(coupon, email);
  res.send(result);
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
