import React, { useState } from "react";
import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from "@mui/material";
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
