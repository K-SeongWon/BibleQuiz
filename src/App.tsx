import { Route, Routes } from "react-router-dom";
import Home from "./client/Home";
import Console from "./client/console/Console";
import Pad from "./client/pad/Pad";
import Stage from "./client/stage/Stage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stage/:roomCode?" element={<Stage />} />
      <Route path="/console" element={<Console />} />
      <Route path="/console/:roomCode" element={<Console />} />
      <Route path="/pad/:roomCode?" element={<Pad />} />
    </Routes>
  );
}
