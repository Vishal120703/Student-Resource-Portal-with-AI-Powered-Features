import { Routes, Route } from "react-router-dom";
import InterviewSetup from "../pages/InterviewSetup.jsx";
import Interview from "../pages/Interview.jsx";

function App() {
  return (
      <Routes>
        <Route path="/" element={<InterviewSetup />} />
        <Route path="/interview" element={<Interview />} />
      </Routes>
  );
}

export default App;