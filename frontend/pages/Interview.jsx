import { useEffect, useRef, useState } from "react";

function Interview() {
  const questions = JSON.parse(sessionStorage.getItem("questions")) || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // per question
  const [totalTime, setTotalTime] = useState(1800); // 30 min
  const [liveText, setLiveText] = useState("");

  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscript = useRef("");
  const isInterviewActive = useRef(true);

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

    recognitionRef.current = recognition;
  }, []);

  // 🔊 Speak Question
  const speakQuestion = (text) => {
    window.speechSynthesis.cancel(); // prevent repeat

    const speech = new SpeechSynthesisUtterance(text);

    speech.onend = () => {
      startTimer();
      startListening();
    };

    window.speechSynthesis.speak(speech);
  };

  // ⏱ Per Question Timer (5 min)
  const startTimer = () => {
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

  // 🌍 Global Timer (30 min)
  useEffect(() => {
    totalTimerRef.current = setInterval(() => {
      setTotalTime((prev) => {
        if (prev <= 1) {
          clearInterval(totalTimerRef.current);
          handleExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(totalTimerRef.current);
  }, []);

  // 🎤 Start / Stop Listening
  const startListening = () => {
    finalTranscript.current = "";
    setLiveText("");
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current.stop();
  };

  // ▶️ Next Question
  const handleNext = () => {
    stopTimer();
    stopListening();

    setAnswers((prev) => {
      const updated = [...prev, finalTranscript.current || "No answer"];
      sessionStorage.setItem("answers", JSON.stringify(updated));
      return updated;
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishInterview();
    }
  };

  // ❌ Exit Interview
  const handleExit = () => {
    stopTimer();
    stopListening();
    isInterviewActive.current = false;

    setAnswers((prev) => {
      const updated = [...prev, finalTranscript.current || "No answer"];
      sessionStorage.setItem("answers", JSON.stringify(updated));
      return updated;
    });

    alert("Interview Ended. Responses Saved.");
  };

  // 🏁 Finish Interview
  const finishInterview = () => {
    stopTimer();
    stopListening();
    clearInterval(totalTimerRef.current);

    alert("Interview Completed!");
  };

  // 🔁 On Question Change
  useEffect(() => {
    if (questions.length) {
      speakQuestion(questions[currentIndex]);
    }

    return () => stopTimer();
  }, [currentIndex]);

  if (!questions.length) {
    return <h2>No questions found. Go back and start again.</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Question {currentIndex + 1}</h2>

      <p>{questions[currentIndex]}</p>

      {/* ⏱ Per Question Timer */}
      <h3>
        ⏱ Question Time: {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </h3>

      {/* 🌍 Total Timer */}
      <h3>
        🕒 Total Time Left: {Math.floor(totalTime / 60)}:
        {String(totalTime % 60).padStart(2, "0")}
      </h3>

      {/* 🎤 Live Speech */}
      <p>🎤 {liveText || "Start speaking..."}</p>

      <br />

      {/* Buttons */}
      <button onClick={() => speakQuestion(questions[currentIndex])}>
        🔁 Repeat
      </button>

      <button onClick={handleNext}>Next</button>

      <button onClick={handleExit}>❌ Exit</button>
    </div>
  );
}

export default Interview;