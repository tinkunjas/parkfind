import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapComponent from "./components/map/MapComponent";
import MobileMapComponent from "./components/map/MobileMapComponent";
import Team from "./pages/Team";
import MobileTeam from "./pages/MobileTeam";
import SupportPage from "./pages/SupportPage";
import MobileSupportPage from "./pages/MobileSupportPage";
import { isMobile } from "./utils/isMobile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={isMobile() ? <MobileMapComponent /> : <MapComponent />} />
        <Route path="/team" element={isMobile() ? <MobileTeam /> : <Team />} />
        <Route path="/support" element={isMobile() ? <MobileSupportPage /> : <SupportPage />} />
      </Routes>
    </Router>
  );
}

export default App;
