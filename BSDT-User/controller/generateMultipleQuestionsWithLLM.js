require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function for robust string normalization
const normalizeString = (str) => {
    return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]+/g, "");
};

const typesList = ["text", "radio", "checkbox", "dropdown", "rating", "linearScale", "datetime", "likert", "tickboxGrid"];

function getRandomType() {
    const index = Math.floor(Math.random() * typesList.length);
    return typesList[index];
}

exports.generateMultipleQuestionsWithLLM = async (req, res) => {
    const { questionData, questionInfo } = req.body;
    const { type, metadata, additionalInfo } = questionData;
    const { survey_id } = questionInfo;

    const numQuestions = metadata.numQuestions || 1;
    const sectionId = 1;

    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

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
                const result = await model.generateContent(prompt);
                let raw = await result.response.text();

                if (raw.includes("```")) {
                    raw = raw.replace(/```json\n?|```/g, "").trim();
                }

                const parsed = JSON.parse(raw);
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
