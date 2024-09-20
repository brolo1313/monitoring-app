// services/openaiService.js
const {  OpenAI } = require("openai");
const path = require('path');
const dotenv = require('dotenv');

const result = dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (result.error) {
  throw result.error;
}

const apiKey = process?.env?.OPENAI_API_KEY;

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
