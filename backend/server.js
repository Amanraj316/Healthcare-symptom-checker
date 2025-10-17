require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { CohereClient } = require('cohere-ai'); 

const app = express();
const PORT = 5001;

// --- 1. CONNECT TO MONGODB ---
// This uses the MONGODB_URI from your .env file
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch(err => {
    console.error("\n❌❌❌ FATAL: MongoDB Connection Failed. ❌❌❌");
    process.exit(1); 
  });

// --- 2. DEFINE A DATA SCHEMA ---
const querySchema = new mongoose.Schema({
  symptomInput: String,
  llmResponse: String, // Storing the response as a string
  timestamp: { type: Date, default: Date.now }
});
const Query = mongoose.model('Query', querySchema);

// --- 3. INITIALIZE THE AI CLIENT ---
let cohere;
if (process.env.COHERE_API_KEY) {
  cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
  console.log("✅ Cohere AI client initialized successfully.");
} else {
  console.error("❌ ERROR: COHERE_API_KEY not found in .env file.");
}

app.use(cors());
app.use(express.json());

// --- 4. THE MAIN API ROUTE ---
app.post('/api/check-symptoms', async (req, res) => {
  if (!cohere) { 
    return res.status(500).json({ message: "API key not configured on the server." });
  }

  const { symptoms } = req.body;
  if (!symptoms) { return res.status(400).json({ message: "Symptoms are required." }); }

  try {
    const response = await cohere.chat({
      model: "command-a-03-2025",
      preamble: `You are an AI Healthcare Assistant. Your response MUST be a valid JSON object. Do not include any text before or after the JSON. The JSON object should have three keys: "disclaimer" (a string), "conditions" (an array of objects, where each object has a "name" and "explanation"), and "nextSteps" (an array of strings).`,
      message: `Analyze the following symptoms and respond with JSON: "${symptoms}"`,
    });

    let jsonString = response.text;
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = jsonString.substring(startIndex, endIndex + 1);
    }
    
    const structuredResult = JSON.parse(jsonString);

    // --- SAVE TO DATABASE ---
    const newQuery = new Query({
      symptomInput: symptoms,
      llmResponse: JSON.stringify(structuredResult, null, 2) // Save the formatted JSON
    });
    await newQuery.save();
    console.log("✅ Query saved to database.");

    res.json(structuredResult);

  } catch (error) {
    console.error("❌ Error during API call or database save:", error);
    res.status(500).json({ message: "Failed to get a valid response from the AI model." });
  }
});

// --- 5. (Optional) A ROUTE TO VIEW HISTORY ---
app.get('/api/history', async (req, res) => {
  try {
    const queries = await Query.find().sort({ timestamp: -1 }).limit(20); // Get last 20
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve history." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});