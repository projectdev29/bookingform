var nodemailer = require("nodemailer");
const { generateReport } = require("../visa-score/visaScoreHelper");

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

const createVisaScoreEmailContent = (customerEmail, customerName, scoreData) => {
  const { total, breakdown } = scoreData;
  const improvementsHtml = generateReport(scoreData);
  
  const html_body = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; background-color: #1a237e; color: white; }
        .logo { max-width: 200px; margin-bottom: 10px; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .score-box { 
          text-align: center; 
          padding: 20px; 
          margin: 20px 0; 
          background-color: #e8eaf6; 
          border-radius: 8px;
        }
        .total-score {
          font-size: 48px;
          font-weight: bold;
          color: #1a237e;
        }
        .breakdown {
          margin: 20px 0;
        }
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
        }
        .improvements {
          margin-top: 30px;
          padding: 20px;
          background-color: #f0f4c3;
          border: 1px solid #dce775;
          border-radius: 8px;
        }
        .suggestion-item {
          margin-bottom: 15px;
        }
        .suggestion-item h3 {
          color: #33691e;
          margin-bottom: 5px;
        }
        .suggestion-item div ul {
          padding-left: 20px;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Visa Score Report</h1>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Powered by Booking For Visa</p>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>Thank you for using Booking For Visa's visa score assessment tool. Below is your detailed visa score report:</p>
          
          <div class="score-box">
            <div class="total-score">${total}</div>
            <p>Total Visa Score</p>
          </div>

          <div class="breakdown">
            <h3>Score Breakdown:</h3>
            <div class="breakdown-item">
              <span>Nationality Score:</span>
              <span>${breakdown.nationality} points</span>
            </div>
            <div class="breakdown-item">
              <span>Travel History:</span>
              <span>${breakdown.travel} points</span>
            </div>
            <div class="breakdown-item">
              <span>Financial Strength:</span>
              <span>${breakdown.financial} points</span>
            </div>
            <div class="breakdown-item">
              <span>Ties to Home Country:</span>
              <span>${breakdown.ties} points</span>
            </div>
            <div class="breakdown-item">
              <span>Documentation:</span>
              <span>${breakdown.documents} points</span>
            </div>
            <div class="breakdown-item">
              <span>Risk Assessment:</span>
              <span>${breakdown.risk} points</span>
            </div>
            <div class="breakdown-item">
              <span>Country Difficulty Adjustment:</span>
              <span>${breakdown.visitingCountry} points</span>
            </div>
          </div>

          <p>This score is based on various factors including your nationality, travel history, financial situation, and documentation. A higher score indicates a stronger visa application profile.</p>
          
          ${improvementsHtml}

          <p>For personalized assistance with your visa application, please contact our visa experts at support@bookingforvisa.com.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Booking For Visa. All rights reserved.</p>
          <p>This is an automated message, please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: "Booking For Visa <" + process.env.EMAIL + ">",
    to: customerEmail,
    subject: "Your Visa Score Report - Booking For Visa",
    html: html_body,
  };

  return { mailOptions, html_body };
};

const sendVisaScoreReport = (customerEmail, customerName, scoreData) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.ENCRYPTED_CREDS,
      },
    });

    const { mailOptions } = createVisaScoreEmailContent(customerEmail, customerName, scoreData);

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending visa score report: " + error);
      } else {
        console.log("Visa score report sent: " + info.response);
      }
    });
  } catch (err) {
    console.log("Error sending visa score report: " + err);
  }
};

module.exports = { 
  sendEmail, 
  sendGiftCertificateEmailConfirmation,
  sendVisaScoreReport,
  createVisaScoreEmailContent
};