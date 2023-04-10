const calculateTotal = (params) => {
  let numOfPax = [15, 15, 25, 25, 35, 35, 35, 40, 40];
  let additionalFlightLegs = [0, 0, 0, 5, 5, 5, 15, 15, 15];
  let additionalHotels = [15, 15, 20, 25, 25, 30, 35, 40, 40];
  let passengerCost = numOfPax[params.passengers];
  let additionalFlightCost = additionalFlightLegs[params.flights];
  let hotelCost = params.addHotel ? additionalHotels[params.hotels] : 0;
  let totalCost = passengerCost + additionalFlightCost + hotelCost;

  return {
    passengerCost,
    additionalFlightCost,
    hotelCost,
    totalCost,
  };
};

module.exports = { calculateTotal };
