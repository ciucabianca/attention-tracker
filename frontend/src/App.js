import { BrowserRouter, Route, Routes } from "react-router-dom";
import CallPage from "./pages/CallPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact={true} path="/" element={<CallPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
