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


// ✅ Reduce the question field of the package with the least validity
exports.reduceQuestionCount = async (req, res) => {
    try {
        const userId = req.jwt.id; // Assuming you get userId from JWT token
        const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD for date comparison

        console.log("User ID:", userId);
        console.log("Current Date:", currentDate);

        // First, get ALL subscriptions for the user to debug
        const { data: allSubscriptions, error: allError } = await supabase
            .from("subscription")
            .select("*")
            .eq("user_id", userId);

        if (allError) {
            console.error("Error fetching all subscriptions:", allError);
            return res.status(500).json({ 
                success: false,
                error: "Error fetching subscriptions: " + allError.message 
            });
        }

        console.log("All user subscriptions:", JSON.stringify(allSubscriptions, null, 2));

        if (!allSubscriptions || allSubscriptions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No subscriptions found for this user'
            });
        }

        // Filter active packages with questions manually
        const activePackagesWithQuestions = allSubscriptions.filter(subscription => {
            const endDate = subscription.end_date;
            const questionCount = subscription.question;
            
            console.log(`Checking subscription ${subscription.subscription_id}:`);
            console.log(`  End Date: ${endDate}, Current Date: ${currentDate}`);
            console.log(`  Question Count: ${questionCount} (type: ${typeof questionCount})`);
            console.log(`  Is Active: ${endDate >= currentDate}`);
            console.log(`  Has Questions: ${questionCount && parseInt(questionCount) > 0}`);
            
            return endDate >= currentDate && 
                   questionCount !== null && 
                   questionCount !== undefined && 
                   parseInt(questionCount) > 0;
        });

        console.log("Active packages with questions:", JSON.stringify(activePackagesWithQuestions, null, 2));

        if (activePackagesWithQuestions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active packages with available questions found for this user'
            });
        }

        // Sort by end_date ascending (earliest expiration first)
        activePackagesWithQuestions.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));

        // Get the package with the earliest expiration date
        const packageToUpdate = activePackagesWithQuestions[0];
        const currentQuestionCount = parseInt(packageToUpdate.question);

        console.log("Package to update:", JSON.stringify(packageToUpdate, null, 2));
        console.log("Current question count:", currentQuestionCount);

        // Update the question field by reducing it by 1
        const { data: updatedData, error: updateError } = await supabase
            .from("subscription")
            .update({ 
                question: currentQuestionCount - 1
            })
            .eq("subscription_id", packageToUpdate.subscription_id)
            .select();

        if (updateError) {
            console.error("Error updating package:", updateError);
            return res.status(500).json({ 
                success: false,
                error: "Error updating package: " + updateError.message 
            });
        }

        console.log("Update successful:", JSON.stringify(updatedData, null, 2));

        res.status(200).json({
            success: true,
            message: 'Question count reduced successfully',
            subscription_id: packageToUpdate.subscription_id,
            previous_question_count: currentQuestionCount,
            updated_question_count: currentQuestionCount - 1,
            package_end_date: packageToUpdate.end_date,
            updated_data: updatedData ? updatedData[0] : null
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            success: false,
            error: "Server error: " + error.message 
        });
    }
};

// ✅ Reduce the survey field of the package with the least validity
exports.reduceSurveyCount = async (req, res) => {
    try {
        const userId = req.jwt.id;
        const currentDate = new Date().toISOString().split('T')[0];

        console.log("User ID:", userId);
        console.log("Current Date:", currentDate);

        // Get all subscriptions for the user
        const { data: allSubscriptions, error: allError } = await supabase
            .from("subscription")
            .select("*")
            .eq("user_id", userId);

        if (allError) {
            console.error("Error fetching all subscriptions:", allError);
            return res.status(500).json({ 
                success: false,
                error: "Error fetching subscriptions: " + allError.message 
            });
        }

        console.log("All user subscriptions:", JSON.stringify(allSubscriptions, null, 2));

        if (!allSubscriptions || allSubscriptions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No subscriptions found for this user'
            });
        }

        // Filter active packages with surveys manually
        const activePackagesWithSurveys = allSubscriptions.filter(subscription => {
            const endDate = subscription.end_date;
            const surveyCount = subscription.survey;
            
            console.log(`Checking subscription ${subscription.subscription_id}:`);
            console.log(`  End Date: ${endDate}, Current Date: ${currentDate}`);
            console.log(`  Survey Count: ${surveyCount} (type: ${typeof surveyCount})`);
            console.log(`  Is Active: ${endDate >= currentDate}`);
            console.log(`  Has Surveys: ${surveyCount && parseInt(surveyCount) > 0}`);
            
            return endDate >= currentDate && 
                   surveyCount !== null && 
                   surveyCount !== undefined && 
                   parseInt(surveyCount) > 0;
        });

        console.log("Active packages with surveys:", JSON.stringify(activePackagesWithSurveys, null, 2));

        if (activePackagesWithSurveys.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active packages with available surveys found for this user'
            });
        }

        // Sort by end_date ascending (earliest expiration first)
        activePackagesWithSurveys.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));

        // Get the package with the earliest expiration date
        const packageToUpdate = activePackagesWithSurveys[0];
        const currentSurveyCount = parseInt(packageToUpdate.survey);

        console.log("Package to update:", JSON.stringify(packageToUpdate, null, 2));
        console.log("Current survey count:", currentSurveyCount);

        // Update the survey field by reducing it by 1
        const { data: updatedData, error: updateError } = await supabase
            .from("subscription")
            .update({ 
                survey: currentSurveyCount - 1
            })
            .eq("subscription_id", packageToUpdate.subscription_id)
            .select();

        if (updateError) {
            console.error("Error updating package:", updateError);
            return res.status(500).json({ 
                success: false,
                error: "Error updating package: " + updateError.message 
            });
        }

        console.log("Update successful:", JSON.stringify(updatedData, null, 2));

        res.status(200).json({
            success: true,
            message: 'Survey count reduced successfully',
            subscription_id: packageToUpdate.subscription_id,
            previous_survey_count: currentSurveyCount,
            updated_survey_count: currentSurveyCount - 1,
            package_end_date: packageToUpdate.end_date,
            updated_data: updatedData ? updatedData[0] : null
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            success: false,
            error: "Server error: " + error.message 
        });
    }
};

// ✅ Reduce the tag field of the package with the least validity
exports.reduceTagCount = async (req, res) => {
    try {
        const userId = req.jwt.id;
        const currentDate = new Date().toISOString().split('T')[0];

        console.log("User ID:", userId);
        console.log("Current Date:", currentDate);

        // Get all subscriptions for the user
        const { data: allSubscriptions, error: allError } = await supabase
            .from("subscription")
            .select("*")
            .eq("user_id", userId);

        if (allError) {
            console.error("Error fetching all subscriptions:", allError);
            return res.status(500).json({ 
                success: false,
                error: "Error fetching subscriptions: " + allError.message 
            });
        }

        console.log("All user subscriptions:", JSON.stringify(allSubscriptions, null, 2));

        if (!allSubscriptions || allSubscriptions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No subscriptions found for this user'
            });
        }

        // Filter active packages with tags manually
        const activePackagesWithTags = allSubscriptions.filter(subscription => {
            const endDate = subscription.end_date;
            const tagCount = subscription.tag;
            
            console.log(`Checking subscription ${subscription.subscription_id}:`);
            console.log(`  End Date: ${endDate}, Current Date: ${currentDate}`);
            console.log(`  Tag Count: ${tagCount} (type: ${typeof tagCount})`);
            console.log(`  Is Active: ${endDate >= currentDate}`);
            console.log(`  Has Tags: ${tagCount && parseInt(tagCount) > 0}`);
            
            return endDate >= currentDate && 
                   tagCount !== null && 
                   tagCount !== undefined && 
                   parseInt(tagCount) > 0;
        });

        console.log("Active packages with tags:", JSON.stringify(activePackagesWithTags, null, 2));

        if (activePackagesWithTags.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active packages with available tags found for this user'
            });
        }

        // Sort by end_date ascending (earliest expiration first)
        activePackagesWithTags.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));

        // Get the package with the earliest expiration date
        const packageToUpdate = activePackagesWithTags[0];
        const currentTagCount = parseInt(packageToUpdate.tag);

        console.log("Package to update:", JSON.stringify(packageToUpdate, null, 2));
        console.log("Current tag count:", currentTagCount);

        // Update the tag field by reducing it by 1
        const { data: updatedData, error: updateError } = await supabase
            .from("subscription")
            .update({ 
                tag: currentTagCount - 1
            })
            .eq("subscription_id", packageToUpdate.subscription_id)
            .select();

        if (updateError) {
            console.error("Error updating package:", updateError);
            return res.status(500).json({ 
                success: false,
                error: "Error updating package: " + updateError.message 
            });
        }

        console.log("Update successful:", JSON.stringify(updatedData, null, 2));

        res.status(200).json({
            success: true,
            message: 'Tag count reduced successfully',
            subscription_id: packageToUpdate.subscription_id,
            previous_tag_count: currentTagCount,
            updated_tag_count: currentTagCount - 1,
            package_end_date: packageToUpdate.end_date,
            updated_data: updatedData ? updatedData[0] : null
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            success: false,
            error: "Server error: " + error.message 
        });
    }
};