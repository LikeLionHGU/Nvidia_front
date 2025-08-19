import { Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import MainPage from "./pages/MainPage";
import DetailPage from "./pages/DetailPage";
import ManageMyPlacePage from "./pages/ManageMyPlacePage";
import AddPlacePage from "./pages/AddPlacePage";
import LandingPage from "./pages/LandingPage";
import Header from "./components/common/Header";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const SearchEnterHandle = (e) => {
    if (e.key === "Enter") {
      // 엔터 키 입력 시 동작할 로직 (예: 검색 페이지로 이동)
      // 이 부분은 추후에 실제 검색 기능으로 구현해야 합니다.
      console.log("Search triggered:", searchQuery);
    }
  };
  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} SearchEnterHandle={SearchEnterHandle} />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/detail-page/:id" element={<DetailPage />} />
        <Route path="/manage-page" element={<ManageMyPlacePage />} />
        <Route path="/add-place" element={<AddPlacePage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default App;
