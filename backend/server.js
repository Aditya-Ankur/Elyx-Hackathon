import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import mongoose from 'mongoose';
import Conversation from './conversation.js';
import { explainMessage } from './explain.js'; // Keep this import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5174',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectDB();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text;

    const conversation = new Conversation({
      prompt: prompt,
      response: responseText
    });
    
    await conversation.save();
    console.log('Conversation saved to database');

    res.json({ 
      response: responseText,
      prompt: prompt 
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.post('/api/explain', async (req, res) => {
  try {
    console.log('=== EXPLAIN ENDPOINT CALLED ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { conversationData, targetMessage, sender, context } = req.body;
    
    if (!conversationData || !targetMessage || !sender) {
      console.log('Missing required fields:', {
        hasConversationData: !!conversationData,
        hasTargetMessage: !!targetMessage,
        hasSender: !!sender
      });
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { 
          conversationData: !!conversationData, 
          targetMessage: !!targetMessage, 
          sender: !!sender 
        }
      });
    }

    console.log('Calling explainMessage function...');
    console.log('Target message:', targetMessage);
    console.log('Sender:', sender);
    
    const explanation = await explainMessage(conversationData, targetMessage, sender, context);
    
    console.log('Explanation generated:', explanation);
    res.json({ explanation });
  } catch (error) {
    console.error('Error in explain endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});