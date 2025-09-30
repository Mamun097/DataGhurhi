const supabase = require("../db"); // Import Supabase client

// Controller to fetch all vouchers
exports.getAllVouchers = async (req, res) => {
    try {
        const { data: vouchers, error } = await supabase
            .from("voucher")
            .select("*");

        if (error) {
            console.error("Error fetching vouchers:", error);
            return res.status(500).json({ error: "Error fetching vouchers: " + error.message });
        }

        // Sort vouchers by created_at in descending order (newest first)
        vouchers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.status(200).json({
            vouchers: vouchers || [],
            count: vouchers?.length || 0
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// Controller to fetch all voucher usage information with related data
exports.getAllVoucherUsageInfo = async (req, res) => {
    try {
        const { data: voucherUsageInfo, error } = await supabase
            .from("voucher_used_info")
            .select(`
                *,
                voucher:voucher_id (
                    id,
                    description,
                    code,
                    voucher_type,
                    discount_percentage,
                    max_discount
                ),
                subscription:subscription_id (
                    id,
                    package_name,
                    price
                )
            `);

        if (error) {
            console.error("Error fetching voucher usage info:", error);
            return res.status(500).json({ error: "Error fetching voucher usage info: " + error.message });
        }

        // Sort by purchased_at in descending order (most recent first)
        voucherUsageInfo.sort((a, b) => new Date(b.purchased_at) - new Date(a.purchased_at));

        res.status(200).json({
            voucherUsageInfo: voucherUsageInfo || [],
            count: voucherUsageInfo?.length || 0
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// Controller to fetch active vouchers only (not expired)
exports.getActiveVouchers = async (req, res) => {
    try {
        const currentDate = new Date().toISOString();

        const { data: activeVouchers, error } = await supabase
            .from("voucher")
            .select("*")
            .gt('end_at', currentDate); // Greater than current date

        if (error) {
            console.error("Error fetching active vouchers:", error);
            return res.status(500).json({ error: "Error fetching active vouchers: " + error.message });
        }

        // Sort by end_at in ascending order (expiring soon first)
        activeVouchers.sort((a, b) => new Date(a.end_at) - new Date(b.end_at));

        res.status(200).json({
            activeVouchers: activeVouchers || [],
            count: activeVouchers?.length || 0
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// Controller to fetch active public vouchers only (with usage limit check)
exports.getPublicVouchers = async (req, res) => {
    try {
        const currentDate = new Date().toISOString();
        const userId = req.jwt.id;

        if (!userId) {
            return res.status(401).json({ error: "User authentication required" });
        }

        const { data: publicVouchers, error } = await supabase
            .from("voucher")
            .select("*")
            .eq('voucher_type', 'public')
            .eq('status', true) // Only active vouchers
            .gt('end_at', currentDate); // Only active public vouchers

        if (error) {
            console.error("Error fetching public vouchers:", error);
            return res.status(500).json({ error: "Error fetching public vouchers: " + error.message });
        }

        // Get usage count for this user for each voucher
        const voucherIds = publicVouchers.map(voucher => voucher.voucher_id);

        const { data: usageData, error: usageError } = await supabase
            .from("voucher_used_info")
            .select("voucher_id")
            .eq('user_id', userId)
            .in('voucher_id', voucherIds);

        if (usageError) {
            console.error("Error fetching voucher usage data:", usageError);
            return res.status(500).json({ error: "Error fetching voucher usage data: " + usageError.message });
        }

        // Count usage for each voucher
        const usageCount = {};
        usageData.forEach(usage => {
            usageCount[usage.voucher_id] = (usageCount[usage.voucher_id] || 0) + 1;
        });

        // Filter vouchers based on usage limit
        const availableVouchers = publicVouchers.filter(voucher => {
            const userUsageCount = usageCount[voucher.voucher_id] || 0;

            // If max_use_count is NULL, treat as unlimited (infinite usage)
            if (voucher.max_use_count === null || voucher.max_use_count === undefined) {
                return true;
            }

            return userUsageCount < voucher.max_use_count;
        });

        // Sort by discount_percentage in descending order (best deals first)
        availableVouchers.sort((a, b) => b.discount_percentage - a.discount_percentage);

        res.status(200).json({
            publicVouchers: availableVouchers || [],
            count: availableVouchers?.length || 0
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// Validate manual coupon code
exports.validateVoucher = async (req, res) => {
    try {
        const { code, totalAmount } = req.body;
        const userId = req.jwt.id;

        // Check if user is authenticated
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        // Validate input parameters
        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required"
            });
        }

        if (typeof totalAmount !== 'number' || totalAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Valid total amount is required"
            });
        }

        const couponCode = code.trim().toUpperCase();
        console.log('Validating coupon:', couponCode, 'for amount:', totalAmount, 'for user:', userId);

        // Fetch voucher from database
        const { data: voucher, error: voucherError } = await supabase
            .from("voucher")
            .select("*")
            .eq("code", couponCode)
            .single();

        if (voucherError) {
            console.error("Error fetching voucher:", voucherError);

            // If no voucher found
            if (voucherError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: "Coupon code not found"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Error validating coupon: " + voucherError.message
            });
        }

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: "Coupon code not found"
            });
        }

        // Check if voucher is active (using 'status' column)
        if (!voucher.status) {
            return res.status(400).json({
                success: false,
                message: "This coupon is no longer active"
            });
        }

        // Check if voucher has expired
        const currentDate = new Date();
        const expiryDate = new Date(voucher.end_at);

        if (expiryDate < currentDate) {
            return res.status(400).json({
                success: false,
                message: "This coupon has expired"
            });
        }

        // Check minimum spend requirement
        if (voucher.min_spend_req && totalAmount < voucher.min_spend_req) {
            return res.status(400).json({
                success: false,
                message: `Minimum spend of ৳${voucher.min_spend_req} required for this coupon`
            });
        }

        // Check per-user usage limits if applicable (using 'max_use_count' column)
        if (voucher.max_use_count !== null && voucher.max_use_count !== undefined) {
            // Get current usage count for this specific user
            const { data: userUsageData, error: usageError } = await supabase
                .from("voucher_used_info")
                .select("voucher_id")
                .eq("user_id", userId)
                .eq("voucher_id", voucher.voucher_id);

            if (usageError) {
                console.error("Error checking user voucher usage:", usageError);
                return res.status(500).json({
                    success: false,
                    message: "Error checking voucher usage: " + usageError.message
                });
            }

            const userUsageCount = userUsageData ? userUsageData.length : 0;

            if (userUsageCount >= voucher.max_use_count) {
                return res.status(400).json({
                    success: false,
                    message: `You have already used this coupon ${voucher.max_use_count} time(s). Usage limit reached.`
                });
            }
        }

        // If we reach here, the voucher is valid
        console.log('Voucher validated successfully for user:', userId, voucher);

        // Return voucher data in the same format as public vouchers
        res.status(200).json({
            success: true,
            message: "Coupon is valid and applicable",
            voucher: {
                voucher_id: voucher.voucher_id,
                code: voucher.code,
                discount_percentage: voucher.discount_percentage,
                max_discount: voucher.max_discount,
                min_spend_req: voucher.min_spend_req,
                description: voucher.description,
                end_at: voucher.end_at,
                status: voucher.status,
                voucher_type: voucher.voucher_type
            }
        });

    } catch (error) {
        console.error("Server error in validateVoucher:", error);
        res.status(500).json({
            success: false,
            message: "Server error: " + error.message
        });
    }
};