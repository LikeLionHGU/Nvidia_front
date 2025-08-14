import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import DetailPage from "./pages/DetailPage";
import ManageMyPlacePage from "./pages/ManageMyPlacePage";
import AddPlacePage from "./pages/AddPlacePage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/detail-page/:id" element={<DetailPage />} />
        <Route path="/manage-page" element={<ManageMyPlacePage />} />
        <Route path="/add-place" element={<AddPlacePage />} />
      </Routes>
    </>
  );
}

export default App;
