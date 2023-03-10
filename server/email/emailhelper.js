const generateHtml = (result) => {
  const {
    email,
    numberOfPassengers,
    passengerNames,
    numberOfFlights,
    flightDetails,
    addHotel,
    numberOfHotels,
    hotelDetails,
    deliveryOptionValue,
    specialInstructions,
    coupon,
  } = { ...result };
  const table = document.createElement("table");
  const tbody = table.createTBody();

  // Create table header row
  const emailRow = tbody.insertRow();
  emailRow.insertCell().innerHTML = "<b> Email </b>";
  emailRow.insertCell().textContent = email;
  const numPassengersRow = tbody.insertRow();
  numPassengersRow.insertCell().innerHTML = "<b> Number of travelers </b>";
  numPassengersRow.insertCell().textContent = numberOfPassengers;
  for (let i = 0; i < numberOfPassengers; i++) {
    let passengerName = passengerNames[i];
    const passengerRow = tbody.insertRow();
    passengerRow.insertCell().innerHTML = "<b> Traveler Name </b>";
    passengerRow.insertCell().innerHTML =
      passengerName.title +
      " " +
      passengerName.first +
      " " +
      passengerName.last +
      "<br/>" +
      passengerName.last +
      ", " +
      passengerName.first;
  }
  const numFlightsRow = tbody.insertRow();
  numFlightsRow.insertCell().innerHTML = "<b> Number of flight legs </b>";
  numFlightsRow.insertCell().textContent = numberOfFlights;
  for (let i = 0; i < numberOfFlights; i++) {
    let flightDetail = flightDetails[i];
    const flightFromRow = tbody.insertRow();
    flightFromRow.insertCell().innerHTML = "<b> Flying from </b>";
    flightFromRow.insertCell().textContent = flightDetail.from;
    const flightToRow = tbody.insertRow();
    flightToRow.insertCell().innerHTML = "<b> Flying to </b>";
    flightToRow.insertCell().textContent = flightDetail.to;
    const flightDateRow = tbody.insertRow();
    flightDateRow.insertCell().innerHTML = "<b> Date <b>";
    flightDateRow.insertCell().textContent =
      flightDetail.flightDate.format("DD MMM YYYY");
  }

  if (addHotel) {
    const numHotelsRow = tbody.insertRow();
    numHotelsRow.insertCell().innerHTML = "<b> Number of hotels </b>";
    numHotelsRow.insertCell().textContent = numberOfHotels;
    for (let i = 0; i < numberOfHotels; i++) {
      let hotelDetail = hotelDetails[i];
      const hotelCityRow = tbody.insertRow();
      hotelCityRow.insertCell().innerHTML = "<b> City </b>";
      hotelCityRow.insertCell().textContent = hotelDetail.city;
      const checkinDateRow = tbody.insertRow();
      checkinDateRow.insertCell().innerHTML = "<b> Checkin </b>";
      checkinDateRow.insertCell().textContent =
        hotelDetail.checkinDate.format("DD MMM YYYY");

      const checkoutDateRow = tbody.insertRow();
      checkoutDateRow.insertCell().innerHTML = "<b> Checkout </b>";
      checkoutDateRow.insertCell().textContent =
        hotelDetail.checkoutDate.format("DD MMM YYYY");
    }
  }
  const deliveryOptionRow = tbody.insertRow();
  deliveryOptionRow.insertCell().innerHTML = "<b> Delivery Option </b>";
  deliveryOptionRow.insertCell().textContent = deliveryOptionValue;

  const specialInstructionsRow = tbody.insertRow();
  specialInstructionsRow.insertCell().innerHTML =
    "<b> Special Instructions </b>";
  specialInstructionsRow.insertCell().textContent = specialInstructions
    ? specialInstructions
    : "none";

  if (coupon) {
    const couponRow = tbody.insertRow();
    couponRow.insertCell().innerHTML = "<b> Coupon </b>";
    couponRow.insertCell().textContent = coupon;
  }

  // Get the HTML code as a string
  let style = "<style>tr:nth-child(odd) {background-color: #f2f2f2;}</style>";
  const html = table.outerHTML;

  // Output the HTML code
  return style + html;
};
