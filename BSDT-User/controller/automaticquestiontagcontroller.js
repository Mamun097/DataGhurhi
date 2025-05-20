require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("../db"); // Import Supabase client

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateTagsForQuestion = async (req, res) => {
  const questionText = req.body.question_text;
  const meta_data= req.body.meta_data;

  try {
    // Fetch existing tags
    const { data: existingTags } = await supabase
      .from("tags")
      .select("tag_name");

    const tagList = existingTags?.map((t) => t.tag_name).join(", ") || "";

    // Gemini Prompt
    const prompt = `You are an intelligent tagging assistant.

Given a question and a list of existing tags, generate 3 to 4 short, relevant tags (1–3 words each). 
In meta_data, you will find tags if the question already has some tags. In that case, your generated
tags should not contains those. Also, in that case, you can generate fewer tags.
- Use English only.
- Capitalize the first letter of each word.
- Reuse tags from the existing tag list if they are appropriate.

⚠️ Return ONLY the following:
A valid JSON object with this structure (no code blocks, no extra quotes, no explanation):

{
  "tags": ["Tag1", "Tag2", "Tag3"]
}

Question: ${questionText}
Question Meta Data: ${meta_data}
Existing Tags: [${tagList}]`;

    // Use Gemini API
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText = await result.response.text();

    // Clean and parse Gemini's response
    const cleanedText = rawText
      .replace(/```json|```/g, "") // remove markdown code fences
      .trim();

    let parsedTags;
    try {
      const parsed = JSON.parse(cleanedText);
      parsedTags = parsed.tags;
    } catch (e) {
      console.error("Failed to parse Gemini response:", cleanedText);
      return res.status(500).json({ error: "Failed to parse tag response" });
    }

    res.status(200).json({ tags: parsedTags });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};