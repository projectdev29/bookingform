import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Link,
  Stack,
} from "@mui/material";

import React, { useState } from "react";

const AgreeStatements = () => {
  const [agreeToValidityTerms, setAgreeToValidityTerms] = useState(false);
  const [agreeToSalesTerms, setAgreeToSalesTerms] = useState(false);

  const handleAgreeToValidityTermsChange = (newValue) => {
    setAgreeToValidityTerms(newValue.target.checked);
  };

  const handleAgreeToSalesTermsChange = (newValue) => {
    setAgreeToSalesTerms(newValue.target.checked);
  };

  return (
    <div>
      <Stack direction="column" textAlign="left">
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeToValidityTerms}
                onChange={handleAgreeToValidityTermsChange}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
            label="I have read and understood the Terms of Reservation Validity"
          />
        </FormGroup>
        <Link
          underline="none"
          href="https://www.bookingforvisa.com/reservation-validity"
          target="_blank"
          rel="noopener"
        >
          Reservation Validity
        </Link>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeToSalesTerms}
                onChange={handleAgreeToSalesTermsChange}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
            label="I have read and understood the Terms of Reservation Validity"
          />
        </FormGroup>
        <Link
          width="10"
          underline="none"
          href="https://www.bookingforvisa.com/terms-of-sale"
          target="_blank"
          rel="noopener"
        >
          Terms of Sale
        </Link>
      </Stack>
    </div>
  );
};

export default AgreeStatements;
