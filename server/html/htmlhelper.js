const fs = require("fs").promises;
const path = require("path");
const dayjs = require("dayjs");
const juice = require("juice");
const generateHtml = (formSubmission) => {
  //
  let html_body =
    "<style>tr:nth-child(odd) {background-color: #f2f2f2;} td:first-child {width: 20%;} td:last-child {width: 80%;}</style><table><tbody>" +
    "<tr><td><b> Email </b></td><td>" +
    formSubmission.formData.email +
    "</td></tr>" +
    "<tr><td><b> Number of travelers </b></td><td>" +
    formSubmission.formData.numberOfPassengers +
    "</td></tr>";
  for (let i = 0; i < formSubmission.formData.numberOfPassengers; i++) {
    html_body += "<tr><td><b> Traveler Name </b></td><td>";
    let nameObj = formSubmission.formData.passengerNames[i];
    let title =
      formSubmission.formData.titles &&
      formSubmission.formData.titles.length > i
        ? formSubmission.formData.titles[i] + " "
        : "";
    if (!title) {
      title = "";
    }
    let fullName =
      title +
      nameObj.firstName +
      " " +
      nameObj.lastName +
      "<br>" +
      nameObj.lastName +
      ", " +
      nameObj.firstName +
      "</td></tr>";
    html_body += fullName;
  }
  html_body +=
    "<tr><td><b> Number of flight legs </b></td><td>" +
    formSubmission.formData.numberOfFlights +
    "" +
    "</td></tr>";
  for (let i = 0; i < formSubmission.formData.numberOfFlights; i++) {
    let flightDetailsObj = formSubmission.formData.flightDetails[i];
    html_body +=
      "<tr><td><b> Flying from </b></td><td>" +
      flightDetailsObj.from +
      "</td></tr><tr><td><b> Flying to </b></td><td>" +
      flightDetailsObj.to +
      "</td></tr><tr><td><b> Date </b></td><td>" +
      flightDetailsObj.flightDateFormatted +
      //? flightDetailsObj.formattedFlightDate
      //: "placeholder" + //dayjs(flightDetailsObj.flightDate).format("MMM D YYYY") +
      "</td></tr>";
  }
  if (formSubmission.formData.addHotel) {
    html_body +=
      "<tr><td><b> Number of hotels </b></td><td>" +
      formSubmission.formData.numberOfHotels +
      "" +
      "</td></tr>";

    for (let i = 0; i < formSubmission.formData.numberOfHotels; i++) {
      let hotelDetailsObj = formSubmission.formData.hotelDetails[i];
      html_body +=
        "<tr><td><b> City </b></td><td>" +
        hotelDetailsObj.city +
        "</td></tr><tr><td><b> Check-in date </b></td><td>" +
        hotelDetailsObj.inDateFormatted + // ? dayjs(hotelDetailsObj.inDate).format("MMM D YYYY") +
        "</td></tr><tr><td><b> Check-out date </b></td><td>" +
        hotelDetailsObj.outDateFormatted + //dayjs(hotelDetailsObj.outDate).format("MMM D YYYY") +
        "</td></tr>";
    }
  }

  html_body +=
    "<tr><td><b> Delivery Option </b></td><td>" +
    formSubmission.formData.deliveryOptionValue +
    "" +
    "</td></tr>";

  if (formSubmission.formData.deliveryOptionValue === "Later Date") {
    html_body +=
      "<tr><td><b> Delivery Date </b></td><td>" +
      formSubmission.formData.deliveryDate +
      // dayjs(formSubmission.formData.deliveryDate).format("MMM D YYYY") +
      "" +
      "</td></tr>";
  }
  html_body +=
    "<tr><td><b> Special instructions </b></td><td>" +
    formSubmission.formData.specialInstructions +
    "" +
    "</td></tr>";

  if (formSubmission.formData.coupon) {
    html_body +=
      "<tr><td><b> Coupon </b></td><td>" +
      formSubmission.formData.coupon +
      "" +
      "</td></tr>";
  }
  html_body +=
    "</tbody></table><p><Order summary: </p> <table><thead><tr><td><b> Item </b></td><td><b> Price </b></td></tr></thead><tbody>";
  html_body +=
    "<tr><td><b> Number of travelers x " +
    formSubmission.formData.numberOfPassengers +
    "</b></td>";
  html_body +=
    "<td>$" + formSubmission.formData.price.passengerCost + "</td></tr>";
  if (
    formSubmission.formData.price.additionalFlightCost &&
    formSubmission.formData.price.additionalFlightCost > 0
  ) {
    html_body +=
      "<tr><td><b> Additional flight legs </b></td><td>$" +
      formSubmission.formData.price.additionalFlightCost +
      "</td></tr>";
  }
  if (formSubmission.formData.addHotel) {
    html_body +=
      "<tr><td><b> Number of hotels x " +
      formSubmission.formData.numberOfHotels +
      " </b></td><td>$" +
      formSubmission.formData.price.hotelCost +
      "</td></tr>";
  }

  if (formSubmission.formData.price.discount) {
    html_body +=
      "<tr><td><b> Discount </b></td><td>-$" +
      formSubmission.formData.price.discount +
      "</td></tr>";
  }
  html_body +=
    "<tr><td><b> TOTAL </b></td><td>$" +
    formSubmission.formData.price.totalCost +
    "</td></tr></tbody></table>";

  return juice(html_body);
};

const generateGiftCertificateHtml = (giftCertificate) => {
  let html_body =
    "<style>tr:nth-child(odd) {background-color: #f2f2f2;} td:first-child {width: 20%;} td:last-child {width: 80%;}</style><table><tbody><tr><td><b> Email </b></td><td>" +
    giftCertificate.email +
    "</td></tr><tr><td><b> Customer Name </b></td><td>" +
    giftCertificate.fullName +
    "</td></tr>";

  html_body +=
    "<tr><td><b> Total Amount </b></td><td>$" +
    giftCertificate.amount +
    "</td></tr>";

  html_body +=
    "<tr><td><b> Code </b></td><td>" + giftCertificate.code + "</td></tr>";

  html_body += "</tbody></table>";
  return juice(html_body);
};

const generateGiftCertificateFormattedHtml = async (giftCertificate) => {
  const filePath = path.join(__dirname, "giftcertificateemailtemplate.html");
  let html_content = await fs.readFile(filePath, "utf8");
  // before updating the template make sure these 4 keywords
  // are not used anywhere else in the template otherwise it will replace those values as well
  html_content = html_content.replace("ddd", giftCertificate.code);
  html_content = html_content.replace("aaa", giftCertificate.amount);
  html_content = html_content.replace("ccc", giftCertificate.discount);
  html_content = html_content.replace(
    "bbb",
    giftCertificate.amount - giftCertificate.discount
  );
  return juice(html_content);
};

module.exports = {
  generateHtml,
  generateGiftCertificateHtml,
  generateGiftCertificateFormattedHtml,
};
