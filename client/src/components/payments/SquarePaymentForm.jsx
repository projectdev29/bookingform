import styles from "../../styles/SquarePaymentForm.module.css";

import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { Stack } from "@mui/system";
import { TextField } from "@mui/material";

export default function SquarePaymentForm() {
  return (
    <div className={styles.container}>
      <br></br>
      <PaymentForm
        applicationId={process.env.REACT_APP_SQUARE_APP_ID}
        cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
          const response = await fetch("/api/pay", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              sourceId: token.token,
            }),
          });
          console.log(await response.json());
        }}
        locationId="XXXXXXXXXX"
      >
        <Stack direction="column" spacing={2}>
          <TextField label="Cardholder Name" fullWidth size="small" />
          <TextField label="Email" fullWidth size="small" />
          <TextField label="Street address Line 1" fullWidth size="small" />
          <TextField label="Street address Line 2" fullWidth size="small" />
          <Stack direction="row" spacing={2}>
            <TextField label="City" fullWidth size="small" />
            <TextField label="Country" fullWidth size="small" />
          </Stack>

          <CreditCard

          // buttonProps={{
          //   css: {
          //     backgroundColor: "#771520",
          //     fontSize: "14px",
          //     color: "#fff",
          //     "&:hover": {
          //       backgroundColor: "#530f16",
          //     },
          //   },
          // }}
          ></CreditCard>
        </Stack>
      </PaymentForm>
    </div>
  );
}
