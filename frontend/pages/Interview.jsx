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

  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscript = useRef("");

  // 🎤 Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
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

    // ✅ important: detect stop
    recognition.onend = () => {
      console.log("🎤 Mic fully stopped");
    };

    recognitionRef.current = recognition;
  }, []);

  // 🔊 Speak Question
  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.onend = () => {
      startTimer();
      startListening();
    };

    window.speechSynthesis.speak(speech);
  };

  // ⏱ Per Question Timer
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
    totalTimerRef.current = setInterval(() => {
      setTotalTime((prev) => {
        if (prev <= 1) {
          clearInterval(totalTimerRef.current);
          finishInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(totalTimerRef.current);
  }, []);

  // 🎤 Start Listening
  const startListening = () => {
    if (!recognitionRef.current) return;

    finalTranscript.current = "";
    setLiveText("");

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.log("Speech start error:", err);
    }
  };

  // 🎤 Stop Listening (🔥 FIXED)
  const stopListening = () => {
    return new Promise((resolve) => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onend = () => {
            console.log("🎤 Fully stopped");
            resolve();
          };

          recognitionRef.current.stop();
          recognitionRef.current.abort();

          // fallback (important)
          setTimeout(resolve, 300);
        } else {
          resolve();
        }
      } catch (err) {
        console.log("Speech stop error:", err);
        resolve();
      }
    });
  };

  // ▶️ Next Question (🔥 FIXED)
  const handleNext = async () => {
    stopTimer();

    await stopListening(); // ✅ wait until mic stops

    const answer = finalTranscript.current || "No answer";

    const updatedAnswers = [...answers, answer];

    setAnswers(updatedAnswers);
    sessionStorage.setItem("answers", JSON.stringify(updatedAnswers));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishInterview(updatedAnswers);
    }
  };

  // 🏁 Finish Interview (🔥 FIXED)
  const finishInterview = async (existingAnswers = answers) => {
    stopTimer();

    await stopListening(); // ✅ wait here too

    clearInterval(totalTimerRef.current);
    window.speechSynthesis.cancel(); // 🔥 stop speaker instantly

    let finalAnswers;

    if (existingAnswers.length === questions.length) {
      finalAnswers = existingAnswers;
    } else {
      finalAnswers = [
        ...existingAnswers,
        finalTranscript.current || "No answer",
      ];
    }

    console.log("FINAL ANSWERS:", finalAnswers);

    try {
      const res = await fetch("http://localhost:5000/interview/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions,
          answers: finalAnswers,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Evaluation failed");
        return;
      }

      sessionStorage.setItem("result", JSON.stringify(data.data));
      navigate("/result");
    } catch (err) {
      console.error(err);
      alert("Evaluation failed");
    }
  };

  // 🔁 On Question Change
  useEffect(() => {
    if (questions.length) {
      speakQuestion(questions[currentIndex]);
    }

    return () => stopTimer();
  }, [currentIndex]);

  // 🔥 CLEANUP ON EXIT
  useEffect(() => {
    return () => {
      stopListening();
      window.speechSynthesis.cancel();
      clearInterval(timerRef.current);
      clearInterval(totalTimerRef.current);
    };
  }, []);

  if (!questions.length) {
    return <h2>No questions found. Go back and start again.</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Question {currentIndex + 1}</h2>

      <p>{questions[currentIndex]}</p>

      <h3>
        ⏱ Question Time: {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </h3>

      <h3>
        🕒 Total Time Left: {Math.floor(totalTime / 60)}:
        {String(totalTime % 60).padStart(2, "0")}
      </h3>

      <p>🎤 {liveText || "Start speaking..."}</p>

      <br />

      <button onClick={() => speakQuestion(questions[currentIndex])}>
        🔁 Repeat
      </button>

      <button onClick={handleNext}>Next</button>

      <button onClick={() => finishInterview()}>
        🏁 Finish
      </button>
    </div>
  );
}

export default Interview;