const path = require("path");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { insert, update } = require("./database/mongodbhelper");
const { createTicket } = require("./zendesk/tickethelper");
const { calculateTotal } = require("./pricing/pricinghelper");
const { createPayment } = require("./payments/pay");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// called when a form is submitted
app.post("/api/submission", async (req, res) => {
  let resp = await insert(req.body, "FormSubmissions");
  res.json({ message: resp });
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

app.get("/api/pay", async (req, res) => {
  console.log("request.body: " + JSON.stringify(req.body));
  const result = await createPayment(req.body);
  res.status(200).json(result);
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
