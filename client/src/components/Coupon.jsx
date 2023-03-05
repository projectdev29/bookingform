import React, { useContext, useState } from "react";

import { Button, Stack, TextField } from "@mui/material";
import { FormContext } from "./ReservationForm";

const CouponField = () => {
  const { coupon, setCoupon } = useContext(FormContext);
  //   const [error, setError] = useState(false);

  const handleCouponChange = (event) => {
    setCoupon(event.target.value);
  };

  return (
    <div>
      <Stack style={{ width: "50%" }} spacing={2} direction="row">
        <TextField
          label="Coupon"
          size="small"
          value={coupon}
          onChange={handleCouponChange}
          //   error={error}
          //   helperText={error ? "Invalid coupon" : ""}
        />
        <Button variant="contained">Validate</Button>
      </Stack>
    </div>
  );
};

export default CouponField;
