import React, { useEffect, useRef, useState } from "react"; 
import { Avatar, Box, CircularProgress, IconButton, Paper, TextField, Typography, } from "@mui/material"; 
import MicIcon from "@mui/icons-material/Mic"; 
import ResetIcon from "@mui/icons-material/RestartAlt"; 
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
    { id: 1, sender: "bot", text: "Hello 👋 Start speaking or type your message to log an expense.", }, 
  ]); 
  const [input, setInput] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [isListening, setIsListening] = useState(false); 

  // Persistent session management ID
  const userIdRef = useRef<string>("");

  const recognitionRef = useRef<any>(null); 
  const accumulatedTranscriptRef = useRef(""); 
  const messagesEndRef = useRef<HTMLDivElement | null>(null); 

  const scrollToBottom = () => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }; 

  useEffect(() => { 
    scrollToBottom(); 
  }, [messages, loading]); 

  // Establish a unique session ID for the user on initial load
  useEffect(() => {
    userIdRef.current = `usr_${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const MAX_WORDS = 50; 
  const getWordCount = (text: string) => { 
    return text.trim().split(/\s+/).filter(Boolean).length; 
  }; 

  // Speech Recognition Setup 
  useEffect(() => { 
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; 
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
      for (let i = event.resultIndex; i < event.results.length; i++) { 
        const transcript = event.results[i][0].transcript; 
        if (event.results[i].isFinal) { 
          accumulatedTranscriptRef.current += transcript + " "; 
        } else { 
          interimTranscript += transcript; 
        } 
      } 
      const combinedText = accumulatedTranscriptRef.current + interimTranscript; 
      const words = combinedText.trim().split(/\s+/).filter(Boolean); 
      
      if (words.length >= MAX_WORDS) { 
        const limitedText = words.slice(0, MAX_WORDS).join(" "); 
        setInput(limitedText); 
        recognition.stop(); 
        setIsListening(false); 
        return; 
      } 
      setInput(combinedText); 
    }; 
    recognition.onend = () => { setIsListening(false); }; 
    recognitionRef.current = recognition; 
  }, []); 

  const startListening = () => { 
    if (!recognitionRef.current) return; 
    accumulatedTranscriptRef.current = input; 
    setIsListening(true); 
    recognitionRef.current.start(); 
  }; 

  const stopListening = () => { 
    if (!recognitionRef.current) return; 
    recognitionRef.current.stop(); 
    setIsListening(false); 
  }; 

  const handleMicToggle = () => { if (isListening) { stopListening(); } else { startListening(); } }; 
  const handleCancel = () => { setInput(""); accumulatedTranscriptRef.current = ""; if (isListening) { stopListening(); } }; 

  // Connects prompt with the server's session tracker using userId
  const sendData = async (currentPrompt: string): Promise<string> => { 
    try {
      const res = await fetch('/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          prompt: currentPrompt, 
          userId: userIdRef.current 
        }), 
      }); 
      
      if (!res.ok) throw new Error("Server error");
      const data = await res.json(); 
      return data.text; 
    } catch (err) {
      console.error("Fetch Error:", err);
      return "Sorry, I ran into an error connecting to the server.";
    }
  }; 

  // Clears live message state and signals backend to drop the memory instance
  const handleResetChat = async () => { 
    setLoading(true);
    try {
      await fetch('/api/chat/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdRef.current })
      });
    } catch (err) {
      console.error("Failed to reset session on server:", err);
    }
    
    setMessages([
      { id: Date.now(), sender: "bot", text: "Chat session cleared! Let's start over fresh." }
    ]);
    setInput("");
    accumulatedTranscriptRef.current = "";
    setLoading(false);
  }; 

  const handleSend = async () => { 
    if (!input.trim() || loading) return; 

    if (isListening) { stopListening(); } 

    const userText = input;
    const userMessage = { id: Date.now(), sender: "user" as const, text: userText }; 
    
    setMessages((prev) => [...prev, userMessage]); 
    setInput(""); 
    accumulatedTranscriptRef.current = ""; 
    setLoading(true); 

    const replyText = await sendData(userText);

    const botMessage = { 
      id: Date.now() + 1, 
      sender: "bot" as const, 
      text: replyText, 
    }; 
    setMessages((prev) => [...prev, botMessage]); 
    setLoading(false); 
  }; 

  return ( 
    <Box sx={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(to bottom right, #f5edff, #efe0ff)", p: 2 }} > 
      <Paper elevation={8} sx={{ width: "100%", maxWidth: "850px", height: "92vh", borderRadius: 6, overflow: "hidden", display: "flex", flexDirection: "column", background: "#ffffff" }} > 
        <Box sx={{ p:{ xs: 2, md: 3 }, background: "linear-gradient(to right, #6A1B9A, #8E24AA)", color: "white", fontWeight: 700, fontSize: "1.1rem", textAlign: "center" }} > 
          Accounting Clerk Session Agent 
        </Box> 
        <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 3, backgroundColor: "#faf7ff" }} > 
          {messages.map((msg) => { 
            const isUser = msg.sender === "user"; 
            return ( 
              <Box key={msg.id} sx={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", mb: 2 }} > 
                <Box sx={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: 1, alignItems: "flex-end", maxWidth: "78%" }} > 
                  <Avatar sx={{ bgcolor: isUser ? "#7B1FA2" : "#D8B4FE", color: isUser ? "#fff" : "#5B21B6" }} > 
                    {isUser ? <PersonIcon /> : <SmartToyIcon />} 
                  </Avatar> 
                  <Box sx={{ px: 2, py: 1.5, borderRadius: 4, backgroundColor: isUser ? "#7B1FA2" : "#EDE9FE", color: isUser ? "#fff" : "#3B0764", boxShadow: 2 }} > 
                    <Typography sx={{ lineHeight: 1.5, whiteSpace: "pre-wrap" }} > {msg.text} </Typography> 
                  </Box> 
                </Box> 
              </Box> 
            ); 
          })} 
          {input.trim() && ( 
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }} > 
              <Box sx={{ maxWidth: "78%", px: 2, py: 1.5, borderRadius: 4, backgroundColor: "rgba(123, 31, 162, 0.15)", border: "1px dashed #B388FF", backdropFilter: "blur(5px)" }} > 
                <Typography sx={{ color: "rgba(90, 24, 154, 0.65)", whiteSpace: "pre-wrap", fontStyle: "italic" }} > {input} </Typography> 
              </Box> 
            </Box> 
          )} 
          {loading && ( 
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }} > 
              <Box sx={{ px: 2, py: 1.5, borderRadius: 4, backgroundColor: "#EDE9FE", display: "flex", alignItems: "center", gap: 1 }} > 
                <CircularProgress size={18} sx={{ color: "#7B1FA2" }} /> 
                <Typography sx={{ color: "#5B21B6" }} > Processing... </Typography> 
              </Box> 
            </Box> 
          )} 
          <div ref={messagesEndRef} /> 
        </Box> 
        <Box sx={{ borderTop: "1px solid #e9d5ff", p: 2, backgroundColor: "#fff" }} > 
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }} > 
            <TextField fullWidth value={input} 
              onChange={(e) => { 
                const value = e.target.value; 
                if (getWordCount(value) <= MAX_WORDS) { setInput(value); accumulatedTranscriptRef.current = value; } 
              }} 
              placeholder={ isListening ? "Speak now..." : "Type a message..." } 
              variant="outlined" multiline maxRows={4} 
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 5, backgroundColor: "#faf7ff", pr: input.trim() ? 1 : 0 } }} 
              slotProps={{ input: { endAdornment: input.trim() ? ( <IconButton onClick={handleCancel} size="small" sx={{ color: "#BE185D", mr: 0.5 }} > ✕ </IconButton> ) : null } }} 
            /> 
            <IconButton onClick={handleMicToggle} sx={{ width: 52, height: 52, backgroundColor: isListening ? "#9C27B0" : "#F3E8FF", color: isListening ? "#fff" : "#7B1FA2", "&:hover": { backgroundColor: isListening ? "#8E24AA" : "#E9D5FF" } }} > 
              {isListening ? <StopIcon /> : <MicIcon />} 
            </IconButton> 
            <IconButton onClick={handleSend} disabled={loading} sx={{ width: 52, height: 52, backgroundColor: "#7B1FA2", color: "#fff", "&:hover": { backgroundColor: "#6A1B9A" } }} > 
              <SendIcon /> 
            </IconButton> 
            <IconButton onClick={handleResetChat} disabled={loading} sx={{ width: 52, height: 52, backgroundColor: "#7B1FA2", color: "#fff", "&:hover": { backgroundColor: "#6A1B9A" } }} > 

      <ResetIcon />
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