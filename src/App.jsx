import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import ManageMyPlacePage from "./pages/ManageMyPlacePage";
import AddPlacePage from "./pages/AddPlacePage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detail-page" element={<DetailPage />} />
        <Route path="/manage-page" element={<ManageMyPlacePage />} />
        <Route path="/add-place" element={<AddPlacePage />} />
      </Routes>
    </>
  );
}

export default App;
