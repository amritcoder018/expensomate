import express from 'express'; 
import { GoogleGenAI } from '@google/genai'; 
import dotenv from 'dotenv'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
const currentDate = new Date().toLocaleDateString(); 

dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

const app = express(); 
app.use(express.json()); 

const ai = new GoogleGenAI({}); 

// Server-side Session Management Map
// Maps userId -> Active Google Gen AI Chat Session Instance
const chatSessions = new Map();

// Helper to construct system instructions
const getSystemInstruction = () => `
You are an accounting clerk. Current Date is ${currentDate}. 
Your job is to process english language text to fetch valuable data like expenseName(String), expenseCategory(String), expenseAmount(Number), dateOfTransaction(dd-mm-yy). 
If a person misses data, ask for that specific one until all data is fetched. Give suggestions for categories. 
If multiple dates are mentioned, analyze them and collect data for mentioned dates and give results in array of objects format with proper spacing and structure for better view. 
Once all data is fetched for all dates, return array of json object starting with "object created" string. 
Use only one sentence to ask for data. 
If user deviates from the topic, say: "Lets focus on recording your expenses only!."
`;

app.post('/api/chat', async (req, res) => { 
    try { 
        const { prompt, userId } = req.body; 

        if (!prompt) { 
            return res.status(400).json({ error: 'A valid text prompt is required.' }); 
        }
        if (!userId) {
            return res.status(400).json({ error: 'A unique userId is required for session tracking.' });
        }

        // 1. Check if an active chat session already exists for this user. If not, create one.
        if (!chatSessions.has(userId)) {
            console.log(`[Session]: Initializing new chat session for user: ${userId}`);
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash-lite',
                config: {
                    systemInstruction: getSystemInstruction(),
                    temperature: 0.3,
                }
            });
            chatSessions.set(userId, chat);
        }

        // 2. Fetch the existing active session
        const activeChat = chatSessions.get(userId);

        // 3. Send the message inline through the ongoing chat history pipeline
        const response = await activeChat.sendMessage({ message: prompt });

        // 4. Return just the response text. Google automatically manages history internally.
        return res.status(200).json({ text: response.text }); 

    } catch (error) { 
        console.error('Gemini Server Error:', error); 
        return res.status(500).json({ error: 'Internal Server Error', details: error.message }); 
    } 
}); 

// Endpoint to delete/reset the session history context completely
app.post('/api/chat/reset', (req, res) => {
    const { userId } = req.body;
    if (userId && chatSessions.has(userId)) {
        chatSessions.delete(userId);
        console.log(`[Session]: Cleared session context for user: ${userId}`);
    }
    return res.status(200).json({ success: true, message: 'Session reset successfully.' });
});

const PORT = 5000; 
app.listen(PORT, () => { 
    console.log(`[server]: Backend running safely at http://127.0.0.1:${PORT}`); 
});
