import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const getOpenAIAPIResponse = async (userMessage) => {
    try {
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant" },
                { role: "user", content: userMessage }
            ]
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("🔥 OpenAI Error:", error);
        return "Sorry, the AI failed to respond.";
    }
};

export default getOpenAIAPIResponse;
