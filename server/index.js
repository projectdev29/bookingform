const path = require("path");

var axios = require("axios");
const express = require("express");
const { init } = require("./database/mongodbhelper");

const PORT = process.env.PORT || 3001;

const app = express();

app.get("/api/greeting", (req, res) => {
  init();
  res.json({ message: "Hello from server!" });
});

app.get("/api/ticket", (req, res) => {
  let data = JSON.stringify({
    ticket: {
      requester: {
        name: "BFV_Order",
        email: "babar_t@hotmail.com",
      },
      subject: "Testing do not send",
      comment: {
        html_body:
          "<style>tr:nth-child(odd) {background-color: #f2f2f2;}</style><table><tbody><tr><td><b> Email </b></td><td>babar_t@hotmail.com</td></tr><tr><td><b> Number of travelers </b></td><td>3</td></tr><tr><td><b> Traveler Name </b></td><td>Mr. Jon Smith<br>Smith, Jon</td></tr><tr><td><b> Traveler Name </b></td><td>Miss Elijah Smith<br>Smith, Elijah</td></tr><tr><td><b> Traveler Name </b></td><td>Mr. Bobby Halverson<br>Halverson, Bobby</td></tr><tr><td><b> Number of flight legs </b></td><td>3</td></tr><tr><td><b> Flying from </b></td><td>Seattle</td></tr><tr><td><b> Flying to </b></td><td>San Fransisco</td></tr><tr><td><b> Date <b></b></b></td><td>25 Mar 2023</td></tr><tr><td><b> Flying from </b></td><td>San Fransisco</td></tr><tr><td><b> Flying to </b></td><td>New Jersey</td></tr><tr><td><b> Date <b></b></b></td><td>27 Mar 2023</td></tr><tr><td><b> Flying from </b></td><td>New Jersey</td></tr><tr><td><b> Flying to </b></td><td>Seattle</td></tr><tr><td><b> Date <b></b></b></td><td>30 Mar 2023</td></tr><tr><td><b> Number of hotels </b></td><td>3</td></tr><tr><td><b> City </b></td><td>Seattle</td></tr><tr><td><b> Checkin </b></td><td>11 Mar 2023</td></tr><tr><td><b> Checkout </b></td><td>12 Mar 2023</td></tr><tr><td><b> City </b></td><td>San Fransisco</td></tr><tr><td><b> Checkin </b></td><td>13 Mar 2023</td></tr><tr><td><b> Checkout </b></td><td>14 Mar 2023</td></tr><tr><td><b> City </b></td><td>New Jersey</td></tr><tr><td><b> Checkin </b></td><td>15 Mar 2023</td></tr><tr><td><b> Checkout </b></td><td>16 Mar 2023</td></tr><tr><td><b> Delivery Option </b></td><td>Later Date</td></tr><tr><td><b> Special Instructions </b></td><td>none</td></tr><tr><td><b> Coupon </b></td><td>COUPON1</td></tr></tbody></table><p><Order summary: </p> <table><thead><tr><td><b> Item </b></td><td><b> Price </b></td></tr></thead><tbody><tr><td><b> Number of travelers - 3 </b></td><td>25</td></tr><tr><td><b> Additional flight legs - 3 </b></td><td>5</td></tr><tr><td><b> Number of hotels - 3 </b></td><td>20</td></tr><tr><td><b> TOTAL </b></td><td>$50</td></tr></tbody></table>",
      },
    },
  });
  const encodedCreds = Buffer.from(
    "admin@bookingforvisa.com:<credshere>"
  ).toString("base64");
  var config = {
    method: "POST",
    url: "https://blinkerbluetravel.zendesk.com/api/v2/tickets",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + encodedCreds, // Base64 encoded "username:password"
    },
    data: data,
  };
  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.get("*", (req, res) => {
  console.log("Hello from the app.");
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
