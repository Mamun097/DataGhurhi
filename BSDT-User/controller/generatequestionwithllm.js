require("dotenv").config();
const Groq = require("groq-sdk");
const supabase = require("../db");

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Rate limiter for Groq (30 requests/min)
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

async function generateWithLLM(prompt) {
    await limiter.waitIfNeeded();
    
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert survey designer. Generate engaging, relevant survey questions in valid JSON format. Always respond with properly formatted JSON only, no markdown."
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

exports.generateQuestionWithLLM = async (req, res) => {
    console.log("REQ BODY:", JSON.stringify(req.body, null, 2));

    let body = req.body;

    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch (err) {
            return res.status(400).json({ error: "Invalid JSON format" });
        }
    }

    console.log("Parsed Body:", body);

    const questionId = body.questionInfo?.id;
    const questionSection = body.questionInfo?.section;
    const existingQuestions = body.questionInfo?.questions;
    const questionType = body.questionData?.type;
    const meta = body.questionData?.metadata;
    const additionalInfo = body.questionData?.additionalInfo;
    const language = body.questionData?.language || "English";

    if (!questionId || !questionType) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        let prompt = `You are an intelligent AI assistant creating survey questions.

Generate a survey question with the following context:
- Existing Questions: ${existingQuestions || 'None'}
${additionalInfo ? `- Additional Context: ${additionalInfo}` : ''}
The complete question should be in ${language}.

The question should be engaging, relevant, and contextually appropriate.
`;

        // Add question-specific instructions
        if (questionType === "checkbox" || questionType === "radio" || questionType === "dropdown") {
            prompt += `
Generate a JSON response with this exact structure:
{
    "id": ${questionId},
    "required": false,
    "section": "${questionSection}",
    "text": "Your engaging question text here",
    "type": "${questionType}",
    "meta": {
        "options": ["Option 1", "Option 2", "..."]
    }
}

Requirements:
- Generate exactly ${meta.numOptions} relevant options
- Make options clear and mutually exclusive
- Last option should NOT be "if others, please specify"`;

        } else if (questionType === "datetime") {
            prompt += `
Generate a JSON response with this exact structure:
{
    "id": ${questionId},
    "required": false,
    "section": "${questionSection}",
    "text": "Your engaging question text here",
    "type": "${questionType}",
    "meta": {
        "dateType": "date"
    }
}`;

        } else if (questionType === "linearScale") {
            prompt += `
Generate a JSON response with this exact structure:
{
    "id": ${questionId},
    "required": false,
    "section": "${questionSection}",
    "text": "Your engaging question text here",
    "type": "${questionType}",
    "meta": {
        "leftLabel": "Negative anchor (e.g., Poor, Disagree)",
        "rightLabel": "Positive anchor (e.g., Excellent, Agree)",
        "min": ${meta.min},
        "max": ${meta.max}
    }
}`;

        } else if (questionType === "rating") {
            prompt += `
Generate a JSON response with this exact structure:
{
    "id": ${questionId},
    "required": false,
    "section": "${questionSection}",
    "text": "Short, specific, engaging question",
    "type": "${questionType}",
    "meta": {
        "scale": ${meta.scale}
    }
}`;

        } else if (questionType === "text") {
            prompt += `
Generate a JSON response with this exact structure:
{
    "id": ${questionId},
    "required": false,
    "section": "${questionSection}",
    "text": "Short, specific, engaging question",
    "type": "${questionType}",
    "meta": {
        "options": []
    }
}`;

        } else if (questionType === "tickboxGrid") {
            prompt += `
Generate a JSON response with this exact structure:
{
    "id": ${questionId},
    "required": false,
    "section": "${questionSection}",
    "text": "Your engaging question text here",
    "subText": "Helpful instruction (e.g., 'Select one option per row')",
    "type": "${questionType}",
    "meta": {
        "rows": ["Row 1", "Row 2", "..."],
        "columns": ["Column 1", "Column 2", "..."]
    }
}

Requirements:
- Generate exactly ${meta.rows} relevant rows
- Generate exactly ${meta.cols} relevant columns`;

        } else if (questionType === "likert") {
            prompt += `
Generate a JSON response with this exact structure:
{
    "id": ${questionId},
    "required": false,
    "section": "${questionSection}",
    "text": "Your engaging question text here",
    "type": "${questionType}",
    "meta": {
        "rows": ["Statement 1", "Statement 2", "..."],
        "columns": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
    }
}

Requirements:
- Generate exactly ${meta.rows_count} relevant statement rows
- Generate exactly ${meta.cols_count} relevant scale columns`;
        }

        if (additionalInfo) {
            prompt += `\n\nIMPORTANT: Prioritize this additional context: "${additionalInfo}"`;
        }

        prompt += `\n\nRespond with ONLY valid JSON, no markdown formatting, no explanations.`;

        const rawText = await generateWithLLM(prompt);

        // Clean up response
        let cleanedText = rawText.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        try {
            const parsedResponse = JSON.parse(cleanedText);
            console.log("Generated Question:", JSON.stringify(parsedResponse, null, 2));
            res.status(200).json(parsedResponse);
        } catch (parseError) {
            console.error("Failed to parse LLM response:", parseError);
            console.error("Raw response:", cleanedText);
            res.status(500).json({ 
                error: "Failed to parse LLM response",
                rawResponse: cleanedText 
            });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error: " + err.message });
    }
};