var axios = require("axios");
const { findById } = require("../database/mongodbhelper");
const { sendEmail } = require("../email/emailhelper");
const { generateHtml } = require("../html/htmlhelper");

// "N" if the order came in between 11am and 6pm Pacific, or if the customer
// chose a later delivery date. Everything else is immediate ("I").
const getOrderTag = (formSubmission) => {
  if (formSubmission.formData.deliveryOptionValue === "Later Date") {
    return "N";
  }

  const orderedAt = formSubmission.createdAt
    ? new Date(formSubmission.createdAt)
    : new Date();
  const pacificHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      hour12: false,
    }).format(orderedAt)
  );

  return pacificHour >= 11 && pacificHour < 18 ? "N" : "I";
};

const createTicket = async (submissionId) => {
  const formSubmission = await findById(submissionId, "FormSubmissions");
  if (formSubmission == null || formSubmission.error) {
    console.log(
      "Error occurred trying to retrieve submission: " +
        submissionId +
        ". Error: " +
        formSubmission.error
    );
    return {
      error: formSubmission.error,
    };
  }

  const html_body = generateHtml(formSubmission);
  sendEmail(formSubmission.orderNumber, html_body);

  let data = JSON.stringify({
    ticket: {
      requester: {
        name: "BFV_Order",
        email: formSubmission.formData.email,
      },
      subject: "Order Update (" + formSubmission.orderNumber + ")",
      comment: {
        html_body: html_body,
      },
      tags: [getOrderTag(formSubmission)],
    },
  });
  const encodedCreds = Buffer.from(process.env.ZENDESK_CREDENTIALS).toString(
    "base64"
  );
  var config = {
    method: "POST",
    url: process.env.ZENDESK_URL,
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
};

module.exports = { createTicket };
