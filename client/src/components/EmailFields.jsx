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
      <Stack style={{ width: "50%" }} spacing={2}>
        <TextField
          label="Email"
          size="small"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          error={error}
          helperText={error ? "Invalid email format" : ""}
        />
        <TextField
          label="Confirm Email"
          size="small"
          onChange={handleConfirmEmailChange}
          onBlur={handleEmailBlur}
          value={confirmEmail}
        />
      </Stack>
    </div>
  );
};

export default EmailField;
