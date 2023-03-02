import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";
import { Stack } from "@mui/material";

export default function FlightInfoField() {
  const minDate = dayjs().add(8, "day");
  const [value, setValue] = useState(null);

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Stack direction="row" spacing={2}>
        <TextField required id="outlined-required" label="Departing city" />
        <TextField required id="outlined-required" label="Arriving city" />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDatePicker
            margin="normal"
            minDate={minDate}
            label="Departure Date"
            inputFormat="MM/DD/YYYY"
            value={value}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <br></br>
        <br></br>
      </Stack>
      <br></br>
    </div>
  );
}
