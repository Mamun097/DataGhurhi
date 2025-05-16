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


exports.getTagsForQuestion = async (req, res) => {
  const questionId = req.body.questionId;

  try {
    // Fetch tag IDs associated with the question from the question_tag table
    const { data: questionTags, error: questionTagsError } = await supabase
      .from("question_tag")
      .select("tag_id")
      .eq("question_id", questionId);

    if (questionTagsError || !questionTags || questionTags.length === 0) {
      return res.status(200).json({ tags: [] });
    }

    const tagIds = questionTags.map((qt) => qt.tag_id);

    // Fetch tag names from the tags table using the tag IDs
    const { data: tags, error: tagsError } = await supabase
      .from("tags")
      .select("tag_name")
      .in("tag_id", tagIds);

    if (tagsError || !tags) {
      return res.status(500).json({ error: "Failed to fetch tags" });
    }

    const tagNames = tags.map((t) => t.tag_name);

    res.status(200).json({ tags: tagNames });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};