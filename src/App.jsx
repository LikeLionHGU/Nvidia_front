import { Routes, Route } from "react-router-dom";
import React from "react";
import MainPage from "./pages/MainPage";
import ManageMyPlacePage from "./pages/ManageMyPlacePage";
import AddPlacePage from "./pages/AddPlacePage";
import LandingPage from "./pages/LandingPage";
import Header from "./components/common/Header";

import ReservationPage from "./pages/ReservationPage";

import "./assets/fonts/pretendard.css";

function App() {
  return (
    <>
      <Header/>
      <Routes>
        <Route path="/main" element={<MainPage />} />
        <Route path="/manage-page" element={<ManageMyPlacePage />} />
        <Route path="/add-place" element={<AddPlacePage />} />
        <Route path="/reservation-page/:roomId" element={<ReservationPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default App;
