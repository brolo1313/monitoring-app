// services/openaiService.js
const {  OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const apiKey = process.env.OPENAI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  throw new Error("API key is missing. Please set it in your .env file.");
}

const openai = new OpenAI({
  apiKey: apiKey,
});

async function callGPT(promptContent, systemContent, previousChat) {
  try {
    const messages = [];

    const userPrompt = {
      role: "user",
      content: promptContent,
    };
    const systemPrompt = {
      role: "system",
      content: systemContent,
    };
    const assistantPrompt = {
      role: "assistant",
      content: previousChat,
    };

    messages.push(userPrompt);
    // messages.push(systemPrompt);
    // messages.push(assistantPrompt);

    console.log('messages', messages);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages,
    });

    console.log('callGPT',response);
    return response.choices[0].message;
  } catch (error) {
    return `An error occurred while processing the request: ${error}`;
  }
}

module.exports = { callGPT };
