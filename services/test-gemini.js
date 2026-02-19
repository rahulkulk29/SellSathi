
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function test() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Testing API Key:", key ? (key.substring(0, 5) + "...") : "MISSING");
    const genAI = new GoogleGenerativeAI(key);

    const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-2.0-flash"];

    for (const m of models) {
        try {
            console.log(`Testing model: ${m}`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${m} works! Response:`, result.response.text());
        } catch (err) {
            console.log(`❌ ${m} failed:`, err.message);
        }
    }
}

test();
