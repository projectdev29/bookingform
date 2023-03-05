import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { useContext } from "react";
import { FormContext } from "./ReservationForm";

export default function NameField({ index }) {
  const [title, setTitle] = useState("");
  const { passengerNames, setPassengerNames } = useContext(FormContext);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    setPassengerNames((prevValue) => {
      let newDetails = [...prevValue];
      newDetails[index] = { ...newDetails[index], title: event.target.value };
      return newDetails;
    });
  };
  const handleFirstNameChange = (event) => {
    setPassengerNames((prevValue) => {
      let newDetails = [...prevValue];
      newDetails[index] = { ...newDetails[index], first: event.target.value };
      return newDetails;
    });
  };
  const handleLastNameChange = (event) => {
    setPassengerNames((prevValue) => {
      let newDetails = [...prevValue];
      newDetails[index] = { ...newDetails[index], last: event.target.value };
      return newDetails;
    });
  };

  return (
    <div>
      <Stack direction="row" spacing={2}>
        <InputLabel id="select-title-label">
          <Select
            labelId="select-title-label"
            id="select-label-value"
            value={title}
            size="small"
            style={{ width: "60pt" }}
            onChange={handleTitleChange}
          >
            <MenuItem value=""></MenuItem>
            <MenuItem value="Mr.">Mr.</MenuItem>
            <MenuItem value="Mrs.">Mrs.</MenuItem>
            <MenuItem value="Miss">Miss</MenuItem>
            <MenuItem value="Child (2 - 12 Years) male">
              Child (2 - 12 Years) male
            </MenuItem>
            <MenuItem value="Child (2 - 12 Years) female">
              Child (2 - 12 Years) female
            </MenuItem>
            <MenuItem value="Infant (below 2 years) male">
              Infant (below 2 years) male
            </MenuItem>
            <MenuItem value="Infant (below 2 years) female">
              Infant (below 2 years) female
            </MenuItem>
          </Select>
        </InputLabel>
        <TextField
          size="small"
          margin="normal"
          required
          id="outlined-required"
          label="First Name"
          value={
            passengerNames[index] && passengerNames[index].first
              ? passengerNames[index].first
              : ""
          }
          onChange={handleFirstNameChange}
          style={{ width: "25%" }}
        />

        <TextField
          size="small"
          margin="normal"
          id="outlined-lastname"
          label="Last Name"
          value={
            passengerNames[index] && passengerNames[index].last
              ? passengerNames[index].last
              : ""
          }
          onChange={handleLastNameChange}
          style={{ width: "25%" }}
        />
      </Stack>
      <br></br>
    </div>
  );
}
