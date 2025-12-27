require("dotenv").config();
const Groq = require("groq-sdk");
const supabase = require("../db");

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Rate limiter for Groq
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

async function generateTagsWithLlama(prompt) {
    await limiter.waitIfNeeded();
    
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert tagging assistant. Generate short, relevant tags for survey questions. Always respond with valid JSON only, no markdown formatting, no explanations."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct", // Latest Llama 4
            temperature: 0.5, // Lower temperature for consistent tag generation
            max_tokens: 512,
            response_format: { type: "json_object" } // Ensures JSON response
        });
        
        return completion.choices[0].message.content;
    } catch (error) {
        if (error.message.includes('429')) {
            console.log('Rate limit hit, waiting 60s...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            return generateTagsWithLlama(prompt);
        }
        throw error;
    }
}

exports.generateTagsForQuestion = async (req, res) => {
    const questionText = req.body.question_text;
    const meta_data = req.body.meta_data;

    if (!questionText) {
        return res.status(400).json({ error: "question_text is required" });
    }

    try {
        // Fetch existing tags from database
        const { data: existingTags, error: fetchError } = await supabase
            .from("tags")
            .select("tag_name");

        if (fetchError) {
            console.error("Error fetching tags:", fetchError);
        }

        const tagList = existingTags?.map((t) => t.tag_name).join(", ") || "None";

        // Build prompt for Llama
        const prompt = `You are an intelligent tagging assistant.

Generate 3 short, relevant tags for the following survey question.

Rules:
- Each tag should be 1-2 words
- Use English only
- Capitalize the first letter of each word
- Tags should be descriptive and relevant to the question content
- Consider the question type and metadata if provided

Question: "${questionText}"
${meta_data ? `Question Type/Metadata: ${JSON.stringify(meta_data)}` : ''}
${tagList !== "None" ? `Existing tags in system (for reference): ${tagList}` : ''}

Respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, no extra text):
{
  "tags": ["Tag1", "Tag2", "Tag3"]
}`;

        console.log("Generating tags with Llama...");
        const rawResponse = await generateTagsWithLlama(prompt);

        // Clean response (remove any potential markdown)
        let cleanedText = rawResponse.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        // Parse the JSON response
        let parsedTags;
        try {
            const parsed = JSON.parse(cleanedText);
            parsedTags = parsed.tags;

            // Validate tags
            if (!Array.isArray(parsedTags) || parsedTags.length === 0) {
                throw new Error("Invalid tags format");
            }

            // Clean and validate each tag
            parsedTags = parsedTags
                .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
                .map(tag => tag.trim())
                .slice(0, 4); // Ensure max 4 tags

            if (parsedTags.length === 0) {
                throw new Error("No valid tags generated");
            }

        } catch (parseError) {
            console.error("Failed to parse Llama response:", cleanedText);
            console.error("Parse error:", parseError);
            return res.status(500).json({ 
                error: "Failed to parse tag response",
                rawResponse: cleanedText 
            });
        }

        console.log("Generated tags:", parsedTags);
        res.status(200).json({ tags: parsedTags });

    } catch (err) {
        console.error("Error generating tags:", err);
        res.status(500).json({ error: "Server error: " + err.message });
    }
};

exports.getAllTags = async (req, res) => {
    try {
        // Fetch all tags from the tags table
        const { data: tagsData, error } = await supabase
            .from("tags")
            .select("tag_name");

        if (error) {
            throw error;
        }

        // Transform the data to extract just the tag names
        const tags = tagsData.map(tag => tag.tag_name);

        // Return the tags in the requested format
        res.status(200).json({ tags });
    } catch (err) {
        console.error("Error fetching tags:", err);
        res.status(500).json({ error: "Server error: " + err.message });
    }
};