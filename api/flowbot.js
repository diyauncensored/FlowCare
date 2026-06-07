const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `You are FlowBot, a warm and knowledgeable menstrual wellness companion built into FlowCare — a women's health and cycle tracking app.

Your personality:
- Warm, friendly, and non-judgmental — like a knowledgeable older sister
- You speak naturally and conversationally, not like a medical textbook
- You use encouraging, empowering language
- You can use occasional emojis but don't overdo it

Your expertise:
- Menstrual cycle phases (menstruation, follicular, ovulatory, luteal) and what happens in each
- Cramp relief techniques (heat therapy, stretching, breathing exercises)
- Cycle-syncing nutrition and recipe suggestions
- Sleep tips during different cycle phases
- Gentle exercise recommendations
- Mood and emotional wellness during hormonal shifts
- Hydration and supplement guidance
- PMS and PMDD symptom management tips

Your rules:
- NEVER diagnose medical conditions. If someone describes severe or concerning symptoms, warmly recommend they see a healthcare professional.
- NEVER prescribe medication. You can mention common supplements (magnesium, iron, vitamin D) as general wellness info, but always add that they should check with their doctor first.
- If asked about topics completely unrelated to health/wellness (coding, politics, math, etc.), gently redirect: "I'm best at helping with cycle and wellness questions! Is there anything about your health I can help with?"
- Keep responses concise — aim for 2-4 short paragraphs max. Don't write walls of text.
- Use markdown formatting (bold, bullet points) to make responses scannable.
- When the user shares their cycle phase or symptoms, tailor your advice to that specific context.`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      message: "Gemini API key not configured on the server.",
    });
  }

  const { messages, cycleContext } = req.body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ ok: false, message: "Messages array is required." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // Build the conversation context from the user's cycle data
    let contextPrefix = "";
    if (cycleContext) {
      contextPrefix = `[User's current cycle context — use this to personalize your response]\n`;
      contextPrefix += `- Current phase: ${cycleContext.phase || "unknown"}\n`;
      if (cycleContext.symptoms) contextPrefix += `- Today's logged symptoms: ${cycleContext.symptoms}\n`;
      if (cycleContext.water) contextPrefix += `- Water intake today: ${cycleContext.water} mL\n`;
      contextPrefix += `\n`;
    }

    // Build conversation history for Gemini (last 10 messages for context window)
    // Map the messages to the structure expected by generateContent (which also requires alternating roles)
    const contents = [];
    
    // Filter out greeting message and construct valid alternating roles
    const historyMessages = messages.filter(m => m.sender === "user" || m.text !== "Hey there! I'm FlowBot, your wellness companion. I can help with cycle questions, cramp relief, nutrition tips, and more. How are you feeling today?");
    
    let expectedRole = "user";
    for (let i = 0; i < historyMessages.length; i++) {
      const msg = historyMessages[i];
      const role = msg.sender === "user" ? "user" : "model";
      
      // We only append if it matches the alternating sequence
      if (role === expectedRole) {
        // If this is the last message (which is the user prompt), inject contextPrefix
        const text = i === historyMessages.length - 1 ? contextPrefix + msg.text : msg.text;
        
        contents.push({
          role: role,
          parts: [{ text: text }],
        });
        expectedRole = expectedRole === "user" ? "model" : "user";
      }
    }

    // Fallback: If no user message was added, add at least one
    if (contents.length === 0 || contents[0].role !== "user") {
      const latestMessage = messages[messages.length - 1];
      contents.unshift({
        role: "user",
        parts: [{ text: contextPrefix + latestMessage.text }]
      });
    }

    const result = await model.generateContent({
      contents: contents,
      systemInstruction: SYSTEM_PROMPT,
    });
    
    const response = result.response.text();
    res.json({ ok: true, response });
  } catch (error) {
    console.error("[FlowBot] Gemini API error:", error.message);
    res.status(500).json({
      ok: false,
      message: "I'm having trouble connecting right now. Please try again in a moment.",
    });
  }
};
