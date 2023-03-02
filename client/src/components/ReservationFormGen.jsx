import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import FlightInfoField from "./FlightInfoField";
import HotelField from "./HotelField";
import EmailFields from "./EmailFields";
import { useEffect } from "react";

const Form = styled.form`
  padding: 16px;
`;

const Fieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;
`;

const FormTitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 16px;
`;

const FormSubtitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 8px;
`;

export default function ReservationForm() {
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const [numberOfFlights, setNumberOfFlights] = useState(2);
  const [numberOfHotels, setNumberOfHotels] = useState(numberOfFlights - 1);
  const [addHotel, setAddHotel] = useState(false);
  const [deliveryOptionValue, setDeliveryOptionValue] =
    useState("Within 24 hours");

  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => console.log(data.message));
  }, []);

  const handleNumberOfPassengersChange = (event) => {
    setNumberOfPassengers(Number(event.target.value));
  };

  const handleNumberOfFlightsChange = (event) => {
    setNumberOfFlights(Number(event.target.value));
    setNumberOfHotels(Number(event.target.value) - 1);
  };

  const handleNumberOfHotelsChange = (event) => {
    setNumberOfHotels(Number(event.target.value));
  };

  const handleDeliveryOptionChange = (event) => {
    setDeliveryOptionValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // handle form submission logic here
  };

  const nameFields = [];
  for (let i = 0; i < numberOfPassengers; i++) {
    nameFields.push(
      <Grid key={"name-" + i} item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Name</InputLabel>
          <Input type="text" />
        </FormControl>
      </Grid>
    );
  }

  const flightInfoFields = [];
  for (let i = 0; i < numberOfFlights; i++) {
    flightInfoFields.push(
      <Grid key={"flights-" + i} item xs={12}>
        <FormSubtitle variant="subtitle1">Flight {i + 1}</FormSubtitle>
        <FlightInfoField />
      </Grid>
    );
  }

  const hotelFields = [];
  for (let i = 0; i < numberOfHotels; i++) {
    hotelFields.push(
      <Grid key={i} item xs={12}>
        <FormSubtitle variant="subtitle1">City {i + 1}</FormSubtitle>
        <HotelField />
      </Grid>
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
          <EmailFields></EmailFields>
          <br></br>
          <Stack direction="row" spacing={2}>
            <InputLabel id="select-number-of-passengers-label">
              Select number of passengers
              <Select
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
            <InputLabel id="select-number-of-fights-label">
              Select number of flight legs
              <Select
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
                  // onChange={toggleHotelOption}
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
                value="Within 48 hours"
                control={<Radio />}
                label="Within 48 hours"
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
