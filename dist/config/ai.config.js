"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ai = void 0;
// index.js (or wherever you initialize the client)
const genai_1 = require("@google/genai");
// ---------------------------------------------------------------------
// OPTION A: Recommended (Automatic Environment Variable)
// ---------------------------------------------------------------------
// The SDK automatically looks for the GEMINI_API_KEY
// environment variable and uses it for initialization.
exports.ai = new genai_1.GoogleGenAI({});
// ---------------------------------------------------------------------
// OPTION B: Explicitly passing the API Key
// ---------------------------------------------------------------------
// You can pass the key explicitly if needed, but using the
// environment variable (Option A) is generally preferred.
// export const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });
// Now you can use the client to interact with models
// For example:
// async function run() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "Hello, world!",
//   });
//   console.log(response.text);
// }
// run();
