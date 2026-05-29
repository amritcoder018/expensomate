import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
  Button
} from "@mui/material";
import ExpenseBlock from "./ExpenseBlock";
import MicIcon from "@mui/icons-material/Mic";
import ResetIcon from "@mui/icons-material/RestartAlt";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { GoogleGenAI } from "@google/genai";

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
  status?:"saved"|"unsaved";
};
export interface Expense {
  id:string;
  expenseName: string;
  expenseCategory: string;
  expenseAmount: number | null;
  dateOfTransaction: string;
}
interface ExpenseDBObject{
  id?:number;
  createdAt?:string;
  expenseId:string;
  name: string;
  category: string;
  date: string;
  amount: number | null;
  userId:string;
}

/**
 * Detects whether response contains valid JSON array
 */
export const convertExpensesToResponse = (
  expenses: Expense[]
): string => {
  
  return `object created
${JSON.stringify(expenses, null, 2)}`;
};
export const isJsonResponse = (response: string): boolean => {
  try {
    // Extract JSON part
    const jsonStart = response.indexOf("[");

    if (jsonStart === -1) {
      return false;
    }

    const jsonString = response.slice(jsonStart);

    JSON.parse(jsonString);

    return true;
  } catch {
    return false;
  }
};

/**
 * Extracts and returns Expense array
 */


// 1. Target environment variables securely from build engine constants
// const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.REACT_APP_GEMINI_API_KEY;
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  export async function saveExpensesInDB(
  expenses: Expense[]
) {
  try {
    const payload:ExpenseDBObject[] = expenses.map((expense) => ({
    expenseId:expense.id,
    name:expense.expenseName,
    category:expense.expenseCategory,
    date:expense.dateOfTransaction,
    amount:expense.expenseAmount,
    userId:"Guest001"
    }));

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/expenses`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed: ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Saved Expenses:", data);

    return data;
  } catch (error) {
    console.error(
      "Bulk Save Expense Error:",
      error
    );
    throw error;
  }
}
const ChatUI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hello 👋 Start speaking or type your message to log an expense.",
    },
  ]);
  const saveExpense = (message:Message)=>{
  if(message.status!=="unsaved") return;
  try{
  saveExpensesInDB(getExpenseArray(message.text));
  setMessages((msgs: Message[]) => msgs.map(m => m.id === message.id ? {...m, status:"saved"} : m));

  }catch{
    console.log("error occured while saving");
  }
 
  // Here you would implement the actual save logic, e.g.:
  // await api.saveExpenses(expenses);
}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
const getExpenseArray = (response: string): Expense[] => {
  try {
    // Find starting point of JSON array
    const jsonStart = response.indexOf("[");

    if (jsonStart === -1) {
      return [];
    }

    // Extract JSON section
    const jsonString = response.slice(jsonStart);

    // Parse JSON
    const parsedData = JSON.parse(jsonString);

    // Ensure array
    if (!Array.isArray(parsedData)) {
      return [];
    }
    const newExpenses:Expense[]=parsedData.map((item) => ({
      id: item.id??Date.now().toString() + Math.random().toString(36).substr(2, 9),
      expenseName: item.expenseName ?? "",
      expenseCategory: item.expenseCategory ?? "",
      expenseAmount:
        item.expenseAmount !== null &&
        item.expenseAmount !== undefined
          ? Number(item.expenseAmount)
          : null,
      dateOfTransaction: item.dateOfTransaction ?? "",
    }));
    console.log(newExpenses);
    return newExpenses;
  } catch (error) {
    console.error("Failed to parse expense response:", error);
    return [];
  }
};

  // 2. Instantiate Gemini SDK framework cleanly inside browser thread
  const ai = useMemo(() => {
    if (!API_KEY) return null;
    return new GoogleGenAI({ apiKey: API_KEY });
  }, []);

  // 3. Keep system instructions fully isolated inside the component logic
  const systemInstruction = useMemo(() => {
    const currentDate = new Date().toLocaleDateString();
    return `
      You are an accounting clerk.
       Current Date is ${currentDate}, user may not mention the date straight away so corelate with today's date to get relative date from the indirect mention of date(yesterday, today, x days back, exaclty last month same date, etc) and convert it to (dd-mm-yy).
        Your job is to process english language text to fetch valuable data like expenseName(String), expenseCategory(String), expenseAmount(Number), dateOfTransaction( YYYY-MM-DD).
         If a person misses data, ask for that specific one until all data is fetched.
          Give suggestions for categories. If multiple dates are mentioned, analyze them and collect data for mentioned dates.
          do not ask for confirmation unless text are confusing.
           Once all data is fetched for all dates, return array of json object starting with "object created" string after assigning "id" field with random value based on timestamp to each expenses. Use only one sentence to ask for data.Note that return json should only contain prefix 'obect created' no other text.
           If user wants to update any of the provided expense with new data, update and display all the list of expenses again
           always check for latest json data with 'object created' prefix when analysing chat history to get udpated data like expenseName, expenseCategory, dateOfTransaction, expenseAmount etc, user may edit and update it.
            If user deviates from the topic, say: "Lets focus on recording your expenses only!."
    `;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const MAX_WORDS = 50;
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
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
      const combinedText =
        accumulatedTranscriptRef.current + interimTranscript;
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

    recognition.onend = () => {
      setIsListening(false);
    };

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
  function updateLastExpense(id:string,fieldName:string,updatedValue:string){
    handleUpdateRequest(`Update for id:${id} replace current value of ${fieldName} as ${updatedValue}`);
  }
  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleCancel = () => {
    setInput("");
    accumulatedTranscriptRef.current = "";
    if (isListening) {
      stopListening();
    }
  };

  // 4. Removed external API fetch. Connect directly with Google client profile
  const sendData = async (currentPrompt: string, historySnapshot: Message[]): Promise<string> => {
    if (!ai) {
      return "Error: API key missing. Please verify your Vercel Environment variables setup.";
    }

    try {
      // Exclude the initial greeting message block from context if present
      const chatContext = historySnapshot.filter(msg => msg.id !== 1);

      // Translate React context state properties smoothly into structural shape Gemini needs
      const formattedHistory = chatContext.map((msg) => ({
        role: msg.sender === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: msg.text }],
      }));

      // Initialize ephemeral stateless run instance with our payload
      const chat = ai.chats.create({ 
  // Update this line to the official GA model identifier
  model: "gemini-3.1-flash-lite", 
  history: formattedHistory, 
  config: { 
    systemInstruction, 
    temperature: 0.3, 
  }, 
});


      const response = await chat.sendMessage({ message: currentPrompt });
      return response.text || "No response text found.";
    } catch (err: any) {
      console.error("Gemini Frontend Error:", err);
      return `Error processing request: ${err.message || "Unknown issue"}`;
    }
  };

  // 5. Instantly clear chat locally without managing a backend cache instance
  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "bot",
        text: "Chat session cleared! Let's start over fresh.",
      },
    ]);
    setInput("");
    accumulatedTranscriptRef.current = "";
  };
  const handleUpdateRequest= async (command:string)=>{
    const userMessage:Message={
      id:Date.now(),
      sender:"user",
      text:command,
    };
        const historySnapshot = [...messages];

    setMessages((prev) => [...prev, userMessage]);
    accumulatedTranscriptRef.current = "";
    setLoading(true);

    const replyText = await sendData(command, historySnapshot);

    const botMessage: Message = {
      id: Date.now() + 1,
      sender: "bot",
      text: replyText,
      status: isJsonResponse(replyText) ? "unsaved" : undefined,
    };
    setMessages((prev) => [...prev, botMessage]);
    setLoading(false);

  }

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (isListening) {
      stopListening();
    }

    const userText = input;
    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: userText,
    };

    // Capture the current history before adding the new user message to pass to the engine pipeline
    const historySnapshot = [...messages];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    accumulatedTranscriptRef.current = "";
    setLoading(true);

    const replyText = await sendData(userText, historySnapshot);

    const botMessage: Message = {
      id: Date.now() + 1,
      sender: "bot",
      text: replyText,
      status: isJsonResponse(replyText) ? "unsaved" : undefined,
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
          {messages.map((msg,index) => { 
            const isUser = msg.sender === "user"; 
            return ( 
              <Box key={msg.id} sx={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", mb: 2 }} > 
                <Box sx={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: 1, alignItems: "flex-end", maxWidth: "78%" }} > 
                  <Avatar sx={{ bgcolor: isUser ? "#7B1FA2" : "#D8B4FE", color: isUser ? "#fff" : "#5B21B6" }} > 
                    {isUser ? <PersonIcon /> : <SmartToyIcon />} 
                  </Avatar> 
                  <Box sx={{ px: 2, py: 1.5, borderRadius: 4, backgroundColor: isUser ? "#7B1FA2" : "#EDE9FE", color: isUser ? "#fff" : "#3B0764", boxShadow: 2 }} > 
                    {isJsonResponse(msg.text) ? (
                      getExpenseArray(msg.text).map((expense) => (
                        <ExpenseBlock key={expense.id} expense={expense} isLastMessage={index===messages.length-1} updateExpenses={updateLastExpense}/>
                      ))
                    ) : (
                      <Typography sx={{ lineHeight: 1.5, whiteSpace: "pre-wrap" }} > {msg.text} </Typography>
                    )}
                    { index===messages.length-1 && msg.status === "unsaved" && (
                      <Button variant="contained" onClick={() =>saveExpense(msg)} size="small" sx={{ mt: 1, color: "white",fontWeight: 600, textTransform: "none",backgroundColor:"red", fontSize: "0.75rem", "&:hover": { bgcolor: "#fe2626" } }} >
                        save
                      </Button>
                    )}
                    {msg.status === "saved" && (
                      <Typography variant="caption" sx={{ mt: 0.5,backgroundColor:"#2bf032",borderRadius: 4, color: "#fff", fontStyle: "italic" ,fontWeight: 600}} >Expense Saved </Typography>
                    ) }
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