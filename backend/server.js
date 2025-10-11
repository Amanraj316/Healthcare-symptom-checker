require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CohereClient } = require('cohere-ai'); // Make sure you're using the right client

const app = express();
const PORT = 5001;

// Change this line based on the API you are using (Cohere, OpenAI, etc.)
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY }); 
console.log("✅ Cohere AI client initialized successfully.");


app.use(cors());
app.use(express.json());

app.post('/api/check-symptoms', async (req, res) => {
  // Make sure to use the correct client variable here (cohere, openai, etc.)
  if (!cohere) { 
    return res.status(500).json({ message: "API key not configured on the server." });
  }

  const { symptoms } = req.body;
  if (!symptoms) { return res.status(400).json({ message: "Symptoms are required." }); }

  try {
    const response = await cohere.chat({ // Make sure this call matches your client
      model: "command-a-03-2025",
      preamble: `You are an AI Healthcare Assistant. Your response MUST be a valid JSON object. Do not include any text before or after the JSON. The JSON object should have three keys: "disclaimer" (a string), "conditions" (an array of objects, where each object has a "name" and "explanation"), and "nextSteps" (an array of strings).`,
      message: `Analyze the following symptoms and respond with JSON: "${symptoms}"`,
    });

    // --- FIX IS HERE ---
    // The AI might wrap the JSON in ```json ... ```, so we extract it.
    let jsonString = response.text;
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = jsonString.substring(startIndex, endIndex + 1);
    }
    // --- END OF FIX ---

    // Now, parse the cleaned string
    const structuredResult = JSON.parse(jsonString);
    res.json(structuredResult);

  } catch (error) {
    console.error("❌ Error calling or parsing API response:", error);
    res.status(500).json({ message: "Failed to get a valid response from the AI model." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});