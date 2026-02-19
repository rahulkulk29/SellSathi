
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    try {
        // The listModels method might not be directly on the top-level genAI in some SDK versions
        // or it might requires a specific client.
        // Let's try the safest way to see what we have access to.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => console.log(` - ${m.name} (Supports: ${m.supportedGenerationMethods})`));
        } else {
            console.log("No models returned:", data);
        }
    } catch (err) {
        console.error("Error listing models:", err.message);
    }
}

listModels();
