import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateQuestions } from "../services/Interview.services.js";

function InterviewSetup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    position: "",
    experience: "",
    mode: "technical"
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return alert("Upload resume");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("position", form.position);
      formData.append("experience", form.experience);
      formData.append("mode", form.mode);

      const res = await generateQuestions(formData);
      console.log(res.data);
      sessionStorage.setItem("questions",
        JSON.stringify(res.data.questions)
    );

      navigate("/interview");

    } catch (err) {
      console.error(err);
      alert("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Start Interview</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="position"
          placeholder="Position (e.g. MERN Developer)"
          onChange={handleChange}
        />

        <input
          type="text"
          name="experience"
          placeholder="Experience (e.g. Fresher / 2 years)"
          onChange={handleChange}
        />

        <select name="mode" onChange={handleChange}>
          <option value="technical">Technical</option>
          <option value="hr">HR</option>
        </select>

        <input type="file" onChange={handleFile} />

        <button type="submit">
          {loading ? "Generating..." : "Start Interview"}
        </button>
      </form>
    </div>
  );
}

export default InterviewSetup;