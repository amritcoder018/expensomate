import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

const ChatUI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hello 👋 Start speaking or type your message.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);
  

 const MAX_WORDS = 50;

const getWordCount = (text: string) => {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
};

// Speech Recognition Setup
useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error("Speech Recognition not supported");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    let interimTranscript = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ) {
      const transcript =
        event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        accumulatedTranscriptRef.current +=
          transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    const combinedText =
      accumulatedTranscriptRef.current +
      interimTranscript;

    const words = combinedText
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    // Stop at 50 words
    if (words.length >= MAX_WORDS) {
      const limitedText = words
        .slice(0, MAX_WORDS)
        .join(" ");

      setInput(limitedText);

      recognition.stop();
      setIsListening(false);

      return;
    }

    setInput(combinedText);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognitionRef.current = recognition;
}, []);

const startListening = () => {
  if (!recognitionRef.current) return;

  // Fresh voice session
  accumulatedTranscriptRef.current = input;

  setIsListening(true);

  recognitionRef.current.start();
};
const stopListening = () => {
  if (!recognitionRef.current) return;

  recognitionRef.current.stop();
  setIsListening(false);
};

const handleMicToggle = () => {
  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
};

const handleCancel = () => {
  setInput("");

  // Reset speech memory
  accumulatedTranscriptRef.current = "";

  if (isListening) {
    stopListening();
  }
};
const handleSend = async () => {
  if (!input.trim()) return;

  // Stop mic before sending
  if (isListening) {
    stopListening();
  }

  const userMessage = {
    id: Date.now(),
    sender: "user" as const,
    text: input,
  };

  setMessages((prev) => [...prev, userMessage]);

  setInput("");

  // Reset speech state
  accumulatedTranscriptRef.current = "";

  setLoading(true);

  setTimeout(() => {
    const botMessage = {
      id: Date.now() + 1,
      sender: "bot" as const,
      text: "This is a sample AI response.",
    };

    setMessages((prev) => [...prev, botMessage]);

    setLoading(false);
  }, 1800);
};

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(to bottom right, #f5edff, #efe0ff)",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: "850px",
          height: "92vh",
          borderRadius: 6,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p:{ xs: 2, md: 3 },
            background:
              "linear-gradient(to right, #6A1B9A, #8E24AA)",
            color: "white",
            fontWeight: 700,
            fontSize: "1.1rem",
            textAlign: "center",
          }}
        >
         AI Assistant
        </Box>

        {/* Chat Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2,
            py: 3,
            backgroundColor: "#faf7ff",
          }}
        >
          {/* Existing Messages */}
          {messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent: isUser
                    ? "flex-end"
                    : "flex-start",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: isUser
                      ? "row-reverse"
                      : "row",
                    gap: 1,
                    alignItems: "flex-end",
                    maxWidth: "78%",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: isUser
                        ? "#7B1FA2"
                        : "#D8B4FE",
                      color: isUser
                        ? "#fff"
                        : "#5B21B6",
                    }}
                  >
                    {isUser ? (
                      <PersonIcon />
                    ) : (
                      <SmartToyIcon />
                    )}
                  </Avatar>

                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 4,
                      backgroundColor: isUser
                        ? "#7B1FA2"
                        : "#EDE9FE",
                      color: isUser
                        ? "#fff"
                        : "#3B0764",
                      boxShadow: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.text}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Live Transparent Typing Preview */}
          {input.trim() && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  maxWidth: "78%",
                  px: 2,
                  py: 1.5,
                  borderRadius: 4,
                  backgroundColor:
                    "rgba(123, 31, 162, 0.15)",
                  border: "1px dashed #B388FF",
                  backdropFilter: "blur(5px)",
                }}
              >
                <Typography
                  sx={{
                    color: "rgba(90, 24, 154, 0.65)",
                    whiteSpace: "pre-wrap",
                    fontStyle: "italic",
                  }}
                >
                  {input}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Loading */}
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 4,
                  backgroundColor: "#EDE9FE",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CircularProgress
                  size={18}
                  sx={{ color: "#7B1FA2" }}
                />

                <Typography
                  sx={{
                    color: "#5B21B6",
                  }}
                >
                  Processing...
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Section */}
        <Box
  sx={{
    borderTop: "1px solid #e9d5ff",
    p: 2,
    backgroundColor: "#fff",
  }}
>
  <Box
    sx={{
      display: "flex",
      gap: 1,
      alignItems: "center",
    }}
  >
    {/* Text Input */}
<TextField
  fullWidth
  value={input}
  onChange={(e) => {
    const value = e.target.value;

    const words = value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length <= MAX_WORDS) {
      setInput(value);

      // Sync manual edits with speech state
      accumulatedTranscriptRef.current = value;
    }
  }}
  placeholder={
    isListening
      ? "Speak now..."
      : "Type a message..."
  }
  variant="outlined"
  multiline
  maxRows={4}
  sx={{
    "& .MuiOutlinedInput-root": {
      borderRadius: 5,
      backgroundColor: "#faf7ff",
      pr: input.trim() ? 1 : 0,
    },
  }}
  slotProps={{
    input: {
      endAdornment: input.trim() ? (
        <IconButton
          onClick={handleCancel}
          size="small"
          sx={{
            color: "#BE185D",
            mr: 0.5,
          }}
        >
          ✕
        </IconButton>
      ) : null,
    },
  }}
/>
  
    {/* Mic Button */}
    <IconButton
      onClick={handleMicToggle}
      sx={{
        width: 52,
        height: 52,
        backgroundColor: isListening
          ? "#9C27B0"
          : "#F3E8FF",
        color: isListening
          ? "#fff"
          : "#7B1FA2",
        "&:hover": {
          backgroundColor: isListening
            ? "#8E24AA"
            : "#E9D5FF",
        },
      }}
    >
      {isListening ? <StopIcon /> : <MicIcon />}
    </IconButton>

    {/* Send Button */}
    <IconButton
      onClick={handleSend}
      disabled={loading}
      sx={{
        width: 52,
        height: 52,
        backgroundColor: "#7B1FA2",
        color: "#fff",
        "&:hover": {
          backgroundColor: "#6A1B9A",
        },
      }}
    >
      <SendIcon />
    </IconButton>
  </Box>

  {/* Word Count + Limit Warning */}
  <Box
    sx={{
      mt: 1,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color:
          getWordCount(input) >= MAX_WORDS
            ? "red"
            : "#7B1FA2",
        fontWeight:
          getWordCount(input) >= MAX_WORDS
            ? 600
            : 400,
      }}
    >
      {getWordCount(input) >= MAX_WORDS
        ? "Word limit reached (50 words max)"
        : `${getWordCount(input)} / ${MAX_WORDS} words`}
    </Typography>
  </Box>
</Box>
      </Paper>
    </Box>
  );
};

export default ChatUI;