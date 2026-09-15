import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TunnelLab from "./pages/TunnelLab";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tunnel" element={<TunnelLab />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
