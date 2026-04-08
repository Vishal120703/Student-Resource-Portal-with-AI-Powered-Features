import { Routes, Route } from "react-router-dom";
import InterviewSetup from "../pages/InterviewSetup.jsx";
import Interview from "../pages/Interview.jsx";
import Result from "../pages/Result.jsx";

function App() {
  return (
      <Routes>
        <Route path="/" element={<InterviewSetup />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/result" element={<Result />} />
      </Routes>
  );
}

export default App;