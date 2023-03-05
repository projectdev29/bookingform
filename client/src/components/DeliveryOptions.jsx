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
  TextField,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import React, { useContext, useState } from "react";
import { FormContext } from "./ReservationForm";

const DeliveryOptions = () => {
  const {
    deliveryDate,
    setDeliveryDate,
    deliveryOptionValue,
    setDeliveryOptionValue,
  } = useContext(FormContext);
  const [error, setError] = useState(false);

  function handleDeliveryOptionChange(event) {
    setDeliveryOptionValue(event.target.value);
  }

  const handleDeliveryDateChange = (newValue) => {
    setDeliveryDate(newValue);
  };

  return (
    <div>
      <Stack direction="column" textAlign="left">
        <FormLabel id="delivery-date-label">
          When would you like this delivered?
        </FormLabel>
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
        <br></br>
        {deliveryOptionValue === "Later Date" ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="Delivery Date"
              inputFormat="MM/DD/YYYY"
              value={deliveryDate}
              onChange={handleDeliveryDateChange}
              renderInput={(params) => (
                <TextField style={{ width: "30%" }} size="small" {...params} />
              )}
            />
          </LocalizationProvider>
        ) : null}
        <br></br>
      </Stack>

      <Stack style={{ width: "50%" }} spacing={2}>
        <TextField
          id="outlined-multiline-static"
          label="Special Instructions"
          multiline
          size="small"
          rows={4}
        />
      </Stack>
    </div>
  );
};

export default DeliveryOptions;
