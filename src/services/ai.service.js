const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
    constructor() {
        // Initialize the Generative AI client with the provided API key
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    /**
     * Summarizes a support ticket description and its resolution logic for quick administrator review.
     * @param {String} description The long-form description from the user
     * @param {String} resolution Optional previous resolution notes or logs
     * @returns {Promise<String>} The generated summary
     */
    async summarizeTicket(description, resolution = '') {
        try {
            if (!process.env.GEMINI_API_KEY) {
                console.warn('GEMINI_API_KEY is missing. Skipping AI summarization.');
                return 'AI Summarization disabled (Missing API Key).';
            }

            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            
            const prompt = `
            You are a helpful support desk triage AI. 
            Please provide a concise, 2-3 sentence summary of the following support ticket to help Market Masters quickly understand the issue.
            Focus on the core problem, the user's frustration level, and what needs to be solved.

            Ticket Description:
            ${description}

            ${resolution ? `\nPrevious Resolution Attempt/Notes:\n${resolution}` : ''}
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            return response.text();
            
        } catch (error) {
            console.error('Error generating AI Summary:', error);
            throw new Error('Failed to generate AI summary.');
        }
    }
}

module.exports = new AIService();
