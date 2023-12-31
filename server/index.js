const path = require("path");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const {
  insert,
  update,
  updateGiftCertificate,
} = require("./database/mongodbhelper");
const { createTicket } = require("./zendesk/tickethelper");
const { calculateTotal } = require("./pricing/pricinghelper");
const {
  createPayment,
  createPaymentForGiftCertificate,
} = require("./payments/pay");
const { validateCoupon, markCouponAsUsed } = require("./coupons/couponhelper");
const {
  createOrder,
  capturePayment,
  createOrderForGiftCertificate,
} = require("./payments/paypal");
const {
  activateGiftCertificate,
  insertGiftCertificate,
  getCertificateBalance,
  applyGiftCertificate,
} = require("./giftcertificate/giftcertificatehelper");

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
    createdAt: new Date(),
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
  res.status(200).json(result);
});

app.post("/api/pay-for-gift-certificate", async (req, res) => {
  const result = await createPaymentForGiftCertificate(req.body);
  res.status(200).json(result);
});

app.post("/api/ticket", async (req, res) => {
  await markCouponAsUsed(req.body.coupon);
  const result = createTicket(req.body.submissionId);
  res.status(200).json(result);
});

app.get("/api/coupon", async (req, res) => {
  const { email, coupon } = req.query;
  const result = await validateCoupon(coupon, email);
  res.send(result);
});

app.post("/api/create-paypal-order", async (req, res) => {
  const order = await createOrder(req.body);
  res.json(order);
});

app.post("/api/create-paypal-order-for-gift-certificate", async (req, res) => {
  const order = await createOrderForGiftCertificate(req.body);
  res.json(order);
});

// capture payment & store order information or fullfill order
app.post("/api/capture-paypal-order", async (req, res) => {
  const { orderID } = req.body;
  const captureData = await capturePayment(orderID);
  // TODO: store payment information such as the transaction ID
  res.json(captureData);
});

app.post("/api/create-gift-certificate", async (req, res) => {
  const cert = await insertGiftCertificate(
    req.body.formData.email,
    req.body.formData.amount,
    req.body.formData.fullName
  );
  res.json(cert);
});

app.post("/api/activate-gift-certificate", async (req, res) => {
  const cert = await activateGiftCertificate(
    req.body.formData.email,
    req.body.formData.amount,
    req.body.formData.fullName
  );
  res.json(cert);
});

app.post("/api/apply-gift-certificate", async (req, res) => {
  const { code, amount } = req.body;
  const cert = await applyGiftCertificate(code, amount);
  res.json(cert);
});

app.get("/api/get-certificate-balance", async (req, res) => {
  const result = await getCertificateBalance(req.query.code);
  res.send(result);
});

// called when a gift certificate form is updated
app.post("/api/update-gift-certificate", async (req, res) => {
  let resp = await updateGiftCertificate(req.body.certificate, req.body.id);
  res.json({ message: resp });
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
