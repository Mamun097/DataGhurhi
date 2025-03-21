const supabase = require("../db"); // Import Supabase client

// ✅ Get all previous own questions
exports.getOwnQuestions = async (req, res) => {
    const { userId } = req.params;
    const { tags, limit } = req.query;

    try {
        let query = supabase
            .from("question")
            .select("question_id, text, image, input_type, privacy, question_tag(tag_id, tag:tags(tag_name))")
            .eq("user_id", userId);

        // Filter by tags if provided
        if (tags) {
            const tagArray = tags.split(",")
                .map(tag => parseInt(tag.trim())) // Convert each tag to an integer after trimming any spaces
                .filter(tag => !isNaN(tag)); // Exclude any non-numeric tags

            if (tagArray.length > 0) {
                query = query.in("question_tag.tag_id", tagArray); // Use 'in' instead of 'contains'
            }
        }

        // Apply limit if specified
        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const { data, error } = await query;

        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error: " + error.message });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
};


// ✅ Get all public questions from other surveyors
exports.getPublicQuestions = async (req, res) => {
    const { userId } = req.params;
    const { tags, limit } = req.query;

    try {
        let query = supabase
            .from("question")
            .select("question_id, text, image, input_type, privacy, question_tag(tag_id, tag:tags(tag_name))")
            .neq("user_id", userId) // Exclude the current user's own questions
            .eq("privacy", "public"); // Only fetch public questions

        // Filter by tags if provided
        if (tags) {
            const tagArray = tags.split(",")
                .map(tag => parseInt(tag.trim())) // Convert each tag to an integer after trimming any spaces
                .filter(tag => !isNaN(tag)); // Exclude any non-numeric tags

            if (tagArray.length > 0) {
                query = query.in("question_tag.tag_id", tagArray); // Use 'in' instead of 'contains'
            }
        }

        // Apply limit if specified
        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const { data, error } = await query;

        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error: " + error.message });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
};



// ✅ Import random questions based on filters
exports.importQuestions = async (req, res) => {
    const { userId, tags, limit } = req.body;

    try {
        let query = supabase
            .from("question")
            .select("question_id, text, image, input_type, privacy, question_tag(tag_id, tag:tags(tag_name))")
            .or(`user_id.eq.${userId},privacy.eq.public`); // Fetch user's own or public questions

        // Filter by tags if provided
        if (tags && typeof tags === 'string' && tags.length > 0) {
            const tagArray = tags.split(",").map(Number); // Convert to an array of integers
            query = query.contains("question_tag.tag_id", tagArray);
        }

        let { data, error } = await query;

        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error: " + error.message });
        }

        // Shuffle and limit the results
        if (limit) {
            data = shuffleArray(data).slice(0, limit);
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Utility function to shuffle array
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

