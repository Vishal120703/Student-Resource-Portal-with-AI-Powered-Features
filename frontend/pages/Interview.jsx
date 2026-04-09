import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Interview() {
  const navigate = useNavigate();

  const questions = JSON.parse(sessionStorage.getItem("questions")) || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [totalTime, setTotalTime] = useState(1800);
  const [liveText, setLiveText] = useState("");
  const [started, setStarted] = useState(false); // 🔥 important

  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscript = useRef("");

  const cheatCountRef = useRef(0);
  const isTerminatedRef = useRef(false);

  // 🔲 Fullscreen
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
  };

  // 🎤 Speech setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript.current += text + " ";
        } else {
          interim += text;
        }
      }

      setLiveText(finalTranscript.current + interim);
    };

    recognitionRef.current = recognition;
  }, []);

  // 🎤 Start Listening
  const startListening = () => {
    finalTranscript.current = "";
    setLiveText("");

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.log(err);
    }
  };

  // 🎤 Stop Listening
  const stopListening = () => {
    return new Promise((resolve) => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onend = () => resolve();
          recognitionRef.current.stop();
          recognitionRef.current.abort();
          setTimeout(resolve, 300);
        } else {
          resolve();
        }
      } catch {
        resolve();
      }
    });
  };

  // 🔊 Speak
  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.onend = () => {
      startTimer();
      startListening();
    };

    window.speechSynthesis.speak(speech);
  };

  // ⏱ Timer
  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(300);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => clearInterval(timerRef.current);

  // 🌍 Total Timer
  useEffect(() => {
    if (!started) return;

    totalTimerRef.current = setInterval(() => {
      setTotalTime((prev) => {
        if (prev <= 1) {
          clearInterval(totalTimerRef.current);
          finishInterviewSafe();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(totalTimerRef.current);
  }, [started]);

  // 🛡 Safe Finish
  const finishInterviewSafe = async (existing = answers) => {
    if (isTerminatedRef.current) return;

    isTerminatedRef.current = true;
    await finishInterview(existing);
  };

  // 🏁 Finish
  const finishInterview = async (existing = answers) => {
    stopTimer();
    await stopListening();
    clearInterval(totalTimerRef.current);
    window.speechSynthesis.cancel();
    exitFullscreen();

    const finalAnswers =
      existing.length === questions.length
        ? existing
        : [...existing, finalTranscript.current || "No answer"];

    try {
      const res = await fetch("http://localhost:5000/interview/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questions, answers: finalAnswers }),
      });

      const data = await res.json();
      sessionStorage.setItem("result", JSON.stringify(data.data));
      navigate("/result");
    } catch {
      alert("Error submitting interview");
    }
  };

  // 🚫 Anti-cheat
  useEffect(() => {
    if (!started) return;

    const handleViolation = (type) => {
      if (isTerminatedRef.current) return;

      cheatCountRef.current++;

      alert(`⚠️ ${type} (${cheatCountRef.current}/3)`);

      if (cheatCountRef.current >= 3) {
        alert("❌ Auto-submitted!");
        finishInterviewSafe();
      }
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) handleViolation("Tab Switch");
    });

    window.addEventListener("blur", () =>
      handleViolation("Window Switch")
    );

    document.addEventListener("copy", (e) => {
      e.preventDefault();
      handleViolation("Copy");
    });

    document.addEventListener("paste", (e) => {
      e.preventDefault();
      handleViolation("Paste");
    });

    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      handleViolation("Right Click");
    });

  }, [started]);

  // ▶️ Start Interview (IMPORTANT FIX)
  const startInterview = () => {
    enterFullscreen();
    speakQuestion(questions[currentIndex]);
    setStarted(true);
  };

  // ▶️ Next
  const handleNext = async () => {
    stopTimer();
    await stopListening();

    const updated = [...answers, finalTranscript.current || "No answer"];
    setAnswers(updated);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1);
      speakQuestion(questions[currentIndex + 1]);
    } else {
      finishInterviewSafe(updated);
    }
  };

  // 🔥 Cleanup
  useEffect(() => {
    return () => {
      stopListening();
      window.speechSynthesis.cancel();
      clearInterval(timerRef.current);
      clearInterval(totalTimerRef.current);
    };
  }, []);

  // 🛑 No Questions
  if (!questions.length) {
    return <h2>No questions found</h2>;
  }

  // 🚀 START SCREEN
  if (!started) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Ready to Start Interview?</h2>
        <button onClick={startInterview}>
          ▶️ Start Interview
        </button>
      </div>
    );
  }

  // 🎯 MAIN UI
  return (
    <div style={{ padding: "20px" }}>
      <h2>Question {currentIndex + 1}</h2>

      <p>{questions[currentIndex]}</p>

      <h3>
        ⏱ {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </h3>

      <h3>
        🕒 {Math.floor(totalTime / 60)}:
        {String(totalTime % 60).padStart(2, "0")}
      </h3>

      <p>🎤 {liveText || "Start speaking..."}</p>

      <button onClick={handleNext}>Next</button>
      <button onClick={() => finishInterviewSafe()}>Finish</button>
    </div>
  );
}

export default Interview;