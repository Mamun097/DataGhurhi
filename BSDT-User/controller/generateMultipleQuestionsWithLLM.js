require("dotenv").config();
const Groq = require("groq-sdk");

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Rate limiter for Groq (25 requests/min to be safe)
class RateLimiter {
    constructor(requestsPerMinute = 25) {
        this.requests = [];
        this.limit = requestsPerMinute;
    }

    async waitIfNeeded() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < 60000);
        
        if (this.requests.length >= this.limit) {
            const oldestRequest = this.requests[0];
            const waitTime = 60000 - (now - oldestRequest) + 100;
            console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.requests = [];
        }
        
        this.requests.push(Date.now());
    }
}

const limiter = new RateLimiter(25);

// Helper function for robust string normalization
const normalizeString = (str) => {
    return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]+/g, "");
};

const typesList = ["text", "radio", "checkbox", "dropdown", "rating", "linearScale", "datetime", "likert", "tickboxGrid"];

function getRandomType() {
    const index = Math.floor(Math.random() * typesList.length);
    return typesList[index];
}

async function generateWithLLM(prompt) {
    await limiter.waitIfNeeded();
    
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert survey question generator. Generate unique, engaging, and relevant survey questions in valid JSON format. Always respond with properly formatted JSON only, no markdown."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile", // Fast and capable
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: "json_object" } // Ensures JSON response
        });
        
        return completion.choices[0].message.content;
    } catch (error) {
        if (error.message.includes('429')) {
            console.log('Rate limit hit, waiting 60s...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            return generateWithLLM(prompt);
        }
        throw error;
    }
}

exports.generateMultipleQuestionsWithLLM = async (req, res) => {
    const { questionData, questionInfo } = req.body;
    const { type, metadata, additionalInfo } = questionData;
    const { survey_id } = questionInfo;

    const numQuestions = metadata.numQuestions || 1;
    const sectionId = 1;

    const generatedQuestions = [];

    for (let i = 0; i < numQuestions; i++) {
        let retries = 5;
        let finalText = null;
        const actualType = type === "mixed" ? getRandomType() : type;

        while (retries-- > 0 && !finalText) {
            const prompt = `
You are an expert survey question generator.

Context: "${additionalInfo}"
Audience: "${metadata.audience || "general participants"}"
Question type: "${actualType}"
Previously generated questions:
${generatedQuestions.length > 0 ? generatedQuestions.map(q => `- ${q.text}`).join("\n") : "None"}

Now generate ONE unique, short, and engaging survey question that explores a different aspect of "${additionalInfo}".

Respond ONLY with valid JSON:
{
  "text": "your new question text",
  "type": "${actualType}",
  "meta": {
    "options": []
  }
}`.trim();

            try {
                const rawText = await generateWithLLM(prompt);

                // Clean up response
                let cleanedText = rawText.trim();
                if (cleanedText.startsWith('```json')) {
                    cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
                } else if (cleanedText.startsWith('```')) {
                    cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
                }

                const parsed = JSON.parse(cleanedText);
                const normalizedText = normalizeString(parsed.text);

                const isDuplicate = generatedQuestions.some(
                    (q) => normalizeString(q.text) === normalizedText
                );

                if (!isDuplicate) {
                    finalText = parsed.text;
                    generatedQuestions.push({
                        id: i + 1,
                        required: false,
                        section: sectionId,
                        text: parsed.text,
                        type: actualType,
                        meta: parsed.meta || { options: [] },
                    });
                } else {
                    console.log(`Duplicate detected: "${parsed.text}", retrying...`);
                }
            } catch (err) {
                console.error(`Failed for question ${i + 1}:`, err.message);
            }
        }

        if (!finalText) {
            console.warn(`Unable to generate unique question ${i + 1}. Adding placeholder.`);
            generatedQuestions.push({
                id: i + 1,
                required: false,
                section: sectionId,
                text: `Untitled Question ${i + 1}`,
                type: actualType,
                meta: { options: [] },
            });
        }
    }

    res.status(200).json(generatedQuestions);
};