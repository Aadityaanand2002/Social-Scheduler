import { GoogleGenAI } from "@google/genai";
// from previous logs
const ai = new GoogleGenAI({ apiKey: "AQ.Ab8RN6Jc5GPttY1suRM88sr5A1VOeM9BaOhfkKxOXXvJ9zAN0Q" });

async function test() {
    try {
        console.log("Testing 1.5-flash...");
        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: "Say hello",
        });
        console.log("Success:", result.text);
    } catch (e) {
        console.error("Error Code:", e.status);
        console.error("Message:", e.message);
    }
}
test();
