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
  
  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'badge-excellent';
    if (score >= 65) return 'badge-good';
    if (score >= 50) return 'badge-moderate';
    if (score >= 35) return 'badge-weak';
    return 'badge-poor';
  };
  
  const getScoreBadgeText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Moderate';
    if (score >= 35) return 'Weak';
    return 'Poor';
  };
  
  const html_body = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
  body {
    font-family: 'Segoe UI', Roboto, sans-serif;
    background-color: #ffffff;
    color: #2c3e50;
    line-height: 1.7;
    margin: 0;
    padding: 0;
  }

  .container {
    width: 100%;
    max-width: none;
    margin: 0;
    background: #ffffff;
    padding: 0;
  }

  .header {
    text-align: center;
    background-color: #1a237e;
    color: white;
    padding: 25px 20px;
    margin-bottom: 30px;
  }

  .header h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: 1px;
  }

  .header .subtitle {
    margin: 8px 0 0 0;
    font-size: 1rem;
    opacity: 0.95;
    font-weight: 300;
  }

  .content {
    padding: 0 20px;
  }

  .content p {
    margin: 15px 0;
    font-size: 0.95rem;
    color: #34495e;
  }

  .score-section {
    text-align: center;
    margin: 30px 0 40px 0;
    padding: 30px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 3px solid #1a237e;
    border-radius: 15px;
    position: relative;
    overflow: hidden;
  }

  .score-label {
    font-size: 1.1rem;
    color: #1a237e;
    margin-bottom: 15px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .score-gauge {
    position: relative;
    width: 180px;
    height: 180px;
    margin: 10px auto;
    background: conic-gradient(from 0deg, #e74c3c 0deg 72deg, #f39c12 72deg 144deg, #f1c40f 144deg 216deg, #27ae60 216deg 288deg, #2ecc71 288deg 360deg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .score-gauge::before {
    content: '';
    position: absolute;
    width: 160px;
    height: 160px;
    background-color: white;
    border-radius: 50%;
    box-shadow: inset 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .score-content {
    position: relative;
    z-index: 2;
    text-align: center;
  }

  .total-score {
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    line-height: 1;
    background: linear-gradient(45deg, #1a237e, #3f51b5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .score-max {
    font-size: 1rem;
    color: #6c757d;
    font-weight: 500;
    margin-top: 5px;
  }

  .score-badge {
    display: inline-block;
    padding: 8px 20px;
    border-radius: 25px;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 15px;
  }

  .badge-excellent { background-color: #27ae60; color: white; }
  .badge-good { background-color: #3498db; color: white; }
  .badge-moderate { background-color: #f39c12; color: white; }
  .badge-weak { background-color: #e74c3c; color: white; }
  .badge-poor { background-color: #c0392b; color: white; }

  .assessment {
    padding: 25px 30px;
    margin: 25px 0;
    background-color: #fafbfc;
    border: 1px solid #e8ecef;
  }

  .assessment.excellent {
    background-color: #f8fff8;
  }

  .assessment.good {
    background-color: #f0f8ff;
  }

  .assessment.moderate {
    background-color: #fffbf0;
  }

  .assessment.weak {
    background-color: #fff8f8;
  }

  .assessment.poor {
    background-color: #fff5f5;
  }

  .assessment h3 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 1.4rem;
    font-weight: 700;
    color: #2c3e50;
  }

  .assessment {
    page-break-after: always;
  }

  .assessment p {
    margin-bottom: 10px;
    line-height: 1.5;
    color: #34495e;
  }

  .improvements {
    margin-top: 35px;
  }

  .improvements h2 {
    font-size: 1.8rem;
    color: #1a237e;
    margin-bottom: 25px;
    border-bottom: 3px solid #1a237e;
    padding-bottom: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .suggestion-item {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #ffffff;
    border: 1px solid #e8ecef;
  }

  .destination-advice {
    page-break-before: always;
  }

  .suggestion-item h3 {
    color: #1a237e;
    font-size: 1.3rem;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .suggestion-item div {
    font-size: 0.9rem;
    color: #34495e;
    line-height: 1.5;
  }

  .suggestion-item ul {
    margin-top: 8px;
    padding-left: 18px;
    color: #34495e;
  }

  .suggestion-item li {
    margin-bottom: 4px;
    font-size: 0.9rem;
  }

  .footer {
    text-align: center;
    font-size: 11px;
    color: #7f8c8d;
    padding-top: 40px;
    margin-top: 40px;
    border-top: 1px solid #ecf0f1;
  }

  /* Print optimizations */
  @media print {
    body { 
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .header {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .score-section {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
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
          
          <div class="score-section">
            <div class="score-label">Total Visa Score</div>
            <div class="score-gauge">
              <div class="score-content">
                <div class="total-score">${total}</div>
                <div class="score-max">out of 100</div>
              </div>
            </div>
            <div class="score-badge ${getScoreBadgeClass(total)}">${getScoreBadgeText(total)}</div>
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
    const chromePath = await chromium.executablePath;
    const isCloudEnv = !!chromePath; // true if App Platform or Lambda

    let launchOptions;

    if (isCloudEnv) {
      console.log("Using Chrome from App Platform or Lambda");
      launchOptions = {
        args: chromium.args,
        executablePath: chromePath,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      };
    } else {
      console.log("Using Chrome from local machine");
      const puppeteer = require('puppeteer'); // only loaded locally
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
    
    // Convert to PDF using PDFShift
    const pdfBuffer = await generateVisaScorePdfWithPdfShift(html_body);
    
    // Commented out old Puppeteer method:
    // const pdfBuffer = await convertHtmlToPdf(html_body);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error creating visa score PDF:', error);
    throw error;
  }
};

const generateVisaScorePdfWithPdfShift = async (html_body) => {
  try {
    const fetch = require('node-fetch');

    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
        method: 'POST',
        headers: {
            'X-API-Key': process.env.PDFSHIFT_API_KEY ,
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            source: html_body,
            landscape: false,
            use_print: false,
            margin: {
                top: "1in",
                right: "1in", 
                bottom: "1in",
                left: "1in"
            }
        })
    });

    if (!response.ok) {
        throw new Error(`PDFShift API error: ${response.status} ${response.statusText}`);
    }

    const pdfBuffer = await response.buffer();
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating visa score PDF with PDFShift:', error);
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
  generateVisaScorePdfWithPdfShift,
  sendVisaScoreReportWithPdf
};