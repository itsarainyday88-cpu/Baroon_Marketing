const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API KEY found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`\nTesting ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, strictly answer 'OK' if you see this.");
        const response = await result.response;
        console.log(`✅ ${modelName} Success: "${response.text()}"`);
        return true;
    } catch (error) {
        console.error(`❌ ${modelName} Failed:`, error.message);
        return false;
    }
}

async function runTests() {
    console.log("--- Starting Hybrid AI Diagnostic ---");
    console.log("API Key found: " + (apiKey ? "YES" : "NO"));

    // 1. Test Primary
    const primaryWorking = await testModel('gemini-1.5-pro');

    // 2. Test Fallback
    const fallbackWorking = await testModel('gemini-2.5-flash');

    console.log("\n--- DIAGNOSIS ---");
    if (primaryWorking && fallbackWorking) {
        console.log("🟢 All Systems Normal. Both models are active.");
        console.log("If 'Response Interrupted' persists, check client-side timeout or Vercel Duration limit.");
    } else if (!primaryWorking && fallbackWorking) {
        console.log("🟡 Hybrid Failover Active. Primary is down, Fallback is saving you.");
    } else if (primaryWorking && !fallbackWorking) {
        console.log("🟠 Anomalous. Primary works but Fallback failed.");
    } else {
        console.log("🔴 CRITICAL FAILURE. All models down. Check Quota or API Key permissions.");
    }
}

runTests();
