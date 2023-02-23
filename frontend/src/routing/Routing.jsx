import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/HomePage";
import Video from "../pages/VideoCallPage";

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact={true} path="/" element={<Home />} />
        <Route exact={true} path="/:url" element={<Video />} />
      </Routes>
    </BrowserRouter>
  );
}
export default Routing;
