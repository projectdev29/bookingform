import logo from "./logo.svg";
import "./App.css";
import ReservationForm from "./components/ReservationForm";
import ValidationTextFields from "./components/ValidationTextFields";
import NameField from "./components/NameField";

export default function App() {
  return (
    <div className="App">
      <br></br>
      {/* <ValidationTextFields></ValidationTextFields> */}
      <ReservationForm></ReservationForm>
    </div>
  );
}
