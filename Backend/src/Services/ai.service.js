// aiController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI

// AI Chat Controller
export async function aiChatController(req, res) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // AI Bot personality and context
  const AI_BOT_PERSONALITY = `
You are a friendly AI assistant named "AI Friend". You should:
- Be conversational and friendly like a good friend
- Give helpful, accurate responses
- Keep responses concise but informative (2-3 sentences max)
- Use a warm, supportive tone
- Occasionally use emojis to make conversations more engaging
- Remember you're chatting in a casual chat application
`;

  console.log('AI Chat Controller Called!', req.body);

  try {
    const { message, chatHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        error: 'AI service not configured'
      });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Build conversation context
    let conversationContext = AI_BOT_PERSONALITY + "\n\nConversation:\n";

    // Add recent chat history for context (last 10 messages)
    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.fromUser !== 'AI Friend') {
        conversationContext += `Human: ${msg.message}\n`;
      } else {
        conversationContext += `AI Friend: ${msg.message}\n`;
      }
    });

    conversationContext += `Human: ${message}\nAI Friend: `;

    console.log('Sending to Gemini:', conversationContext.substring(0, 200) + '...');

    // Generate response
    const result = await model.generateContent(conversationContext);
    const aiResponse = result.response.text();

    console.log('Gemini response:', aiResponse);

    res.json({
      success: true,
      response: aiResponse.trim()
    });

  } catch (error) {
    console.error('AI Chat Error:', error);

    // Send a friendly fallback response
    res.json({
      success: true,
      response: "Sorry, I'm having some technical difficulties right now! 😅 Can you try asking me something else?"
    });
  }
}