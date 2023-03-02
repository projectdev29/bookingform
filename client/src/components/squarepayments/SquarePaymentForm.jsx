import styles from "../../styles/SquarePaymentForm.module.css";

// import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";

export default function SquarePaymentForm() {
  return (
    <div className={styles.container}>
      {/* <PaymentForm
        applicationId={process.env.SQUARE_APP_ID}
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
        <CreditCard
          buttonProps={{
            css: {
              backgroundColor: "#771520",
              fontSize: "14px",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#530f16",
              },
            },
          }}
        />
      </PaymentForm> */}
    </div>
  );
}
