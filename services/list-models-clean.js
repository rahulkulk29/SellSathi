
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            const names = data.models.map(m => m.name.replace('models/', ''));
            console.log("CLEAN_LIST_START");
            console.log(names.join(','));
            console.log("CLEAN_LIST_END");
        } else {
            console.log("No models:", data);
        }
    } catch (err) {
        console.error(err);
    }
}
listModels();
