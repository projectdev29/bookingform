import React, { useState } from "react";
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
import { useCallback } from "react";

export default function HotelField({ index, minHotelDates, setMinHotelDates }) {
  const minDate = dayjs().add(8, "day");
  const { hotelDetails, setHotelDetails } = useContext(FormContext);

  const handleCheckinChange = (newValue) => {
    setHotelDetails((prevValue) => {
      let newDetails = [...prevValue];
      newDetails[index] = { ...newDetails[index], checkinDate: newValue };
      return newDetails;
    });

    setMinHotelDates((prevValue) => {
      let newMinDates = [...prevValue];
      let newMinDate = dayjs(newValue);
      if (newMinDate) {
        // set checkout minvalue
        newMinDates[index][1] = newMinDate;
        for (let i = index + 1; i < newMinDates.length; i++) {
          newMinDates[i] = [newMinDate, newMinDate];
        }
      }
      return newMinDates;
    });
  };

  const handleCheckoutChange = useCallback((newValue) => {
    setHotelDetails((prevValue) => {
      let newDetails = [...prevValue];
      newDetails[index] = { ...newDetails[index], checkoutDate: newValue };
      return newDetails;
    });

    setMinHotelDates((prevValue) => {
      let newMinDates = [...prevValue];
      let newMinDate = dayjs(newValue);
      if (newMinDate) {
        for (let i = index + 1; i < newMinDates.length; i++) {
          newMinDates[i] = [newMinDate, newMinDate];
        }
      }
      return newMinDates;
    });
  });

  const handleCityChange = useCallback((newValue) => {
    setHotelDetails((prevValue) => {
      let newDetails = [...prevValue];
      newDetails[index] = { ...newDetails[index], city: newValue.target.value };
      return newDetails;
    });
  });

  function formatDate(params) {
    return <TextField size="small" {...params} />;
  }
  return (
    <div>
      <Stack direction="row" spacing={2}>
        <TextField
          style={{ width: "30%" }}
          size="small"
          required
          id="outlined-required"
          label="City"
          onChange={handleCityChange}
          value={
            hotelDetails[index] && hotelDetails[index].city
              ? hotelDetails[index].city
              : ""
          }
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DesktopDatePicker
            style={{ width: "10%" }}
            margin="normal"
            minDate={minHotelDates[index][0]}
            label="Check-in"
            inputFormat="MM/DD/YYYY"
            value={
              hotelDetails[index] && hotelDetails[index].checkinDate
                ? hotelDetails[index].checkinDate
                : null
            }
            onChange={handleCheckinChange}
            renderInput={(params) => {
              return formatDate(params);
            }}
          />
          <DesktopDatePicker
            style={{ width: "10%" }}
            margin="normal"
            minDate={minHotelDates[index][1]}
            label="Check-out"
            inputFormat="MM/DD/YYYY"
            value={
              hotelDetails[index] && hotelDetails[index].checkoutDate
                ? hotelDetails[index].checkoutDate
                : null
            }
            onChange={handleCheckoutChange}
            renderInput={(params) => <TextField size="small" {...params} />}
          />
        </LocalizationProvider>
      </Stack>
      <br></br>
    </div>
  );
}
