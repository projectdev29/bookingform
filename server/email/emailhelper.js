var nodemailer = require("nodemailer");
const { generateReport } = require("../visa-score/visaScoreHelper");
const puppeteer = require('puppeteer');
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

          <p>The score is based on various factors including your nationality, travel history, financial situation, and documentation. A higher score indicates a stronger visa application profile.</p>
          
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

const convertHtmlToPdf = async (htmlContent, outputPath = null) => {
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    // If output path is provided, save to file
    if (outputPath) {
      await fs.writeFile(outputPath, pdfBuffer);
      console.log(`PDF saved to: ${outputPath}`);
    }
    
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

    const { html_body } = createVisaScoreEmailContent(customerEmail, customerName, scoreData);

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
  sendVisaScoreReport,
  createVisaScoreEmailContent,
  convertHtmlToPdf,
  createVisaScorePdf,
  sendVisaScoreReportWithPdf
};