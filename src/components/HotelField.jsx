import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";
import { Stack } from "@mui/material";

export default function HotelField() {
  const minDate = dayjs().add(8, "day");
  const [value, setValue] = useState(null);

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  function formatDate(params) {
    console.log(params);
    return <TextField {...params} />;
  }
  return (
    <div>
      <Stack direction="row" spacing={2}>
        <TextField required id="outlined-required" label="City" />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDatePicker
            margin="normal"
            minDate={minDate}
            label="Check-in"
            inputFormat="MM/DD/YYYY"
            value={value}
            onChange={handleChange}
            renderInput={(params) => {
              return formatDate(params);
            }}
          />
          <MobileDatePicker
            margin="normal"
            minDate={minDate}
            label="Check-out"
            inputFormat="MM/DD/YYYY"
            value={value}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </Stack>
      <br></br>
    </div>
  );
}
