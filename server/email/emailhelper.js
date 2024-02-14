var nodemailer = require("nodemailer");

const sendEmail = (orderNumber, html_body) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.ENCRYPTED_CREDS,
      },
    });

    var mailOptions = {
      from: "BFV_NewOrder <" + process.env.EMAIL + ">",
      to: process.env.EMAIL,
      subject: "Order Update (" + orderNumber + ")",
      html: html_body,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (err) {
    console.log("Error sending email: " + err);
  }
};

const sendGiftCertificateEmailConfirmation = (customerEmail, html_body) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.ENCRYPTED_CREDS,
      },
    });

    var mailOptions = {
      from: "Booking For Visa <" + process.env.EMAIL + ">",
      to: customerEmail,
      subject: "Here's your voucher code",
      html: html_body,
    };
    var selfMailOptions = {
      from: "Booking For Visa <" + process.env.EMAIL + ">",
      to: process.env.EMAIL,
      subject: "BFV Voucher Purchase!",
      html: html_body,
    };

    transporter.sendMail(selfMailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email to self sent: " + info.response);
      }
    });
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (err) {
    console.log("Error sending email: " + err);
  }
};

module.exports = { sendEmail, sendGiftCertificateEmailConfirmation };
