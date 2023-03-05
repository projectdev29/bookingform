export const calculateTotal = (params) => {
  let numOfPax = [15, 15, 25, 25, 35, 35, 35, 40, 40];
  let additionalFlightLegs = [0, 0, 0, 5, 5, 5, 15, 15, 15];
  let additionalHotels = [15, 15, 15, 20, 20, 25, 30, 35, 35];
  let passengerCost = numOfPax[params.passengers];
  let additionalFlightCost = additionalFlightLegs[params.flights];
  let hotelCost = additionalHotels[params.hotels];

  const table = document.createElement("table");

  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  const itemCell = headerRow.insertCell();
  itemCell.innerHTML = "<b> Item </b>";
  const priceCell = headerRow.insertCell();
  priceCell.innerHTML = "<b> Price </b>";

  const tbody = table.createTBody();

  const passengersCostRow = tbody.insertRow();
  passengersCostRow.insertCell().innerHTML =
    "<b> Number of travelers - " + params.passengers + " </b>";
  passengersCostRow.insertCell().textContent = passengerCost;

  if (additionalFlightCost > 0) {
    const additionalFlightCostRow = tbody.insertRow();
    additionalFlightCostRow.insertCell().innerHTML =
      "<b> Additional flight legs - " + params.flights + " </b>";
    additionalFlightCostRow.insertCell().textContent = additionalFlightCost;
    console.log(additionalFlightCost);
  }

  if (hotelCost > 0) {
    const hotelCostRow = tbody.insertRow();
    hotelCostRow.insertCell().innerHTML =
      "<b> Number of hotels - " + params.hotels + " </b>";
    hotelCostRow.insertCell().textContent = hotelCost;
  }
  let total = passengerCost + additionalFlightCost + hotelCost;
  const hotelCostRow = tbody.insertRow();
  hotelCostRow.insertCell().innerHTML = "<b> TOTAL </b>";
  hotelCostRow.insertCell().textContent = "$" + total;

  return "<p><Order summary: </p> " + table.outerHTML;
};
