import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import {
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from "@mui/material";
import { useContext } from "react";
import { FormContext } from "./ReservationForm";
import SquarePaymentForm from "./payments/SquarePaymentForm";
import PaypalPaymentForm from "./payments/PaypalPaymentForm";

export default function PaymentOptions() {
  const [paymentOption, setPaymentOption] = useState("Square");

  const handlePaymentOptionChange = (event) => {
    setPaymentOption(event.target.value);
  };
  return (
    <div>
      <Stack direction="column" textAlign="left" margin={4}>
        <FormLabel id="payment-option">Select a method of payment</FormLabel>
        <RadioGroup
          aria-labelledby="payment-option"
          defaultValue="Square"
          name="payment-option-group"
          value={paymentOption}
          onChange={handlePaymentOptionChange}
        >
          <FormControlLabel
            value="Square"
            control={<Radio />}
            label="Credit Card / Debit Card"
          />
          <FormControlLabel value="Paypal" control={<Radio />} label="PayPal" />
        </RadioGroup>
        {paymentOption === "Square" ? (
          <SquarePaymentForm></SquarePaymentForm>
        ) : (
          <PaypalPaymentForm></PaypalPaymentForm>
        )}
      </Stack>
    </div>
  );
}
