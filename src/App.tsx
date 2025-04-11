import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapComponent from "./MapComponent";
import MobileMapComponent from "./MobileMapComponent";
import Team from "./pages/Team";
import SupportPage from "./pages/SupportPage";
import { isMobile } from "./isMobile";
import MobileTeam from "./pages/MobileTeam";
import MobileSupportPage from "./pages/MobileSupportPage"

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
