const supabase = require("../db"); // Import Supabase client

// ✅ Get all previous own questions
exports.getOwnQuestions = async (req, res) => {
    const { userId } = req.params;
    const { tags, limit } = req.query;

    try {
        let query = supabase
            .from("question")
            .select(`
                user_id,
                question_id, 
                text, 
                image, 
                question_type, 
                privacy, 
                meta_data,
                question_tag!inner(tag_id, tags!inner(tag_name))
            `)
            .eq("user_id", userId); // Fetch only the user's own questions

        // Filter by tags if provided
        if (tags) {
            const tagArray = tags.split(",").map(tag => tag.trim()); // Convert to an array

            if (tagArray.length > 0) {
                query = query.in("question_tag.tags.tag_name", tagArray); // Filter by tag names
            }
        }

        // Fetch data first
        let { data, error } = await query;

        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error: " + error.message });
        }

        // Apply randomization in JavaScript since Supabase does not support direct random ordering
        if (data.length > 1) {
            data = shuffleArray(data);
        }

        // Apply limit after shuffling
        if (limit) {
            data = data.slice(0, parseInt(limit));
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};




// ✅ Get all public questions
exports.getPublicQuestions = async (req, res) => {
    const { tags, limit } = req.query;

    try {
        let query = supabase
            .from("question")
            .select(`
                user_id,
                question_id, 
                text, 
                image, 
                question_type, 
                privacy, 
                meta_data,
                question_tag!inner(tag_id, tags!inner(tag_name))
            `)
            .eq("privacy", "public"); // Only fetch public questions

        // Filter by tags if provided
        if (tags) {
            const tagArray = tags.split(",").map(tag => tag.trim()); // Convert to an array

            if (tagArray.length > 0) {
                query = query.in("question_tag.tags.tag_name", tagArray); // Filter by tag names
            }
        }

        // Fetch data first
        let { data, error } = await query;

        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error: " + error.message });
        }

        // Ensure only filtered questions are considered
        data = data.filter(q => q.question_tag.some(tag => tags.split(",").includes(tag.tags.tag_name)));

        // Apply randomization
        if (data.length > 1) {
            data = shuffleArray(data);
        }

        // Apply limit after shuffling
        if (limit) {
            data = data.slice(0, parseInt(limit));
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};


// ✅ Import random questions based on filters
exports.importQuestions = async (req, res) => {
    const { userId } = req.params;  // Get userId from URL params
    const { tags, limit } = req.query;  // Get tags and limit from query params

    try {
        let query = supabase
            .from("question")
            .select(`
                user_id, question_id, text, image, question_type, privacy, meta_data,
                question_tag!inner(tag_id, tags!inner(tag_name))
            `)
            .or(`user_id.eq.${userId},privacy.eq.public`);  // Fetch user's own or public questions

        // Filter by tags
        if (tags) {
            const tagArray = tags.split(",").map(tag => tag.trim());  // Convert to array
            query = query.in("question_tag.tags.tag_name", tagArray);
        }

        // Fetch data from the database
        let { data, error } = await query;

        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error: " + error.message });
        }

        // Shuffle and apply limit
        if (limit) {
            data = shuffleArray(data).slice(0, parseInt(limit));
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Utility function to shuffle an array
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}