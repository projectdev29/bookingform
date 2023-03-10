import "./PaymentSummary.css";
import { useContext } from "react";
import { FormContext } from "./ReservationForm";

export default function PaymentSummary() {
  const { price } = useContext(FormContext);

  return (
    <div>
      <p>
        <b>Payment Summary</b>
      </p>
      <table>
        <head>
          <tr>
            <th>
              <b> Item </b>
            </th>
            <th>
              <b> Price </b>
            </th>
          </tr>
        </head>
        <body>
          <tr>
            <td>
              <b> Passengers charge </b>
            </td>
            <td>${price.passengerCost}</td>
          </tr>
          {price.additionalFlightCost > 0 ? (
            <tr>
              <td>
                <b> Additional flight legs charge</b>
              </td>
              <td>${price.additionalFlightCost}</td>
            </tr>
          ) : null}
          {price.hotelCost > 0 ? (
            <tr>
              <td>
                <b> Hotels charge </b>
              </td>
              <td>${price.hotelCost}</td>
            </tr>
          ) : null}
          <tr>
            <td>
              <b> TOTAL </b>
            </td>
            <td>${price.totalCost}</td>
          </tr>
        </body>
      </table>
    </div>
  );
}
