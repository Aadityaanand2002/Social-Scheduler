import { HfInference } from "@huggingface/inference";
import dotenv from 'dotenv';
dotenv.config();

const hf2 = new HfInference(process.env.HF_API_KEY);

async function test() {
    try {
        console.log(`\nTesting Qwen/Qwen2.5-72B-Instruct...`);
        const response = await hf2.chatCompletion({
            model: "Qwen/Qwen2.5-72B-Instruct",
            messages: [{ role: "user", content: "Say hello" }],
            max_tokens: 50,
        });
        console.log(`✅ Success with Qwen-72B:`, response.choices[0]?.message?.content);
    } catch (e) {
        console.error(`❌ Error with Qwen-72B:`, e.message);
    }
}
test();
