
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            data.models.forEach(m => {
                const name = m.name.replace('models/', '');
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`VALID_MODEL: ${name}`);
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
}
listModels();
