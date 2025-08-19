import { Routes, Route } from "react-router-dom";
import React from "react";
import MainPage from "./pages/MainPage";
import DetailPage from "./pages/DetailPage";
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
        <Route path="/" element={<MainPage />} />
        <Route path="/detail-page/:id" element={<DetailPage />} />
        <Route path="/manage-page" element={<ManageMyPlacePage />} />
        <Route path="/add-place" element={<AddPlacePage />} />
        <Route path="/reservation-page" element={<ReservationPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default App;
