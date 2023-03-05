import React, { useCallback, useState } from "react";
import TextField from "@mui/material/TextField";
import {
  DesktopDatePicker,
  LocalizationProvider,
  MobileDatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";
import { Stack } from "@mui/material";
import { useContext } from "react";
import { FormContext } from "./ReservationForm";

export default function FlightInfoField({ index, minDates, setMinDates }) {
  // const [value, setValue] = useState(null);
  const { flightDetails, setFlightDetails } = useContext(FormContext);

  const handleFlightDateChange = useCallback((newValue) => {
    setFlightDetails((prevValue) => {
      let newDetails = [...prevValue];
      newDetails[index] = { ...newDetails[index], flightDate: newValue };
      return newDetails;
    });

    setMinDates((prevValue) => {
      let newMinDates = [...prevValue];
      for (let i = index + 1; i < newMinDates.length; i++) {
        let newMinDate = dayjs(newValue);
        if (newMinDate) {
          newMinDates[i] = newMinDate;
        }
      }
      return newMinDates;
    });
  });

  const handleFromChange = useCallback((newValue) => {
    setFlightDetails((prevValue) => {
      let newDetails = [...prevValue];
      newDetails[index] = { ...newDetails[index], from: newValue.target.value };
      return newDetails;
    });
  });

  const handleToChange = useCallback((newValue) => {
    setFlightDetails((prevValue) => {
      let newDetails = [...prevValue];
      newDetails[index] = { ...newDetails[index], to: newValue.target.value };
      return newDetails;
    });
  });

  return (
    <div>
      <Stack direction="row" spacing={2}>
        <TextField
          required
          size="small"
          id="outlined-required"
          label="Departing city"
          style={{ width: "30%" }}
          onChange={handleFromChange}
          value={
            flightDetails[index] && flightDetails[index].from
              ? flightDetails[index].from
              : ""
          }
        />
        <TextField
          required
          size="small"
          id="outlined-required"
          label="Arriving city"
          style={{ width: "30%" }}
          onChange={handleToChange}
          value={
            flightDetails[index] && flightDetails[index].to
              ? flightDetails[index].to
              : ""
          }
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DesktopDatePicker
            margin="normal"
            minDate={minDates[index]}
            label="Departure Date"
            inputFormat="MM/DD/YYYY"
            value={
              flightDetails[index] && flightDetails[index].flightDate
                ? flightDetails[index].flightDate
                : null
            }
            onChange={handleFlightDateChange}
            renderInput={(params) => <TextField size="small" {...params} />}
            style={{ width: "10%" }}
          />
        </LocalizationProvider>
      </Stack>
      <br></br>
    </div>
  );
}
