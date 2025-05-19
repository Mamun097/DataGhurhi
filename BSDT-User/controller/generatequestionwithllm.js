require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("../db"); // Import Supabase client

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateQuestionWithLLM = async (req, res) => {
    const questionId = req.body.questionInfo.id;
    const questionSection = req.body.questionInfo.section;
    const existingQuestions = req.body.questionInfo.questions;
    const questionType = req.body.questionData.type;
    const meta = req.body.questionData.metadata;
    const additionalInfo = req.body.questionData.additionalInfo;

    try {
        // Base prompt with general instructions
        let prompt = `You are an intelligent AI assistant.

I am creating a survey. I want to generate a question for my survey with the context of my existing added questions (if any)
and some other necessary information.
Given detailed information about a question, generate an awesome question.
The question should be relevant to the context and should be engaging for the survey participants.
I am giving you the list of existing questions in the survey for context. if you feel that the context is insufficient, generate a demo question following the response format.
Existing Questions: ${existingQuestions}\n
`;

        // Add question-specific instructions based on question type
        if (questionType === "checkbox" || questionType === "radio" || questionType === "dropdown") {
            prompt += `\n\nThe response format should be JSON with exactly the following structure:
{
    "id": ${questionId}//must be ${questionId},
    "required": false
    "section": ${questionSection} //must be ${questionSection},
    "text": "Your generated question text here", // must use the key "text"
    "type": "${questionType}", //must be "${questionType}"
    "meta": {
        "options": ["Option 1", "Option 2", ...], // Add options based on the generated question. the last option must not contain "if others, please specify"
    },
}
    
This question must have a total of ${meta.numOptions} options. Kindly generate the best options for the question.`;


        }
        else if (questionType === "datetime") {
            prompt += `\n\nThe response format should be JSON with exactly the following structure:
            {
                "id": ${questionId}//must be ${questionId},
                "required": false
                "section": ${questionSection} //must be ${questionSection},
                "text": "Your generated question text here",// must use the key "text"
                "type": "${questionType}", //must be "${questionType}"
                "meta": {
                    "dateType": "date",
                },
            }
        }`;
        } else if (questionType === "linearScale") {
            prompt += `\n\nThe response format should be JSON with exactly the following structure:
            {
                "id": ${questionId}//must be ${questionId},
                "required": false
                "section": ${questionSection} //must be ${questionSection},
                "text": "Your generated question text here",// must use the key "text"
                "type": "${questionType}", //must be "${questionType}"
                "meta": {
                    "leftLabel": "Poor",
                    "rightLabel": "Excellent",
                    "min":${meta.min},//must be ${meta.min}
                    "max":${meta.max},//must be ${meta.max}
                },
            }
        }`;
        } else if (questionType === "rating") {
            prompt += `\n\nThe response format should be JSON with exactly the following structure:
            {
                "id": ${questionId}//must be ${questionId},
                "required": false
                "section": ${questionSection} //must be ${questionSection},
                "text": "Your generated question text here",// must use the key "text" and keep the question text specific, short and engaging 
                "type": "${questionType}", //must be "${questionType}"
                "meta": {
                    "scale": ${meta.scale},//must be ${meta.scale}
                },
            }
        }`;
        } else if (questionType === "text") {
            prompt += `\n\nThe response format should be JSON with exactly the following structure:
            {
                "id": ${questionId}//must be ${questionId},
                "required": false
                "section": ${questionSection} //must be ${questionSection},
                "text": "Your generated question text here",// must use the key "text" and keep the question text specific, short and engaging 
                "type": "${questionType}", //must be "${questionType}"
                "meta": {
                    "options": [], // No options needed for text questions
                },
            }
        }`;
        } else if (questionType === "tickboxGrid") {
            prompt += `\n\nThe response format should be JSON with exactly the following structure:
            {
                "id": ${questionId}//must be ${questionId},
                "required": false
                "section": ${questionSection} //must be ${questionSection},
                "text": "Your generated question text here",// must use the key "text" and keep the question text specific, short and engaging 
                "subText": "Your subtext here", // Add subtext to add clarity (for example, "Please select one tool for each category." etc)
                "type": "${questionType}", //must be "${questionType}"
                "meta": {
                    "rows": ["Row 1", "Row 2", ...], // Add total ${meta.rows}rows based on the generated question. apply relevance to the question
                    "columns": ["Column 1", "Column 2"], // Add total ${meta.cols} columns based on the generated question. apply relevance to the question
                },
            }`;
        } else if (questionType === "likert") {
            prompt += `\n\nThe response format should be JSON with exactly the following structure:
            {
                "id": ${questionId}//must be ${questionId},
                "required": false
                "section": ${questionSection} //must be ${questionSection},
                "text": "Your generated question text here",// must use the key "text" and keep the question text specific, short and engaging 
                "type": "${questionType}", //must be "${questionType}"
                "meta": {
                    "rows": ["Row 1", "Row 2", ...], // Must Add total ${meta.rows_count}rows based on the generated question. apply relevance to the question
                    "columns": ["Column 1", "Column 2"], // Must Add total ${meta.cols_count} columns based on the generated question. apply relevance to the question
                },
            }`;
        }

        // Add additional context from additionalInfo if available
        if (additionalInfo) {
            prompt += `\n\nAdditional context: ${additionalInfo}. GIVE THE MOST PRIORITY TO ADDITIONAL INFO IF USER PROVIDES. \n If you feel that the context is insufficient, generate a demo question exactly in the json format I provided.`;
        }

        // Rest of the code remains the same
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const rawText = await result.response.text();

        // Remove markdown code block formatting if present
        let cleanedText = rawText;
        if (rawText.trim().startsWith('```json') && rawText.trim().endsWith('```')) {
            cleanedText = rawText.trim().replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (rawText.trim().startsWith('```') && rawText.trim().endsWith('```')) {
            cleanedText = rawText.trim().replace(/^```\n/, '').replace(/\n```$/, '');
        }
        else {
            cleanedText = rawText;
        }

        try {
            // Parse the cleaned JSON
            const parsedResponse = JSON.parse(cleanedText);
            res.status(200).json(parsedResponse);
        } catch (parseError) {
            console.error("Failed to parse LLM response:", parseError);
            // Fall back to sending the cleaned text
            res.status(200).json({ rawResponse: cleanedText });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error: " + err.message });
    }
};