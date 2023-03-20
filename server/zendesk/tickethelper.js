var axios = require("axios");
const { findById } = require("../database/mongodbhelper");
const { sendEmail } = require("../email/emailhelper");
const { generateHtml } = require("../html/htmlhelper");

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
