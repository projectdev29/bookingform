const path = require("path");
require("dotenv").config();

const express = require("express");
const { insert } = require("./database/mongodbhelper");
const { createTicket } = require("./zendesk/tickethelper");

const PORT = process.env.PORT || 3001;

const app = express();

app.get("/api/submission", async (req, res) => {
  let resp = await insert({ name: "foo", email: "bar" }, "FormSubmissions");
  res.json({ message: resp });
});

app.get("/api/ticket", (req, res) => {
  createTicket({}, "");
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
