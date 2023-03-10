import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
} from "@mui/material";
import React, { useState } from "react";
import { useEffect } from "react";
import EmailField from "./EmailFields";
import FlightInfoField from "./FlightInfoField";
import HotelField from "./HotelField";
import NameField from "./NameField";
import dayjs from "dayjs";
// import SquarePaymentForm from "./squarepayments/SquarePaymentForm";

import "./ReservationForm.css";
import "../scripts/handlesubmit";
import DeliveryOptions from "./DeliveryOptions";
import AgreeStatements from "./AgreeStatements";
import CouponField from "./Coupon";
import { createContext } from "react";
import { submitFormData, updateFormData } from "../scripts/handlesubmit";
import { calculateTotal } from "../scripts/rules";
import PaymentOptions from "./PaymentOptions";
import PaymentSummary from "./PaymentSummary";

export const FormContext = createContext();

export default function ReservationForm() {
  const [email, setEmail] = useState("");
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const [numberOfFlights, setNumberOfFlights] = useState(2);
  const [numberOfHotels, setNumberOfHotels] = useState(numberOfFlights - 1);
  const [addHotel, setAddHotel] = useState(false);
  const [minDates, setMinDates] = useState([]);
  const [minHotelDates, setMinHotelDates] = useState([]);
  const [passengerNames, setPassengerNames] = useState([]);
  const [flightDetails, setFlightDetails] = useState([]);
  const [hotelDetails, setHotelDetails] = useState([]);
  const [deliveryOptionValue, setDeliveryOptionValue] =
    useState("Within 24 hours");
  const [coupon, setCoupon] = useState("");
  const [deliveryDate, setDeliveryDate] = useState();
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [price, setPrice] = useState({ totalCost: 15 });
  const [submissionId, setSubmissionId] = useState(null);
  const [proceedToPayment, setProceedToPayment] = useState(false);

  useEffect(() => {
    let today = dayjs().add(8, "day");
    const initialDates = [];
    for (let i = 0; i < 8; i++) {
      initialDates.push(today);
    }
    setMinDates(initialDates);
    let initialHotelDates = [];
    for (let i = 0; i < 8; i++) {
      initialHotelDates.push([today, today]);
    }
    setMinHotelDates(initialHotelDates);
  }, []);

  const setPriceFromServer = async (body) => {
    let resp = await fetch(
      process.env.REACT_APP_BACKEND_ENDPOINT + "/api/price",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    let jsonResp = await resp.json();
    setPrice({ ...jsonResp.message });
  };
  const handleNumberOfPassengersChange = async (event) => {
    const numPax = Number(event.target.value);
    setNumberOfPassengers(numPax);
    setPriceFromServer({
      passengers: numPax,
      flights: numberOfFlights,
      hotels: numberOfHotels,
      addHotel: addHotel,
    });
  };

  const toggleHotelOption = (event) => {
    const addHotelOption = event.target.checked;
    setAddHotel(addHotelOption);
    setPriceFromServer({
      passengers: numberOfPassengers,
      flights: numberOfFlights,
      hotels: numberOfHotels,
      addHotel: addHotelOption,
    });
  };

  const handleNumberOfFlightsChange = (event) => {
    const numFlights = Number(event.target.value);
    setNumberOfFlights(numFlights);
    setPriceFromServer({
      passengers: numberOfPassengers,
      flights: numFlights,
      hotels: numberOfHotels,
      addHotel: addHotel,
    });
  };

  const handleNumberOfHotelsChange = (event) => {
    const numHotels = Number(event.target.value);
    setNumberOfHotels(numHotels);
    setPriceFromServer({
      passengers: numberOfPassengers,
      flights: numberOfFlights,
      hotels: numHotels,
      addHotel: addHotel,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let submissionResult = {};
    const formData = {
      email,
      numberOfPassengers,
      passengerNames,
      numberOfFlights,
      flightDetails,
      addHotel,
      numberOfHotels,
      hotelDetails,
      deliveryOptionValue,
      deliveryDate,
      specialInstructions,
      coupon,
      price,
    };
    if (submissionId === null) {
      submissionResult = await submitFormData(formData);
    } else {
      submissionResult = await updateFormData(formData, submissionId);
    }
    if (submissionResult.message.succeeded) {
      if (submissionResult.message.id) {
        setSubmissionId(submissionResult.message.id);
      } else {
        console.log("couldnt find the order");
      }
      setProceedToPayment(true);
    } else {
      //TODO: show message to user
      console.log("error submitting form: " + submissionResult.message.error);
    }
  };

  return (
    <FormContext.Provider
      value={{
        email,
        setEmail,
        passengerNames,
        setPassengerNames,
        flightDetails,
        setFlightDetails,
        hotelDetails,
        setHotelDetails,
        deliveryOptionValue,
        setDeliveryOptionValue,
        deliveryDate,
        setDeliveryDate,
        specialInstructions,
        setSpecialInstructions,
        coupon,
        setCoupon,
        price,
        submissionId,
      }}
    >
      <Box
        sx={{
          margin: 10,
          width: "80%",
          border: 1,
        }}
      >
        {!proceedToPayment ? (
          <form className="my-form" onSubmit={handleSubmit}>
            <br></br>
            <InputLabel>Please fill out the order form below</InputLabel>
            <InputLabel>Total Price: {price.totalCost}</InputLabel>
            <Stack spacing={2} margin={6}>
              <EmailField></EmailField>
              <br></br>
              <Stack direction="row" spacing={2}>
                <InputLabel id="select-number-of-passengers-label">
                  Select number of passengers{" "}
                  <Select
                    size="small"
                    labelId="select-number-of-passengers-label"
                    id="select-number-of-passengers-value"
                    value={numberOfPassengers}
                    onChange={handleNumberOfPassengersChange}
                  >
                    {[...Array(8).keys()].map((i) => (
                      <MenuItem
                        key={"num-passengers-menu-item-" + i}
                        value={i + 1}
                      >
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </InputLabel>
              </Stack>

              {[...Array(numberOfPassengers).keys()].map((i) => (
                <div key={"flight-" + i}>
                  <div key={"name-" + i}>
                    <NameField index={i}></NameField>
                  </div>
                </div>
              ))}

              <Stack direction="row" spacing={2}>
                <InputLabel size="small" id="select-number-of-fights-label">
                  Select number of flight legs{" "}
                  <Select
                    size="small"
                    labelId="select-number-of-flights-label"
                    id="select-number-of-flights-value"
                    value={numberOfFlights}
                    onChange={handleNumberOfFlightsChange}
                  >
                    {[...Array(8).keys()].map((i) => (
                      <MenuItem key={"num-flight-menu-item-" + i} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </InputLabel>
              </Stack>
              <br></br>
              {[...Array(numberOfFlights).keys()].map((i) => (
                <div key={"flights-" + i}>
                  <FlightInfoField
                    index={i}
                    minDates={minDates}
                    setMinDates={setMinDates}
                  ></FlightInfoField>
                </div>
              ))}
              <br></br>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch checked={addHotel} onChange={toggleHotelOption} />
                  }
                  label="Add hotels to my order"
                />
              </FormGroup>
              {addHotel ? (
                <div>
                  <Stack direction="row" spacing={2}>
                    <InputLabel id="select-number-of-hotels-label">
                      Select number of cities{" "}
                      <Select
                        size="small"
                        labelId="select-number-of-hotels-label"
                        id="select-number-of-hotels-value"
                        value={numberOfHotels}
                        onChange={handleNumberOfHotelsChange}
                      >
                        {[...Array(8).keys()].map((i) => (
                          <MenuItem
                            key={"num-flights-menu-item-" + i}
                            value={i + 1}
                          >
                            {i + 1}
                          </MenuItem>
                        ))}
                      </Select>
                    </InputLabel>
                  </Stack>

                  <br></br>
                  {[...Array(numberOfHotels).keys()].map((i) => (
                    <div key={"flight-" + i}>
                      <HotelField
                        index={i}
                        minHotelDates={minHotelDates}
                        setMinHotelDates={setMinHotelDates}
                      ></HotelField>
                    </div>
                  ))}
                </div>
              ) : null}
              <DeliveryOptions></DeliveryOptions>
              <AgreeStatements></AgreeStatements>
              <CouponField></CouponField>
              <br></br>
              <PaymentSummary></PaymentSummary>
            </Stack>

            <Button variant="contained" type="submit">
              PROCEED TO PAYMENT
            </Button>

            {/* <SquarePaymentForm></SquarePaymentForm> */}
          </form>
        ) : (
          <div>
            <Stack>
              <PaymentOptions></PaymentOptions>
              <PaymentSummary></PaymentSummary>
              <Button
                onClick={() => {
                  setProceedToPayment(false);
                }}
              >
                Back
              </Button>
            </Stack>
          </div>
        )}
        <br></br>
      </Box>
    </FormContext.Provider>
  );
}
