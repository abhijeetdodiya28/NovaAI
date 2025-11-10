import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const getOpenAIAPIResponse = async (userMessage) => {
    const options = {
        model: "gpt-4o-mini",
        messages: [
            { role: "user", content: userMessage },
        ],
    };

    try {
        const response = await client.chat.completions.create(options);
        return response.choices[0].message.content;

    } catch (error) {
        console.log(error);
        throw new Error(error.message || "Something went wrong with OpenAI model");
    }
};

export default getOpenAIAPIResponse;
