const path = require("path");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { insert, update, findById, updatePaymentStatus } = require("./database/mongodbhelper");
const { createTicket } = require("./zendesk/tickethelper");
const { calculateTotal } = require("./pricing/pricinghelper");
const {
  createPayment,
  createPaymentForGiftCertificate,
  createPaymentForVisaScore,
} = require("./payments/pay");
const { validateCoupon, markCouponAsUsed } = require("./coupons/couponhelper");
const {
  createOrder,
  capturePayment,
  createOrderForGiftCertificate,
} = require("./payments/paypal");
const {
  activateGiftCertificate,
  insertGiftCertificate,
  getCertificateBalance,
  validateGiftCertificate,
  updateGiftCertificateBeforeActivation,
  deductAmountFromGiftCertificate,
} = require("./giftcertificate/giftcertificatehelper");
const { submitVisaScore } = require("./visa-score/visaScoreHelper");
const { createVisaScoreEmailContent, sendVisaScoreReport, createVisaScorePdf } = require("./email/emailhelper");
const { sendVisaScoreReportWithPdf } = require("./email/emailhelper");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// called when a form is submitted
app.post("/api/submission", async (req, res) => {
  const orderNumber = "BFV-" + Math.round(Date.now() / 1000);
  const submission = {
    ...req.body,
    orderNumber: orderNumber,
    createdAt: new Date(),
  };
  let resp = await insert(submission, "FormSubmissions");
  res.json({ message: { ...resp, orderNumber: orderNumber } });
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

app.post("/api/pay", async (req, res) => {
  const result = await createPayment(req.body);
  res.status(200).json(result);
});

app.post("/api/pay-for-gift-certificate", async (req, res) => {
  const result = await createPaymentForGiftCertificate(req.body);
  res.status(200).json(result);
});

app.post("/api/pay-for-visa-score", async (req, res) => {
  try {
    console.log('Received pay-for-visa-score request:', JSON.stringify(req.body, null, 2));
    
    // Validate request body
    if (!req.body) {
      console.error('No request body provided');
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Request body is required' 
      });
    }

    // Get the visa score submission first
    const submission = await findById(req.body.submissionId, "VisaScores");
    if (submission.notFound) {
      return res.status(404).json({
        success: false,
        error: "Visa score submission not found"
      });
    }

    // Extract email and name from submission
    const customerEmail = submission.email;
    const customerName = submission.fullName || `${submission.firstName || ''} ${submission.lastName || ''}`.trim();
    
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        error: "Customer email not found in submission"
      });
    }

    // Step 1: Generate PDF first
    let pdfResult = { success: false, error: null };
    try {
      console.log('Generating PDF for visa score submission:', req.body.submissionId);
      const pdfBuffer = await createVisaScorePdf(customerEmail, customerName, submission);
      pdfResult = { success: true, buffer: pdfBuffer };
      console.log('PDF generated successfully');
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      pdfResult = { success: false, error: pdfError.message };
    }

    // Step 2: Process payment
    const paymentResult = await createPaymentForVisaScore(req.body);
    console.log('Payment result:', JSON.stringify(paymentResult, null, 2));
    
    // Step 3: If payment is successful, mark the submission as paid and send email
    let emailResult = { success: false, error: null };
    if (paymentResult.payment && paymentResult.payment.status === 'COMPLETED') {
      try {
        const updateResult = await updatePaymentStatus(
          req.body.submissionId, 
          true,
          "VisaScores"
        );
        
        if (updateResult.succeeded) {
          console.log('Successfully marked visa score submission as paid:', req.body.submissionId);
          
          // Send email with PDF if PDF generation was successful
          if (pdfResult.success) {
            try {
              console.log('Sending email with PDF attachment');
              emailResult = await sendVisaScoreReportWithPdf(customerEmail, customerName, submission, pdfResult.buffer);
              console.log('Email sent successfully');
            } catch (emailError) {
              console.error('Email sending failed:', emailError);
              emailResult = { success: false, error: emailError.message };
            }
          } else {
            // Send regular email without PDF if PDF generation failed
            try {
              console.log('Sending regular email (PDF generation failed)');
              emailResult = await sendVisaScoreReport(customerEmail, customerName, submission);
              console.log('Regular email sent successfully');
            } catch (emailError) {
              console.error('Regular email sending failed:', emailError);
              emailResult = { success: false, error: emailError.message };
            }
          }
        } else {
          console.error('Failed to mark submission as paid:', updateResult.error);
        }
      } catch (updateError) {
        console.error('Error updating submission payment status:', updateError);
      }
    }
    
    // Step 4: Return comprehensive response
    const response = {
      success: paymentResult.payment && paymentResult.payment.status === 'COMPLETED',
      payment: paymentResult,
      pdf: {
        generated: pdfResult.success,
        error: pdfResult.error
      },
      email: {
        sent: emailResult.success,
        error: emailResult.error,
        address: customerEmail
      },
      submissionId: req.body.submissionId
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in pay-for-visa-score endpoint:', error);
    console.error('Error stack:', error.stack);
    
    // Ensure we always return JSON, never HTML
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    });
  }
});


app.post("/api/ticket", async (req, res) => {
  await markCouponAsUsed(req.body.coupon);
  const result = createTicket(req.body.submissionId);
  res.status(200).json(result);
});

app.get("/api/coupon", async (req, res) => {
  const { email, coupon } = req.query;
  const result = await validateCoupon(coupon, email);
  res.send(result);
});

app.post("/api/create-paypal-order", async (req, res) => {
  const order = await createOrder(req.body);
  res.json(order);
});

app.post("/api/create-paypal-order-for-gift-certificate", async (req, res) => {
  const order = await createOrderForGiftCertificate(req.body);
  res.json(order);
});

// capture payment & store order information or fullfill order
app.post("/api/capture-paypal-order", async (req, res) => {
  const { orderID } = req.body;
  const captureData = await capturePayment(orderID);
  // TODO: store payment information such as the transaction ID
  res.json(captureData);
});

app.post("/api/create-gift-certificate", async (req, res) => {
  const cert = await insertGiftCertificate(
    req.body.formData.email,
    req.body.formData.amount,
    req.body.formData.discount,
    req.body.formData.fullName
  );
  res.json(cert);
});

app.post("/api/activate-gift-certificate", async (req, res) => {
  const cert = await activateGiftCertificate(req.body.submissionId);
  res.json(cert);
});

app.get("/api/validate-gift-certificate", async (req, res) => {
  const code = req.query.code;
  const submissionId = req.query.submissionId;
  const cert = await validateGiftCertificate(code, submissionId);
  res.json(cert);
});

app.post("/api/deduct-amount-from-gift-certificate", async (req, res) => {
  const email = req.body.email;
  const code = req.body.code;
  const amount = req.body.amount;
  const cert = await deductAmountFromGiftCertificate(code, amount);
  res.json(cert);
});

app.get("/api/get-certificate-balance", async (req, res) => {
  const result = await getCertificateBalance(req.query.code);
  res.send(result);
});

// called when a gift certificate form is updated
app.post("/api/update-gift-certificate", async (req, res) => {
  let resp = await updateGiftCertificateBeforeActivation(
    req.body.certificate,
    req.body.id
  );
  res.json({ message: resp });
});

// Submit visa score endpoint (freemium - returns partial score)
app.post("/api/submit-visa-score", async (req, res) => {
  const result = await submitVisaScore(req.body);
  if (result.success) {
    res.status(200).json({
      visaScore: result.visaScore,
      submissionId: result.data.id || result.data.insertedId
    });
  } else {
    res.status(400).json({ error: result.error });
  }
});


app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
