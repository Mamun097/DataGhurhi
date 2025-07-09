const supabase = require("../db");

const searchAll = async (query, filter) => {
  const ilikeQuery = `%${query}%`;

  try {
    if (filter === "account") {
      // Search in `user` table by name
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .ilike("name", ilikeQuery);
      if (error) return { error };
      return { data: data.map((d) => ({ ...d, type: "account" })) };
    }

    if (filter === "project") {
      // Search in `survey_project` table by public title
      const { data, error } = await supabase
        .from("survey_project")
        .select("*")
        .ilike("title", ilikeQuery)
        .eq("privacy_mode", "public");
      if (error) return { error };
      return { data: data.map((d) => ({ ...d, type: "project" })) };
    }

    if (filter === "survey") {
      // Search in `survey` table by published title
      const { data, error } = await supabase
        .from("survey")
        .select("*")
        .ilike("title", ilikeQuery)
        .eq("survey_status", "published");
      if (error) return { error };
      return { data: data.map((d) => ({ ...d, type: "survey" })) };
    }

    // Search across all three
    const [accRes, projRes, surRes] = await Promise.all([
      supabase
        .from("user")
        .select("*")
        .ilike("name", ilikeQuery),
      supabase
        .from("survey_project")
        .select("*")
        .ilike("title", ilikeQuery)
        .eq("privacy_mode", "public"),
      supabase
        .from("survey")
        .select("*")
        .ilike("title", ilikeQuery)
        .eq("survey_status", "published"),
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

module.exports = { searchAll };
