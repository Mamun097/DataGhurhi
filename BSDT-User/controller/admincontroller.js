const supabase = require("../db"); // Import Supabase client

// ✅ Get admin dashboard statistics
exports.getStats = async (req, res) => {
    try {
        // 1. Count total users (excluding admin)
        const { count: totalUsers, error: userError } = await supabase
            .from("user")
            .select("*", { count: "exact", head: true })
            .neq("user_type", "admin");

        if (userError) {
            console.error("Error counting users:", userError);
            return res.status(500).json({ error: "Error counting users: " + userError.message });
        }

        // 2. Count active surveys (published status)
        const { count: activeSurveys, error: surveyError } = await supabase
            .from("survey")
            .select("*", { count: "exact", head: true })
            .eq("survey_status", "published");

        if (surveyError) {
            console.error("Error counting surveys:", surveyError);
            return res.status(500).json({ error: "Error counting surveys: " + surveyError.message });
        }

        // 3. Count total responses
        const { count: totalResponses, error: responseError } = await supabase
            .from("survey_response")
            .select("*", { count: "exact", head: true });

        if (responseError) {
            console.error("Error counting responses:", responseError);
            return res.status(500).json({ error: "Error counting responses: " + responseError.message });
        }

        // 4. Count premium users
        const { count: premiumUsers, error: premiumError } = await supabase
            .from("user")
            .select("*", { count: "exact", head: true })
            .eq("user_type", "premium");

        if (premiumError) {
            console.error("Error counting premium users:", premiumError);
            return res.status(500).json({ error: "Error counting premium users: " + premiumError.message });
        }

        // Return all statistics
        res.status(200).json({
            totalUsers: totalUsers || 0,
            activeSurveys: activeSurveys || 0,
            totalResponses: totalResponses || 0,
            premiumUsers: premiumUsers || 0
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Get all packages
exports.getAllPackages = async (req, res) => {
    try {
        const { data: packages, error } = await supabase
            .from("package")
            .select("*");

        if (error) {
            console.error("Error fetching packages:", error);
            return res.status(500).json({ error: "Error fetching packages: " + error.message });
        }

        res.status(200).json({
            packages: packages || [],
            count: packages?.length || 0
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};
// ✅ Delete a package
exports.deletePackage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Package ID is required" });
        }

        const { error } = await supabase
            .from("package")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting package:", error);
            return res.status(500).json({ error: "Error deleting package: " + error.message });
        }

        res.status(200).json({ message: "Package deleted successfully" });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Update a package
exports.updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const packageData = req.body;

        if (!id) {
            return res.status(400).json({ error: "Package ID is required" });
        }

        const { data, error } = await supabase
            .from("package")
            .update(packageData)
            .eq("id", id)
            .select();

        if (error) {
            console.error("Error updating package:", error);
            return res.status(500).json({ error: "Error updating package: " + error.message });
        }

        res.status(200).json({ 
            message: "Package updated successfully",
            package: data[0]
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};


// ✅ Create a new package
exports.createPackage = async (req, res) => {
    try {
        const packageData = req.body;

        if (!packageData.name || !packageData.price) {
            return res.status(400).json({ error: "Package name and price are required" });
        }

        const { data, error } = await supabase
            .from("package")
            .insert(packageData)
            .select();

        if (error) {
            console.error("Error creating package:", error);
            return res.status(500).json({ error: "Error creating package: " + error.message });
        }

        res.status(201).json({ 
            message: "Package created successfully",
            package: data[0]
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};