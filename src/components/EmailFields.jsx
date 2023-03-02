import React, { useState } from "react";

import { Stack, TextField } from "@mui/material";

const EmailField = () => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleConfirmEmailChange = (event) => {
    setConfirmEmail(event.target.value);
  };

  const handleEmailBlur = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email) || email !== confirmEmail) {
      setError(true);
    } else {
      setError(false);
    }
  };

  return (
    <div>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Email"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          error={error}
          helperText={error ? "Invalid email format" : ""}
        />
        <br></br>
        <br></br>
        <TextField
          label="Confirm Email"
          onChange={handleConfirmEmailChange}
          onBlur={handleEmailBlur}
          value={confirmEmail}
        />
      </Stack>
    </div>
  );
};

export default EmailField;
