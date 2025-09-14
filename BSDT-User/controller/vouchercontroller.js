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

// Controller to fetch public vouchers only
exports.getPublicVouchers = async (req, res) => {
    try {
        const currentDate = new Date().toISOString();
        
        const { data: publicVouchers, error } = await supabase
            .from("voucher")
            .select("*")
            .eq('voucher_type', 'public')
            .gt('end_at', currentDate); // Only active public vouchers

        if (error) {
            console.error("Error fetching public vouchers:", error);
            return res.status(500).json({ error: "Error fetching public vouchers: " + error.message });
        }

        // Sort by discount_percentage in descending order (best deals first)
        publicVouchers.sort((a, b) => b.discount_percentage - a.discount_percentage);

        res.status(200).json({
            publicVouchers: publicVouchers || [],
            count: publicVouchers?.length || 0
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};