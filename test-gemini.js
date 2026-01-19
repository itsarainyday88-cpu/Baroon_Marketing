const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) process.exit(1);

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
    const modelName = 'gemini-1.5-flash';
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Ping');
        fs.writeFileSync('result.log', `Success: ${result.response.text()}`);
    } catch (e) {
        fs.writeFileSync('error.log', JSON.stringify(e, null, 2) + '\n\n' + e.message + '\n\n' + JSON.stringify(e.response, null, 2));
    }
}

test();
