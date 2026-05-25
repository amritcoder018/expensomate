import React, { useEffect, useRef, useState } from "react";

const RecordSpeach: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Browser support check
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let currentTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }

      setTranscript(currentTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>Speech To Text</h1>

      <button
        onClick={toggleListening}
        style={{
          padding: "12px 20px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          backgroundColor: isListening ? "red" : "blue",
          color: "white",
          fontSize: "16px",
        }}
      >
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>

      <p
        style={{
          maxWidth: "600px",
          textAlign: "center",
          fontSize: "18px",
          lineHeight: "1.5",
        }}
      >
        {transcript || "Your speech will appear here..."}
      </p>
    </div>
  );
};

export default RecordSpeach;