const supabase = require("../db"); // Import Supabase client

// ✅ Get user packages/subscriptions
exports.getUserPackages = async (req, res) => {
    try {
        const userId = req.jwt.id; // Assuming you get userId from JWT token

        // Query to get all user packages (both active and expired)
        const { data: subscriptions, error } = await supabase
            .from("subscription")
            .select("*")
            .eq("user_id", userId)
            .order("start_date", { ascending: false });

        if (error) {
            console.error("Error fetching user packages:", error);
            return res.status(500).json({ 
                success: false,
                error: "Error fetching user packages: " + error.message 
            });
        }

        if (!subscriptions || subscriptions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No packages found for this user',
                packages: [],
                total_packages: 0,
                active_packages: 0,
                expired_packages: 0
            });
        }

        // Format the response
        const packages = subscriptions.map(row => ({
            subscription_id: row.subscription_id,
            user_id: row.user_id,
            tag: parseInt(row.tag) || 0,
            question: parseInt(row.question) || 0,
            survey: parseInt(row.survey) || 0,
            start_date: row.start_date,
            end_date: row.end_date,
            cost: parseFloat(row.cost) || 0,
            package_id: row.package_id,
            created_at: row.created_at,
            is_active: new Date(row.end_date) > new Date() // Check if package is still active
        }));

        // Calculate statistics
        const activePackages = packages.filter(pkg => pkg.is_active);
        const expiredPackages = packages.filter(pkg => !pkg.is_active);

        res.status(200).json({
            success: true,
            message: 'User packages retrieved successfully',
            packages: packages,
            total_packages: packages.length,
            active_packages: activePackages.length,
            expired_packages: expiredPackages.length
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            success: false,
            error: "Server error: " + error.message 
        });
    }
};