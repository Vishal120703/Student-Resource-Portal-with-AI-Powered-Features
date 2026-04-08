import { useEffect, useState } from "react";

function Result() {
  const [result, setResult] = useState(null);

  useEffect(() => {
  const stored = sessionStorage.getItem("result");

  if (!stored || stored === "undefined") {
    console.error("No valid result found");
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    setResult(parsed);
  } catch (err) {
    console.error("JSON parse error:", err);
  }
}, []);

  if (!result) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎯 Interview Result</h1>

      {/* Score */}
      <h2 style={{ fontSize: "40px", color: "blue" }}>
        {result.score}/100
      </h2>

      {/* Breakdown */}
      <p>📢 Communication: {result.communication}%</p>
      <p>💻 Technical: {result.technical}%</p>
      <p>🔥 Confidence: {result.confidence}%</p>

      {/* Feedback */}
      <h3>✅ Strengths</h3>
      <p>{result.strengths}</p>

      <h3>⚠️ Weaknesses</h3>
      <p>{result.weaknesses}</p>

      <h3>💡 Suggestions</h3>
      <p>{result.suggestions}</p>
    </div>
  );
}

export default Result;