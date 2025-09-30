const supabase = require("../db"); // Import Supabase client

// ✅ Get all coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const { data: coupons, error } = await supabase
            .from("voucher")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching coupons:", error);
            return res.status(500).json({ error: "Error fetching coupons: " + error.message });
        }

        res.status(200).json({
            coupons: coupons || [],
            count: coupons?.length || 0
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Get coupon by ID
exports.getCouponById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Coupon ID is required" });
        }

        const { data: coupon, error } = await supabase
            .from("voucher")
            .select("*")
            .eq("voucher_id", id)
            .single();

        if (error) {
            console.error("Error fetching coupon:", error);
            return res.status(404).json({ error: "Coupon not found" });
        }

        res.status(200).json({
            coupon: coupon
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Create a new coupon
exports.createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discount_percentage,
            min_spend_req,
            max_discount,
            max_use_count,
            end_at,
            voucher_type,
            status
        } = req.body;

        // Validate required fields
        if (!code || !description || !discount_percentage || !max_discount || !end_at) {
            return res.status(400).json({
                error: "Code, description, discount_percentage, max_discount, and end_at are required"
            });
        }

        // Validate discount percentage range
        if (discount_percentage < 0 || discount_percentage > 100) {
            return res.status(400).json({
                error: "Discount percentage must be between 0 and 100"
            });
        }

        // Validate min_spend_req and max_discount are non-negative
        if (min_spend_req < 0 || max_discount < 0) {
            return res.status(400).json({
                error: "Minimum spend requirement and maximum discount must be non-negative"
            });
        }

        // Validate max_use_count if provided
        if (max_use_count !== null && max_use_count !== undefined && max_use_count <= 0) {
            return res.status(400).json({
                error: "Maximum use count must be greater than 0"
            });
        }

        // Validate voucher_type
        if (voucher_type && !['public', 'private'].includes(voucher_type)) {
            return res.status(400).json({
                error: "Voucher type must be either 'public' or 'private'"
            });
        }

        // Check if coupon code already exists
        const { data: existingCoupon, error: checkError } = await supabase
            .from("voucher")
            .select("code")
            .eq("code", code.toUpperCase())
            .single();

        if (existingCoupon) {
            return res.status(400).json({ error: "Coupon code already exists" });
        }

        // Prepare coupon data
        const couponData = {
            code: code.toUpperCase(),
            description,
            discount_percentage: parseFloat(discount_percentage),
            min_spend_req: parseFloat(min_spend_req) || 0,
            max_discount: parseFloat(max_discount),
            max_use_count: max_use_count ? parseInt(max_use_count) : null,
            end_at: end_at,
            voucher_type: voucher_type || 'public',
            status: status !== undefined ? status : true
        };

        const { data, error } = await supabase
            .from("voucher")
            .insert([couponData])
            .select();

        if (error) {
            console.error("Error creating coupon:", error);
            return res.status(500).json({ error: "Error creating coupon: " + error.message });
        }

        res.status(201).json({
            message: "Coupon created successfully",
            coupon: data[0]
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Update a coupon
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            code,
            description,
            discount_percentage,
            min_spend_req,
            max_discount,
            max_use_count,
            end_at,
            voucher_type,
            status
        } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Coupon ID is required" });
        }

        // Validate required fields
        if (!code || !description || !discount_percentage || !max_discount || !end_at) {
            return res.status(400).json({
                error: "Code, description, discount_percentage, max_discount, and end_at are required"
            });
        }

        // Validate discount percentage range
        if (discount_percentage < 0 || discount_percentage > 100) {
            return res.status(400).json({
                error: "Discount percentage must be between 0 and 100"
            });
        }

        // Validate min_spend_req and max_discount are non-negative
        if (min_spend_req < 0 || max_discount < 0) {
            return res.status(400).json({
                error: "Minimum spend requirement and maximum discount must be non-negative"
            });
        }

        // Validate max_use_count if provided
        if (max_use_count !== null && max_use_count !== undefined && max_use_count <= 0) {
            return res.status(400).json({
                error: "Maximum use count must be greater than 0"
            });
        }

        // Validate voucher_type
        if (voucher_type && !['public', 'private'].includes(voucher_type)) {
            return res.status(400).json({
                error: "Voucher type must be either 'public' or 'private'"
            });
        }

        // First check if coupon exists
        const { data: existingCoupon, error: fetchError } = await supabase
            .from("voucher")
            .select("voucher_id, code")
            .eq("voucher_id", id)
            .single();

        if (fetchError || !existingCoupon) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        // Check if the new code conflicts with another coupon (excluding current one)
        if (code.toUpperCase() !== existingCoupon.code) {
            const { data: conflictingCoupon, error: conflictError } = await supabase
                .from("voucher")
                .select("code")
                .eq("code", code.toUpperCase())
                .neq("voucher_id", id)
                .single();

            if (conflictingCoupon) {
                return res.status(400).json({ error: "Coupon code already exists" });
            }
        }

        // Prepare update data
        const updateData = {
            code: code.toUpperCase(),
            description,
            discount_percentage: parseFloat(discount_percentage),
            min_spend_req: parseFloat(min_spend_req) || 0,
            max_discount: parseFloat(max_discount),
            max_use_count: max_use_count ? parseInt(max_use_count) : null,
            end_at: end_at,
            voucher_type: voucher_type || 'public',
            status: status !== undefined ? status : true
        };

        const { data, error } = await supabase
            .from("voucher")
            .update(updateData)
            .eq("voucher_id", id)
            .select();

        if (error) {
            console.error("Error updating coupon:", error);
            return res.status(500).json({ error: "Error updating coupon: " + error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Coupon not found or not updated" });
        }

        res.status(200).json({
            message: "Coupon updated successfully",
            coupon: data[0]
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Delete a coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Coupon ID is required" });
        }

        // First check if coupon exists
        const { data: existingCoupon, error: fetchError } = await supabase
            .from("voucher")
            .select("voucher_id")
            .eq("voucher_id", id)
            .single();

        if (fetchError || !existingCoupon) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        const { error } = await supabase
            .from("voucher")
            .delete()
            .eq("voucher_id", id);

        if (error) {
            console.error("Error deleting coupon:", error);
            return res.status(500).json({ error: "Error deleting coupon: " + error.message });
        }

        res.status(200).json({ message: "Coupon deleted successfully" });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Toggle coupon status (Active/Inactive)
exports.toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Coupon ID is required" });
        }

        if (typeof status !== 'boolean') {
            return res.status(400).json({ error: "Status must be a boolean value" });
        }

        // First check if coupon exists
        const { data: existingCoupon, error: fetchError } = await supabase
            .from("voucher")
            .select("voucher_id")
            .eq("voucher_id", id)
            .single();

        if (fetchError || !existingCoupon) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        const { data, error } = await supabase
            .from("voucher")
            .update({ status })
            .eq("voucher_id", id)
            .select();

        if (error) {
            console.error("Error updating coupon status:", error);
            return res.status(500).json({ error: "Error updating coupon status: " + error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Coupon not found or not updated" });
        }

        res.status(200).json({
            message: `Coupon ${status ? 'activated' : 'deactivated'} successfully`,
            coupon: data[0]
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Get coupon statistics (for admin dashboard)
exports.getCouponStats = async (req, res) => {
    try {
        // Total coupons
        const { count: totalCoupons, error: totalError } = await supabase
            .from("voucher")
            .select("*", { count: "exact", head: true });

        if (totalError) {
            console.error("Error counting total coupons:", totalError);
            return res.status(500).json({ error: "Error counting total coupons: " + totalError.message });
        }

        // Active coupons
        const { count: activeCoupons, error: activeError } = await supabase
            .from("voucher")
            .select("*", { count: "exact", head: true })
            .eq("status", true);

        if (activeError) {
            console.error("Error counting active coupons:", activeError);
            return res.status(500).json({ error: "Error counting active coupons: " + activeError.message });
        }

        // Expired coupons
        const { count: expiredCoupons, error: expiredError } = await supabase
            .from("voucher")
            .select("*", { count: "exact", head: true })
            .lt("end_at", new Date().toISOString());

        if (expiredError) {
            console.error("Error counting expired coupons:", expiredError);
            return res.status(500).json({ error: "Error counting expired coupons: " + expiredError.message });
        }

        // Public vs Private coupons
        const { count: publicCoupons, error: publicError } = await supabase
            .from("voucher")
            .select("*", { count: "exact", head: true })
            .eq("voucher_type", "public");

        if (publicError) {
            console.error("Error counting public coupons:", publicError);
            return res.status(500).json({ error: "Error counting public coupons: " + publicError.message });
        }

        const { count: privateCoupons, error: privateError } = await supabase
            .from("voucher")
            .select("*", { count: "exact", head: true })
            .eq("voucher_type", "private");

        if (privateError) {
            console.error("Error counting private coupons:", privateError);
            return res.status(500).json({ error: "Error counting private coupons: " + privateError.message });
        }

        res.status(200).json({
            totalCoupons: totalCoupons || 0,
            activeCoupons: activeCoupons || 0,
            inactiveCoupons: (totalCoupons || 0) - (activeCoupons || 0),
            expiredCoupons: expiredCoupons || 0,
            publicCoupons: publicCoupons || 0,
            privateCoupons: privateCoupons || 0
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// ✅ Validate coupon code (for frontend usage)
exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.params;
        const { amount } = req.query; // Optional: order amount to check min_spend_req

        if (!code) {
            return res.status(400).json({ error: "Coupon code is required" });
        }

        const { data: coupon, error } = await supabase
            .from("voucher")
            .select("*")
            .eq("code", code.toUpperCase())
            .eq("status", true)
            .single();

        if (error || !coupon) {
            return res.status(404).json({ 
                error: "Invalid or inactive coupon code",
                valid: false 
            });
        }

        // Check if coupon is expired
        if (new Date(coupon.end_at) < new Date()) {
            return res.status(400).json({ 
                error: "Coupon has expired",
                valid: false 
            });
        }

        // Check minimum spend requirement if amount is provided
        if (amount && parseFloat(amount) < coupon.min_spend_req) {
            return res.status(400).json({ 
                error: `Minimum spend requirement is ৳${coupon.min_spend_req}`,
                valid: false,
                minSpendRequired: coupon.min_spend_req
            });
        }

        // Calculate discount if amount is provided
        let discountAmount = 0;
        if (amount) {
            discountAmount = Math.min(
                (parseFloat(amount) * coupon.discount_percentage) / 100,
                coupon.max_discount
            );
        }

        res.status(200).json({
            valid: true,
            coupon: {
                voucher_id: coupon.voucher_id,
                code: coupon.code,
                description: coupon.description,
                discount_percentage: coupon.discount_percentage,
                min_spend_req: coupon.min_spend_req,
                max_discount: coupon.max_discount,
                voucher_type: coupon.voucher_type
            },
            discountAmount: discountAmount,
            message: "Coupon is valid"
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};