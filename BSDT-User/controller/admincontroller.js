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

        //sort packages by discount_price in ascending order
        packages.sort((a, b) => a.discount_price - b.discount_price);

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

        // First check if package exists
        const { data: existingPackage, error: fetchError } = await supabase
            .from("package")
            .select("package_id")
            .eq("package_id", id)
            .single();

        if (fetchError || !existingPackage) {
            return res.status(404).json({ error: "Package not found" });
        }

        const { error } = await supabase
            .from("package")
            .delete()
            .eq("package_id", id);

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

        // Validate required fields based on frontend data structure
        if (!packageData.title || !packageData.original_price || !packageData.discount_price) {
            return res.status(400).json({
                error: "Package title, original_price, and discount_price are required"
            });
        }

        // First check if package exists
        const { data: existingPackage, error: fetchError } = await supabase
            .from("package")
            .select("package_id")
            .eq("package_id", id)
            .single();

        if (fetchError || !existingPackage) {
            return res.status(404).json({ error: "Package not found" });
        }

        const { data, error } = await supabase
            .from("package")
            .update(packageData)
            .eq("package_id", id)
            .select();

        if (error) {
            console.error("Error updating package:", error);
            return res.status(500).json({ error: "Error updating package: " + error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Package not found or not updated" });
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

        // Validate required fields based on frontend data structure
        if (!packageData.title || !packageData.original_price || !packageData.discount_price) {
            return res.status(400).json({
                error: "Package title, original_price, and discount_price are required"
            });
        }

        // Additional validation
        if (!packageData.tag || !packageData.question || !packageData.survey || !packageData.validity) {
            return res.status(400).json({
                error: "All package fields (tag, question, survey, validity) are required"
            });
        }

        const { data, error } = await supabase
            .from("package")
            .insert(packageData)
            .select();

        if (error) {
            console.error("Error creating package:", error);
            return res.status(500).json({ error: "Error creating package: " + error.message });
        }

        if (!data || data.length === 0) {
            return res.status(500).json({ error: "Package creation failed - no data returned" });
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

// ✅ Alternative version - returns only the package ID (lighter response)
exports.getMostPopularPackageId = async (req, res) => {
    try {
        // Call database function using Supabase RPC
        const { data: popularPackageId, error } = await supabase
            .rpc('get_most_popular_package_id');

        if (error) {
            console.error("Error calling popular_package_id function:", error);
            return res.status(500).json({
                error: "Error retrieving popular package: " + error.message
            });
        }

        // If no popular package found, assign 0
        const packageId = popularPackageId || 0;

        res.status(200).json({
            popularPackageId: packageId
        });

    } catch (error) {
        console.error("Server error in getMostPopularPackageId:", error);
        res.status(500).json({
            error: "Server error: " + error.message
        });
    }
};


exports.getUserGrowthStats = async (req,res) => {
    try {
        // Get current date and calculate month boundaries
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // 0-based (0 = January)
        
        // Current month boundaries
        const currentMonthStart = new Date(currentYear, currentMonth, 1);
        const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
        
        // Previous month boundaries
        const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const previousMonthEnd = new Date(currentYear, currentMonth, 1); // Start of current month
        
        // Format dates for SQL queries (YYYY-MM-DD format)
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        const currentMonthStartStr = formatDate(currentMonthStart);
        const nextMonthStartStr = formatDate(nextMonthStart);
        const previousMonthStartStr = formatDate(previousMonthStart);
        const previousMonthEndStr = formatDate(previousMonthEnd);
        
        // Calculate days in each month
        const currentMonthDays = Math.ceil((currentDate - currentMonthStart) / (1000 * 60 * 60 * 24)) + 1;
        const previousMonthDays = Math.ceil((previousMonthEnd - previousMonthStart) / (1000 * 60 * 60 * 24));
        
        // Query current month users
        const { count: currentMonthUsers, error: currentMonthError } = await supabase
            .from("user")
            .select("*", { count: "exact", head: true })
            .neq("user_type", "admin")
            .gte("joined_at", currentMonthStartStr)
            .lt("joined_at", nextMonthStartStr);
        
        if (currentMonthError) {
            console.error("Error querying current month users:", currentMonthError);
            throw new Error("Error querying current month users: " + currentMonthError.message);
        }
        
        // Query previous month users
        const { count: previousMonthUsers, error: previousMonthError } = await supabase
            .from("user")
            .select("*", { count: "exact", head: true })
            .neq("user_type", "admin")
            .gte("joined_at", previousMonthStartStr)
            .lt("joined_at", previousMonthEndStr);
            
        
        if (previousMonthError) {
            console.error("Error querying previous month users:", previousMonthError);
            throw new Error("Error querying previous month users: " + previousMonthError.message);
        }
        
        // Get user counts (they're already available from the count queries)
        const currentMonthUsersCount = currentMonthUsers || 0;
        const previousMonthUsersCount = previousMonthUsers || 0;
        
        // Calculate daily averages
        const currentMonthAvg = currentMonthDays > 0 ? 
            parseFloat((currentMonthUsers / currentMonthDays).toFixed(2)) : 0.00;
        const previousMonthAvg = previousMonthDays > 0 ? 
            parseFloat((previousMonthUsers / previousMonthDays).toFixed(2)) : 0.00;
        
        // Calculate growth rate and percentage
        const growthRate = parseFloat((currentMonthAvg - previousMonthAvg).toFixed(2));
        
        let growthPercentage = 0.00;
        if (previousMonthAvg > 0) {
            growthPercentage = parseFloat(((growthRate / previousMonthAvg) * 100).toFixed(2));
        } else if (currentMonthAvg > 0) {
            growthPercentage = 100.00;
        }
        
        // Prepare response data
        const stats = {
            current_month_users: currentMonthUsers,
            previous_month_users: previousMonthUsers,
            current_month_days: currentMonthDays,
            previous_month_days: previousMonthDays,
            current_month_avg: currentMonthAvg,
            previous_month_avg: previousMonthAvg,
            growth_rate: growthRate,
            growth_percentage: growthPercentage
        };
        
        res.status(200).json({
            userGrowthStats: stats
        });
        
    } catch (error) {
        console.error("Server error in getUserGrowthStats:", error);
        res.status(500).json({
            error: "Server error: " + error.message,
            userGrowthStats: {
                current_month_users: 0,
                previous_month_users: 0,
                current_month_days: 0,
                previous_month_days: 0,
                current_month_avg: 0.00,
                previous_month_avg: 0.00,
                growth_rate: 0.00,
                growth_percentage: 0.00
            }
        });
    }
};

// ✅ Get survey growth statistics
exports.getSurveyGrowthStats = async (req, res) => {
    try {
        // Get current date and calculate month boundaries
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // 0-based (0 = January)
        
        // Current month boundaries
        const currentMonthStart = new Date(currentYear, currentMonth, 1);
        const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
        
        // Previous month boundaries
        const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const previousMonthEnd = new Date(currentYear, currentMonth, 1); // Start of current month
        
        // Format dates for SQL queries (YYYY-MM-DD format)
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        const currentMonthStartStr = formatDate(currentMonthStart);
        const nextMonthStartStr = formatDate(nextMonthStart);
        const previousMonthStartStr = formatDate(previousMonthStart);
        const previousMonthEndStr = formatDate(previousMonthEnd);
        
        // Calculate days in each month
        const currentMonthDays = Math.ceil((currentDate - currentMonthStart) / (1000 * 60 * 60 * 24)) + 1;
        const previousMonthDays = Math.ceil((previousMonthEnd - previousMonthStart) / (1000 * 60 * 60 * 24));
        
        // Query current month surveys
        const { count: currentMonthSurveys, error: currentMonthError } = await supabase
            .from("survey")
            .select("*", { count: "exact", head: true })
            .gte("created_at", currentMonthStartStr)
            .lt("created_at", nextMonthStartStr);
        
        if (currentMonthError) {
            console.error("Error querying current month surveys:", currentMonthError);
            throw new Error("Error querying current month surveys: " + currentMonthError.message);
        }
        
        // Query previous month surveys
        const { count: previousMonthSurveys, error: previousMonthError } = await supabase
            .from("survey")
            .select("*", { count: "exact", head: true })
            .gte("created_at", previousMonthStartStr)
            .lt("created_at", previousMonthEndStr);
        
        if (previousMonthError) {
            console.error("Error querying previous month surveys:", previousMonthError);
            throw new Error("Error querying previous month surveys: " + previousMonthError.message);
        }
        
        // Get survey counts
        const currentMonthSurveysCount = currentMonthSurveys || 0;
        const previousMonthSurveysCount = previousMonthSurveys || 0;
        
        // Calculate daily averages
        const currentMonthAvg = currentMonthDays > 0 ? 
            parseFloat((currentMonthSurveys / currentMonthDays).toFixed(2)) : 0.00;
        const previousMonthAvg = previousMonthDays > 0 ? 
            parseFloat((previousMonthSurveys / previousMonthDays).toFixed(2)) : 0.00;
        
        // Calculate growth rate and percentage
        const growthRate = parseFloat((currentMonthAvg - previousMonthAvg).toFixed(2));
        
        let growthPercentage = 0.00;
        if (previousMonthAvg > 0) {
            growthPercentage = parseFloat(((growthRate / previousMonthAvg) * 100).toFixed(2));
        } else if (currentMonthAvg > 0) {
            growthPercentage = 100.00;
        }
        
        // Prepare response data
        const stats = {
            current_month_surveys: currentMonthSurveys,
            previous_month_surveys: previousMonthSurveys,
            current_month_days: currentMonthDays,
            previous_month_days: previousMonthDays,
            current_month_avg: currentMonthAvg,
            previous_month_avg: previousMonthAvg,
            growth_rate: growthRate,
            growth_percentage: growthPercentage
        };
        
        res.status(200).json({
            surveyGrowthStats: stats
        });
        
    } catch (error) {
        console.error("Server error in getSurveyGrowthStats:", error);
        res.status(500).json({
            error: "Server error: " + error.message,
            surveyGrowthStats: {
                current_month_surveys: 0,
                previous_month_surveys: 0,
                current_month_days: 0,
                previous_month_days: 0,
                current_month_avg: 0.00,
                previous_month_avg: 0.00,
                growth_rate: 0.00,
                growth_percentage: 0.00
            }
        });
    }
};