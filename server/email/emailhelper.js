var nodemailer = require("nodemailer");
const { generateReport } = require("../visa-score/visaScoreHelper");
const puppeteerCore = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const fs = require('fs').promises;
const path = require('path');

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

const createVisaScoreIntroductionEmailContent = (customerEmail, customerName, scoreData) => {
  const html_body = `
    <!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f6f8;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 700px;
      margin: 40px auto;
      background: #ffffff;
      padding: 32px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .header {
      text-align: center;
      background-color: #1a237e;
      color: white;
      padding: 30px 20px;
      border-radius: 10px 10px 0 0;
    }

    .header h1 {
      margin: 0;
      font-size: 2.4rem;
      font-weight: 500;
    }

    .header .subtitle {
      margin-top: 8px;
      font-size: 1.1rem;
      opacity: 0.95;
    }

    .content {
      padding: 24px 0;
    }

    .content p {
      margin: 16px 0;
    }

    .score-box {
      background-color: #e3f2fd;
      padding: 24px;
      text-align: center;
      border-radius: 10px;
      margin: 30px 0 20px;
    }

    .total-score {
      font-size: 48px;
      font-weight: bold;
      color: #0d47a1;
    }

    .score-box p {
      margin: 8px 0 0;
      font-size: 1.1rem;
    }

    .attachment-notice {
      background-color: #fff8e1;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 24px;
      margin: 30px 0;
      text-align: center;
    }

    .attachment-notice h3 {
      color: #856404;
      margin-bottom: 12px;
      font-size: 1.3rem;
    }

    .attachment-notice ul {
      text-align: left;
      display: inline-block;
      margin: 10px 0 0;
      padding-left: 20px;
    }

    .attachment-notice li {
      margin: 8px 0;
      color: #5f4b02;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #999;
      padding-top: 30px;
      border-top: 1px solid #eee;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking For Visa</h1>
      <p class="subtitle">Your Personalized Visa Score Report</p>
    </div>

    <div class="content">
      <p>Dear ${customerName},</p>

      <p>Thank you for using <strong>Booking For Visa</strong>'s assessment tool. We're pleased to share your personalized visa score report.</p>

      <div class="score-box">
        <div class="total-score">${scoreData.visaScore.total}/100</div>
        <p>Total Visa Score</p>
      </div>

      <div class="attachment-notice">
        <h3>📎 Your Detailed Report Is Attached</h3>
        <p>The PDF report includes your score breakdown by category, personalized recommendations and destination-specific insights.</p>
        
      </div>

      <p>Your score reflects factors such as nationality, travel history, financial strength, ties to home country, and documentation. A higher score suggests a stronger application profile and better visa approval odds.</p>

      <p>If you have questions or need support, feel free to contact our team anytime at <a href="mailto:admin@bookingforvisa.com">admin@bookingforvisa.com</a>.</p>

      <p>Warm regards,<br><strong>The Booking For Visa Team</strong></p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Booking For Visa. All rights reserved.</p>
    </div>
  </div>
</body>
</html>

    `;
  return html_body;
};
const generateOverallAssessment = (totalScore) => {
  let assessment = '';
  let color = '';
  
  if (totalScore >= 80) {
    assessment = `
      <div class="assessment excellent">
      <h3>Excellent Visa Profile</h3>
      <p>Your overall visa application profile is very strong, with a score of ${totalScore}/100. This suggests high readiness and low perceived risk.</p>
      <p>With this score, your application is likely to be viewed favorably by visa authorities, assuming supporting documents are accurate and complete.</p>
    </div>
    `;
    color = '#2e7d32';
  } else if (totalScore >= 65) {
    assessment = `
      <div class="assessment good">
      <h3>Strong Visa Profile</h3>
      <p>Your application score of ${totalScore}/100 indicates that you meet most expectations for a successful visa application.</p>
      <p>Ensure your documentation is well-organized and that your application presents a clear and consistent story.</p>
    </div>
    `;
    color = '#1976d2';
  } else if (totalScore >= 50) {
    assessment = `
      <div class="assessment moderate">
      <h3>Moderate Visa Profile</h3>
      <p>Your score of ${totalScore}/100 shows that your application has potential but may require improvements in some areas.</p>
      <p>Carefully review and strengthen your application before submission to boost your chances.</p>
    </div>
    `;
    color = '#f57c00';
  } else if (totalScore >= 35) {
    assessment = `
      <div class="assessment weak">
      <h3>Weak Visa Profile</h3>
      <p>Your current score of ${totalScore}/100 suggests your application may face challenges during review.</p>
      <p>Significant improvements are recommended to reduce the risk of rejection.</p>
    </div>
    `;
    color = '#d32f2f';
  } else {
    assessment = `
      <div class="assessment poor">
      <h3>Poor Visa Profile</h3>
      <p>Your score of ${totalScore}/100 indicates that your visa application is at high risk of rejection without substantial changes.</p>
      <p>We strongly recommend reviewing the detailed suggestions below and addressing all areas of concern before applying.</p>
    </div>
    `;
    color = '#c62828';
  }
  
  return assessment;
};

const createVisaScoreEmailContent = (customerEmail, customerName, scoreData) => {
  const { total, breakdown } = scoreData.visaScore;
  const improvementsHtml = generateReport(scoreData);
  
  const html_body = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
  body {
    font-family: 'Segoe UI', Roboto, sans-serif;
    background-color: #f4f6f8;
    color: #333;
    line-height: 1.6;
  }

  .container {
    max-width: 700px;
    margin: 0 auto;
    background: #ffffff;
    padding: 24px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .header {
    text-align: center;
    background-color: #1a237e;
    color: white;
    padding: 30px 20px;
    border-radius: 10px 10px 0 0;
  }

  .header h1 {
    margin: 0;
    font-size: 2.2rem;
    font-weight: 300;
  }

  .header .subtitle {
    margin: 8px 0 0 0;
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .report-header {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  }

  .report-header h2 {
    color: #1a237e;
    margin: 0 0 15px 0;
    font-size: 1.4rem;
    border-bottom: 2px solid #1a237e;
    padding-bottom: 8px;
  }

  .report-info {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 15px;
  }

  .info-group {
    flex: 1;
    min-width: 200px;
  }

  .info-label {
    font-weight: 600;
    color: #495057;
    font-size: 0.9rem;
    margin-bottom: 4px;
  }

  .info-value {
    color: #212529;
    font-size: 1rem;
  }

  .content {
    padding: 24px;
  }

  .score-box {
    background-color: #e3f2fd;
    padding: 24px;
    text-align: center;
    border-radius: 10px;
    margin: 20px 0;
  }

  .total-score {
    font-size: 48px;
    font-weight: bold;
    color: #0d47a1;
  }

  .breakdown h3 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 1.2rem;
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
  }

  .improvements {
  margin-top: 30px;
  padding: 24px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
}

.improvements h2 {
  font-size: 1.5rem;
  color: #1a237e;
  margin-bottom: 16px;
  border-bottom: 2px solid #cfd8dc;
  padding-bottom: 6px;
}

.suggestion-item {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.suggestion-item h3 {
  color: #1a237e;
  font-size: 1.15rem;
  margin-bottom: 10px;
}

.suggestion-item div {
  font-size: 0.95rem;
  color: #333;
}

.suggestion-item ul {
  margin-top: 8px;
  padding-left: 20px;
  color: #444;
}

.assessment {
  background: #f8f9fa;
  border-left: 4px solid;
  padding: 20px;
  margin: 20px 0;
  border-radius: 4px;
}

.assessment.excellent {
  border-left-color: #2e7d32;
  background: #f1f8e9;
}

.assessment.good {
  border-left-color: #1976d2;
  background: #e3f2fd;
}

.assessment.moderate {
  border-left-color: #f57c00;
  background: #fff3e0;
}

.assessment.weak {
  border-left-color: #d32f2f;
  background: #ffebee;
}

.assessment.poor {
  border-left-color: #c62828;
  background: #ffebee;
}

.assessment h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2rem;
  font-weight: 600;
}

.assessment p {
  margin-bottom: 12px;
  line-height: 1.5;
}

.assessment strong {
  color: #333;
}


  .footer {
    text-align: center;
    font-size: 12px;
    color: #999;
    padding-top: 30px;
  }
</style>

    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking For Visa</h1>
          <p class="subtitle">Visa Score Assessment Report</p>
        </div>
        
        
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>Thank you for using Booking For Visa's visa score assessment tool. Below is your detailed visa score report:</p>
          
          <div class="score-box">
            <p>Total Visa Score</p>
            <div class="total-score">${total}/100</div>
            
          </div>

          ${generateOverallAssessment(total)}
          
          ${improvementsHtml}

    
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Booking For Visa. All rights reserved.</p>
          
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

// const sendVisaScoreReport = (customerEmail, customerName, scoreData) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.ENCRYPTED_CREDS,
//       },
//     });

//     const { mailOptions } = createVisaScoreEmailContent(customerEmail, customerName, scoreData);

//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.log("Error sending visa score report: " + error);
//       } else {
//         console.log("Visa score report sent: " + info.response);
//       }
//     });
//   } catch (err) {
//     console.log("Error sending visa score report: " + err);
//   }
// };

const convertHtmlToPdf = async (htmlContent, outputPath = null) => {
  try {
    const isLambdaEnv = process.env.IS_CLOUD_ENV === "true";

    let launchOptions;
    if (isLambdaEnv) {
      launchOptions = {
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      };
    } else {
      const puppeteer = require('puppeteer'); // ✅ only required locally
      launchOptions = {
        executablePath: puppeteer.executablePath(),
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };
    }
      const browser = await puppeteerCore.launch(launchOptions);

  
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
      },
    });
    
    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    throw error;
  }
};

const createVisaScorePdf = async (customerEmail, customerName, scoreData) => {
  try {
    // Get the HTML content
    const { html_body } = createVisaScoreEmailContent(customerEmail, customerName, scoreData);
    
    // Convert to PDF
    const pdfBuffer = await convertHtmlToPdf(html_body);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error creating visa score PDF:', error);
    throw error;
  }
};

const sendVisaScoreReportWithPdf = async (customerEmail, customerName, scoreData, pdfBuffer) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.ENCRYPTED_CREDS,
      },
    });

    const html_body = createVisaScoreIntroductionEmailContent(customerEmail, customerName, scoreData);

    const mailOptions = {
      from: "Booking For Visa <" + process.env.EMAIL + ">",
      to: customerEmail,
      subject: "Your Visa Score Report",
      html: html_body,
      attachments: [
        {
          filename: `visa-score-report-${scoreData._id || 'report'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Visa score report with PDF sent successfully to:', customerEmail);
    
    return {
      success: true,
      messageId: result.messageId,
      email: customerEmail
    };
  } catch (error) {
    console.error('Error sending visa score report with PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { 
  sendEmail, 
  sendGiftCertificateEmailConfirmation,
  createVisaScoreEmailContent,
  convertHtmlToPdf,
  createVisaScorePdf,
  sendVisaScoreReportWithPdf
};