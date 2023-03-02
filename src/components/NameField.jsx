import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { InputLabel, MenuItem, Select, Stack } from "@mui/material";

export default function NameField() {
  const [title, setTitle] = useState("");

  function handleTitleChange(event) {
    console.log(event.target.value);
    setTitle(event.target.value);
  }
  return (
    <div>
      <Stack direction="row" spacing={2}>
        <InputLabel id="select-title-label">
          Title
          <Select
            labelId="select-title-label"
            id="select-label-value"
            value={title}
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
          margin="normal"
          required
          id="outlined-required"
          label="First Name"
        />
        <TextField
          margin="normal"
          id="outlined-middlename"
          label="Middle Name"
        />
        <TextField margin="normal" id="outlined-lastname" label="Last Name" />
      </Stack>
    </div>
  );
}
