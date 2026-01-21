import { OpenRouter } from '@openrouter/sdk';

export class GeminiService {
    private openRouter: OpenRouter;
    private model = "openai/gpt-4o-2024-05-13";

    constructor() {
        this.openRouter = new OpenRouter({
            apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
        });
    }

    private async generate(prompt: string): Promise<string> {
        console.log("OpenRouter Request:", prompt);
        const completion = await this.openRouter.chat.send({
            model: this.model,
            messages: [{ role: "user", content: prompt }],
            maxTokens: 1000, // FIX: Lower this to avoid 402 error
            temperature: 0.5
        });

        const content = completion.choices[0]?.message?.content || "";
        // Ensure content is a string for .trim() and other string methods
        const text = typeof content === 'string' ? content : JSON.stringify(content);

        console.log("OpenRouter Response:", text);
        return text;
    }

    async getHelper1Clue(secretWord: string, history: string[], round: number): Promise<string> {
        const difficultyMsg = round === 1
            ? "BE EXTREMELY VAGUE. Provide a very broad, high-level, or abstract one-word clue that is only tangentially related."
            : round === 2
                ? "Be subtle but slightly more focused than Round 1."
                : "You can be more specific now.";

        const prompt = `You are "Helper Agent 1". The secret word is "${secretWord}". 
        Current Round: ${round}.
        ${difficultyMsg}
        Previous clues and guesses: ${history.join(', ') || 'None'}.
        Your goal is to give a ONE-WORD clue to a third agent so they can guess the word. 
        Do NOT mention the secret word or any part of it. 
        Do NOT repeat any previous clues.
        Respond ONLY with a single word.`;

        return (await this.generate(prompt)).trim().replace(/[.,!]/g, '');
    }

    async getHelper2Clue(secretWord: string, history: string[], round: number): Promise<string> {
        const difficultyMsg = round === 1
            ? "BE EXTREMELY VAGUE. Provide a one-word clue that is different from Helper 1's perspective but still very abstract."
            : round === 2
                ? "Be subtle but slightly more focused than Round 1."
                : "You can be more specific now.";

        const prompt = `You are "Helper Agent 2". The secret word is "${secretWord}". 
        Current Round: ${round}.
        ${difficultyMsg}
        Previous clues and guesses: ${history.join(', ') || 'None'}.
        Your goal is to give a complementary ONE-WORD clue that helps the guesser.
        Do NOT mention the secret word or any part of it. 
        Do NOT repeat any previous clues.
        Respond ONLY with a single word.`;

        return (await this.generate(prompt)).trim().replace(/[.,!]/g, '');
    }

    async getGuesserGuess(clueHistory: string[]): Promise<string> {
        const prompt = `You are "The Guesser". You have been given the following history of clues:
        ${clueHistory.join('\n')}
        Note: The initial clues might be very abstract. Analyze the history carefully.
        What is the secret word? Respond ONLY with your best guess (a single word).`;

        return (await this.generate(prompt)).trim().toLowerCase().replace(/[.,!]/g, '');
    }
}
