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
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDatePicker
            style={{ width: "10%" }}
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
            style={{ width: "10%" }}
            margin="normal"
            minDate={minDate}
            label="Check-out"
            inputFormat="MM/DD/YYYY"
            value={value}
            onChange={handleChange}
            renderInput={(params) => <TextField size="small" {...params} />}
          />
        </LocalizationProvider>
      </Stack>
      <br></br>
    </div>
  );
}
