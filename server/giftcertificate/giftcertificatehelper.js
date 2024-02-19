const {
  insert,
  find,
  updateGiftCertificate,
  findById,
  update,
} = require("../database/mongodbhelper");
const {
  sendGiftCertificateEmailConfirmation,
} = require("../email/emailhelper");
const { generateGiftCertificateFormattedHtml } = require("../html/htmlhelper");

// activate must be called to mark it active. it should be done after successful payment
const insertGiftCertificate = async (email, amount, discount, fullName) => {
  const giftCertificateCode = generateGiftCertificateCode();
  const certificate = {
    active: false,
    code: giftCertificateCode,
    email: email,
    amount: amount,
    discount: discount,
    remainingAmount: amount,
    fullName: fullName,
  };
  const result = await insert(certificate, "GiftCertificates");
  if (result && result.succeeded) {
    return {
      valid: true,
      id: result.id,
      ...certificate,
    };
  } else {
    return { valid: false, error: result.error };
  }
};

const getCertificateBalance = async (code) => {
  const filter = { code: code };
  const certificate = await find(filter, "GiftCertificates");
  if (!certificate || certificate == null || certificate.notFound) {
    return {
      error: "Invalid certificate code.",
    };
  }
  return certificate;
};
const updateGiftCertificateBeforeActivation = async (certificate, id) => {
  const certToUpdate = {
    remainingAmount: certificate.amount,
    ...certificate,
  };
  return await updateGiftCertificate(certToUpdate, id);
};
const activateGiftCertificate = async (submissionId) => {
  const certificate = await findById(submissionId, "GiftCertificates");
  if (certificate.notFound) {
    console.log(
      "Certificate not found. This should never happen. SubmissionId: " +
        submissionId
    );
    return {};
  }
  const updatedCert = {
    ...certificate,
    active: true,
  };

  const result = await updateGiftCertificate(updatedCert, submissionId);
  if (result.succeeded) {
    // send email to customer
    const html_body = await generateGiftCertificateFormattedHtml(updatedCert);
    sendGiftCertificateEmailConfirmation(updatedCert.email, html_body);

    return updatedCert;
  } else {
    return result;
  }
};

const validateGiftCertificate = async (code, submissionId) => {
  const submission = await findById(submissionId, "FormSubmissions");
  if (submission.notFound) {
    console.log(
      "This should not happen. Submission Id not found: " + submissionId
    );
    return submission.error;
  }
  if (
    !submission.formData ||
    !submission.formData.price ||
    !submission.formData.price.totalCost ||
    submission.formData.price.totalCost < 0
  ) {
    return {
      error: "Invalid form submission id.",
    };
  }

  const filter = { code: code };
  const certificate = await find(filter, "GiftCertificates");
  if (!certificate || certificate == null || certificate.notFound) {
    return {
      error: "Invalid certificate code.",
    };
  }
  const price = submission.formData.price;
  const applicableAmount =
    price.passengerCost +
    (price.additionalFlightCost ? price.additionalFlightCost : 0) +
    (price.hotelCost ? price.hotelCost : 0) -
    (price.discount ? price.discount : 0);

  let appliedAmount = 0;
  if (applicableAmount <= certificate.remainingAmount) {
    appliedAmount = applicableAmount;
  } else {
    appliedAmount = certificate.remainingAmount;
  }
  const remainingAmount = certificate.remainingAmount - appliedAmount;

  let updatedFormData = {
    ...submission.formData,
    price: {
      ...price,
      totalCost: applicableAmount - appliedAmount,
      giftCertificateAppliedAmount: appliedAmount,
      giftCertificateRemainingBalance: remainingAmount,
    },
  };
  await update(updatedFormData, submissionId, "FormSubmissions");

  const updatedCert = {
    ...certificate,
    remainingAmount: remainingAmount,
    appliedAmount: appliedAmount,
    totalCost: applicableAmount - appliedAmount,
  };
  return updatedCert;
};

const deductAmountFromGiftCertificate = async (code, amount) => {
  const filter = { code: code };
  const certificate = await find(filter, "GiftCertificates");
  if (!certificate || certificate == null || certificate.notFound) {
    return {
      error: "Invalid certificate code.",
    };
  }
  let appliedAmount = 0;
  if (amount <= certificate.remainingAmount) {
    appliedAmount = amount;
  } else {
    return {
      succeeded: false,
      error: "Insufficient balance for the specified amount.",
    };
  }
  const remainingAmount = certificate.remainingAmount - appliedAmount;
  const updatedCert = {
    ...certificate,
    remainingAmount: remainingAmount,
  };
  const result = await updateGiftCertificate(
    updatedCert,
    updatedCert._id.toString()
  );
  if (result.succeeded) {
    return updatedCert;
  } else {
    return result;
  }
};

const generateGiftCertificateCode = () => {
  const length = 25;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let giftCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    giftCode += characters.charAt(randomIndex);
  }

  return giftCode;
};

module.exports = {
  activateGiftCertificate,
  insertGiftCertificate,
  validateGiftCertificate,
  getCertificateBalance,
  updateGiftCertificateBeforeActivation,
  deductAmountFromGiftCertificate,
};
