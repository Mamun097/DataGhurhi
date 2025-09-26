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


// ✅ Create a new subscription (for custom packages)
exports.createSubscription = async (req, res) => {
    try {
        const subscriptionData = req.body;

        // Validate required fields
        if (!subscriptionData.user_id || !subscriptionData.start_date || !subscriptionData.end_date) {
            return res.status(400).json({
                error: "user_id, start_date, and end_date are required"
            });
        }

        // Validate user_id is a valid number
        if (isNaN(subscriptionData.user_id)) {
            return res.status(400).json({
                error: "user_id must be a valid number"
            });
        }

        // Validate date formats
        const startDate = new Date(subscriptionData.start_date);
        const endDate = new Date(subscriptionData.end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                error: "start_date and end_date must be valid ISO date strings"
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                error: "end_date must be after start_date"
            });
        }

        // Set default values for optional fields
        const subscriptionPayload = {
            user_id: parseInt(subscriptionData.user_id),
            tag: subscriptionData.tag || 0,
            question: subscriptionData.question || 0,
            survey: subscriptionData.survey || 0,
            participant_count: subscriptionData.participant_count || 0,
            advanced_analysis: subscriptionData.advanced_analysis || false,
            start_date: subscriptionData.start_date,
            end_date: subscriptionData.end_date,
            cost: subscriptionData.cost || 0,
            package_id: subscriptionData.package_id || null, // null for custom packages
        };

        // Check if user already has an active subscription (optional business logic)
        const { data: existingSubscription } = await supabase
            .from("subscription")
            .select("subscription_id, end_date")
            .eq("user_id", subscriptionPayload.user_id)
            .gte("end_date", new Date().toISOString())
            .order("end_date", { ascending: false })
            .limit(1);

        // If user has active subscription, you might want to handle this
        // For now, we'll just log it and continue
        if (existingSubscription && existingSubscription.length > 0) {
            console.log(`User ${subscriptionPayload.user_id} already has an active subscription ending at ${existingSubscription[0].end_date}`);
        }

        const { data, error } = await supabase
            .from("subscription")
            .insert(subscriptionPayload)
            .select();

        if (error) {
            console.error("Error creating subscription:", error);
            return res.status(500).json({
                error: "Error creating subscription: " + error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(500).json({
                error: "Subscription creation failed - no data returned"
            });
        }

        res.status(201).json({
            message: "Subscription created successfully",
            subscription: data[0],
            subscription_id: data[0].subscription_id || data[0].id
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Create voucher usage record (FIXED VERSION)
exports.createVoucherUsage = async (req, res) => {
    try {
        console.log("Received voucher usage data:", req.body);
        const voucherUsageData = req.body;

        // Validate required fields
        if (!voucherUsageData.user_id || !voucherUsageData.voucher_id || !voucherUsageData.subscription_id) {
            console.log("Missing required fields:", {
                user_id: voucherUsageData.user_id,
                voucher_id: voucherUsageData.voucher_id,
                subscription_id: voucherUsageData.subscription_id
            });
            return res.status(400).json({
                error: "user_id, voucher_id, and subscription_id are required"
            });
        }
        let purchasedAt = new Date().toISOString();

        // Validate discount_amount is a positive number
        const discountAmount = parseFloat(voucherUsageData.discount_amount) || 0;
        if (discountAmount < 0) {
            return res.status(400).json({
                error: "discount_amount must be a positive number"
            });
        }

        // Prepare voucher usage payload
        const voucherUsagePayload = {
            user_id: parseInt(voucherUsageData.user_id),
            voucher_id: voucherUsageData.voucher_id, // Keep as string (UUID)
            subscription_id: parseInt(voucherUsageData.subscription_id),
            purchased_at: purchasedAt,
            discount_amount: discountAmount,
        };

        const { data, error } = await supabase
            .from("voucher_used_info") // Make sure this matches your actual table name
            .insert(voucherUsagePayload)
            .select();

        if (error) {
            console.error("Error creating voucher usage record:", error);
            return res.status(500).json({
                error: "Error creating voucher usage record: " + error.message,
                details: error
            });
        }

        if (!data || data.length === 0) {
            return res.status(500).json({
                error: "Voucher usage record creation failed - no data returned"
            });
        }
        res.status(201).json({
            message: "Voucher usage recorded successfully",
            voucher_usage: data[0],
            voucher_used_id: data[0].id
        });

    } catch (error) {
        console.error("Server error in createVoucherUsage:", error);
        res.status(500).json({
            error: "Server error: " + error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};