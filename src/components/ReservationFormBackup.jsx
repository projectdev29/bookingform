import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
} from "@mui/material";
import React, { useState } from "react";
import EmailField from "./EmailFields";
import FlightInfoField from "./FlightInfoField";
import HotelField from "./HotelField";
import NameField from "./NameField";

export default function ReservationForm() {
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const [numberOfFlights, setNumberOfFlights] = useState(2);
  const [numberOfHotels, setNumberOfHotels] = useState(numberOfFlights - 1);
  const [addHotel, setAddHotel] = useState(false);
  const [deliveryOptionValue, setDeliveryOptionValue] =
    useState("Within 24 hours");

  function handleNumberOfPassengersChange(event) {
    setNumberOfPassengers(Number(event.target.value));
  }

  function toggleHotelOption(event) {
    setAddHotel(event.target.checked);
  }
  function handleNumberOfFlightsChange(event) {
    setNumberOfFlights(Number(event.target.value));
  }

  function handleNumberOfHotelsChange(event) {
    setNumberOfHotels(Number(event.target.value));
  }

  function handleDeliveryOptionChange(event) {
    setDeliveryOptionValue(event.target.value);
    console.log(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    // handle form submission logic here
  }

  const nameFields = [];
  for (let i = 0; i < numberOfPassengers; i++) {
    nameFields.push(
      <div key={"name-" + i}>
        <NameField></NameField>
      </div>
    );
  }
  const flightInfoFields = [];
  for (let i = 0; i < numberOfFlights; i++) {
    flightInfoFields.push(
      <div key={"flights-" + i}>
        <FlightInfoField></FlightInfoField>
      </div>
    );
  }

  const hotelFields = [];
  for (let i = 0; i < numberOfHotels; i++) {
    hotelFields.push(
      <div key={i}>
        <HotelField></HotelField>
      </div>
    );
  }

  return (
    <Box
      sx={{
        margin: 10,
        width: "80%",
        border: 1,
      }}
    >
      <form onSubmit={handleSubmit}>
        <br></br>
        <InputLabel>RESERVATION FORM</InputLabel>
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
                  <MenuItem key={"num-passengers-menu-item-" + i} value={i + 1}>
                    {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </InputLabel>
          </Stack>
          <div>{nameFields}</div>
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
          <div>{flightInfoFields}</div>
          <br></br>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  defaultChecked={addHotel}
                  onChange={toggleHotelOption}
                />
              }
              label="Add Hotel"
            />
          </FormGroup>
          {addHotel ? (
            <div>
              <Stack direction="row" spacing={2}>
                <InputLabel id="select-number-of-hotels-label">
                  Select number of cities
                  <Select
                    labelId="select-number-of-hotels-label"
                    id="select-number-of-hotels-value"
                    value={numberOfHotels}
                    onChange={handleNumberOfHotelsChange}
                  >
                    {[...Array(numberOfFlights - 1).keys()].map((i) => (
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
              <div>{hotelFields}</div>
            </div>
          ) : null}

          <Stack direction="column" textAlign="left" spacing={2}>
            <FormLabel id="delivery-date-label">Delivery Option</FormLabel>
            <RadioGroup
              aria-labelledby="delivery-date-label"
              defaultValue="Within 24 hours"
              name="delivery-date-group"
              value={deliveryOptionValue}
              onChange={handleDeliveryOptionChange}
            >
              <FormControlLabel
                value="Within 24 hours"
                control={<Radio />}
                label="Within 24 hours"
              />
              <FormControlLabel
                value="Later Date"
                control={<Radio />}
                label="Later Date"
              />
            </RadioGroup>
          </Stack>
        </Stack>

        <Button variant="contained" type="submit">
          Submit
        </Button>
      </form>
      <br></br>
    </Box>
  );
}
