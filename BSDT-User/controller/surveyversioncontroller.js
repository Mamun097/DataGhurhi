const supabase = require("../db"); // Import Supabase client

// ✅ Fetch version history for a survey
exports.getVersionHistory = async (req, res) => {
    const { surveyId } = req.params;

    try {
        const { data, error } = await supabase
            .from("survey_versions") // Table name
            .select("*")
            .eq("survey_id", surveyId)
            .order("changed_at", { ascending: false });

        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error: " + error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No version history found for this survey." });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Rollback to the latest version
exports.rollbackToLatestVersion = async (req, res) => {
    const { surveyId } = req.body;

    try {
        // Get the latest version of the survey
        const { data: latestVersion, error } = await supabase
            .from("survey_versions")
            .select("previous_data")
            .eq("survey_id", surveyId)
            .order("changed_at", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error: " + error.message });
        }

        if (!latestVersion) {
            return res.status(404).json({ error: "No previous version found for this survey." });
        }

        // Update the project with the previous data
        const { previous_data } = latestVersion;

        const { data: updatedSurvey, updateError } = await supabase
            .from("survey")
            .update({
                saved_template: previous_data.saved_template,
                survey_link: previous_data.survey_link,
                qr_code: previous_data.qr_code,
                starting_date: previous_data.starting_date,
                ending_date: previous_data.ending_date
            })
            .eq("survey_id", surveyId)
            .select("*")
            .single();

        if (updateError) {
            console.error("Update error:", updateError);
            return res.status(500).json({ error: "Failed to rollback: " + updateError.message });
        }

        res.status(200).json({ message: "Rollback successful!", survey: updatedSurvey });
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Rollback to a specific version
exports.rollbackToSpecificVersion = async (req, res) => {
    const { surveyId, versionId } = req.body;

    try {
        // Get the specific version data
        const { data: versionData, error } = await supabase
            .from("survey_versions")
            .select("previous_data")
            .eq("version_id", versionId)
            .single();

        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error: " + error.message });
        }

        if (!versionData) {
            return res.status(404).json({ error: "Version not found for the given ID." });
        }

        // Update the project with the previous version data
        const { previous_data } = versionData;

        const { data: updatedSurvey, updateError } = await supabase
            .from("survey")
            .update({
                saved_template: previous_data.saved_template,
                survey_link: previous_data.survey_link,
                qr_code: previous_data.qr_code,
                starting_date: previous_data.starting_date,
                ending_date: previous_data.ending_date
            })
            .eq("survey_id", surveyId)
            .select("*")
            .single();

        if (updateError) {
            console.error("Update error:", updateError);
            return res.status(500).json({ error: "Failed to rollback: " + updateError.message });
        }

        res.status(200).json({ message: "Rollback successful!", survey: updatedSurvey });
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
};
