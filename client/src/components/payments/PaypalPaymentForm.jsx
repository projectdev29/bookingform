import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useContext } from "react";
import { FormContext } from "../ReservationForm";

export default function PaypalPaymentForm() {
  const { price, submissionId } = useContext(FormContext);
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: price.totalCost,
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      const name = details.payer.name.given_name;
      alert(`Transaction completed by ${name}`);
    });
  };

  return (
    <div>
      <PayPalScriptProvider
        options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID }}
      >
        <br></br>
        <PayPalButtons
          fundingSource="paypal"
          forceReRender={[price.totalCost, submissionId]}
          createOrder={createOrder}
          onApprove={onApprove}
        />
        <br></br>
        <PayPalButtons
          fundingSource="card"
          forceReRender={[price.totalCost, submissionId]}
          createOrder={createOrder}
          onApprove={onApprove}
        />
      </PayPalScriptProvider>
    </div>
  );
}
