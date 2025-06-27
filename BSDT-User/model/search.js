const supabase = require('../db');

const searchAll = async (query, filter) => {
    const ilikeQuery = `%${query}%`;

    try {
        if (filter === "account") {
            const { data, error } = await supabase
                .from("user")
                .select("*")
                .ilike("name", ilikeQuery);
            if (error) return { error };
            return { data: data.map(d => ({ ...d, type: "account" })) };
        }

        if (filter === "project") {
            const { data, error } = await supabase
                .from("survey_project")
                .select("*")
                .ilike("title", ilikeQuery)
                .privacy_mode("public");
            if (error) return { error };
            return { data: data.map(d => ({ ...d, type: "project" })) };
        }

        if (filter === "survey") {
            const { data, error } = await supabase
                .from("survey")
                .select("*")
                .ilike("title", ilikeQuery)
                .survey_status("published")
                ;
                
            if (error) return { error };
            return { data: data.map(d => ({ ...d, type: "survey" })) };
        }

        // Search all
        const [accRes, projRes, surRes] = await Promise.all([
            supabase.from("accounts").select("*").ilike("username", ilikeQuery),
            supabase.from("projects").select("*").ilike("title", ilikeQuery),
            supabase.from("surveys").select("*").ilike("name", ilikeQuery),
        ]);

        if (accRes.error || projRes.error || surRes.error) {
            return { error: accRes.error || projRes.error || surRes.error };
        }

        const data = [
            ...accRes.data.map((d) => ({ ...d, type: "account" })),
            ...projRes.data.map((d) => ({ ...d, type: "project" })),
            ...surRes.data.map((d) => ({ ...d, type: "survey" })),
        ];

        return { data };
    } catch (error) {
        console.error("Search internal error:", error);
        return { error: "Internal server error" };
    }
};

module.exports = {
    searchAll,
};
