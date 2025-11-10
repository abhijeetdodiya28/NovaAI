import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY, // your sk-or-v1... key
    baseURL: "https://openrouter.ai/api/v1",
});

const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b:free",
    messages: [{ role: "user", content: "umrala,veraval,gujrat" }],
});

console.log(response.choices[0].message.content);
