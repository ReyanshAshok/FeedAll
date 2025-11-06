import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import DonorDashboard from "./components/donorDashboard";
import NgoDashboard from "./components/NgoDashboard";
import reportWebVitals from "./reportWebVitals";
import TransportContractUI from "./components/TransportDashBoard";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Wrap your app in BrowserRouter to enable routing */}
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<App />} />

        {/* Donor Dashboard Page */}
        <Route path="/donor" element={<DonorDashboard />} />

        {/* NGO Dashboard Page */}
        <Route path="/ngo" element={<NgoDashboard />} />

        {/* Transport Dashboard Page */}
        <Route path ="/transport" element={<TransportContractUI/>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
