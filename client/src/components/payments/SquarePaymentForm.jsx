import styles from "../../styles/SquarePaymentForm.module.css";

import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { Stack } from "@mui/system";
import { MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import CountryCodes from "../../scripts/countrycodes";

export default function SquarePaymentForm() {
  const [customer, setCustomer] = useState({ address: { country: "US" } });

  const handleFirstNameChange = (event) => {
    setCustomer((prevValue) => {
      return {
        ...prevValue,
        firstName: event.target.value,
      };
    });
  };
  const handleLastNameChange = (event) => {
    setCustomer((prevValue) => {
      return {
        ...prevValue,
        lastName: event.target.value,
      };
    });
  };
  const handleEmailChange = (event) => {
    setCustomer((prevValue) => {
      return {
        ...prevValue,
        email: event.target.value,
      };
    });
  };
  const handleAddressLine1Change = (event) => {
    setCustomer((prevValue) => {
      return {
        ...prevValue,
        address: {
          ...prevValue.address,
          addressLine1: event.target.value,
        },
      };
    });
  };
  const handleAddressLine2Change = (event) => {
    setCustomer((prevValue) => {
      return {
        ...prevValue,
        address: {
          ...prevValue.address,
          addressLine2: event.target.value,
        },
      };
    });
  };
  const handleCityChange = (event) => {
    setCustomer((prevValue) => {
      return {
        ...prevValue,
        address: {
          ...prevValue.address,
          locality: event.target.value,
        },
      };
    });
  };
  const handleStateChange = (event) => {
    setCustomer((prevValue) => {
      return {
        ...prevValue,
        address: {
          ...prevValue.address,
          administrativeDistrictLevel1: event.target.value,
        },
      };
    });
  };
  const handlePostalCodeChange = (event) => {
    setCustomer((prevValue) => {
      return {
        ...prevValue,
        address: {
          ...prevValue.address,
          postalCode: event.target.value,
        },
      };
    });
  };
  const handleCountryChange = (event) => {
    event.preventDefault();
    setCustomer((prevValue) => {
      return {
        ...prevValue,
        countryName: event.target.value,
        address: {
          ...prevValue.address,
          country: CountryCodes.getISO2(event.target.value),
        },
      };
    });
  };

  return (
    <div className={styles.container}>
      <br></br>
      <PaymentForm
        applicationId={process.env.REACT_APP_SQUARE_APP_ID}
        cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
          const response = await fetch(
            process.env.REACT_APP_BACKEND_ENDPOINT + "/api/pay",
            {
              method: "POST",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({
                sourceId: token.token,
                customer: customer,
              }),
            }
          );
          console.log(await response.json());
        }}
        locationId={process.env.REACT_APP_SQUARE_LOCATION_ID}
      >
        <Stack direction="column" spacing={2}>
          <TextField
            label="First Name"
            fullWidth
            size="small"
            onChange={handleFirstNameChange}
          />
          <TextField
            label="Last Name"
            fullWidth
            size="small"
            onChange={handleLastNameChange}
          />
          <TextField
            label="Email"
            fullWidth
            size="small"
            onChange={handleEmailChange}
          />
          <TextField
            label="Street address Line 1"
            fullWidth
            size="small"
            onChange={handleAddressLine1Change}
          />
          <TextField
            label="Street address Line 2"
            fullWidth
            size="small"
            onChange={handleAddressLine2Change}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="City"
              fullWidth
              size="small"
              onChange={handleCityChange}
            />
            <TextField
              label="State/Province"
              fullWidth
              size="small"
              onChange={handleStateChange}
            />
            <TextField
              label="Postal Code"
              fullWidth
              size="small"
              onChange={handlePostalCodeChange}
            />
            <Select
              labelId="select-title-label"
              id="select-label-value"
              value={
                customer.countryName ? customer.countryName : "United States"
              }
              size="small"
              // style={{ width: "60pt" }}
              onChange={handleCountryChange}
            >
              <MenuItem value="Country">Country</MenuItem>
              {CountryCodes.getCountries().map((c) => {
                return <MenuItem value={c}>{c}</MenuItem>;
              })}
            </Select>
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
