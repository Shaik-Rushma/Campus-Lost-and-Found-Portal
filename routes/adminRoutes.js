const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Item = require("../models/Item");
const Claim = require("../models/Claim");

const { protect, adminOnly } = require("../middleware/auth");

router.get("/stats", protect, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalItems = await Item.countDocuments();
        const pendingClaims = await Claim.countDocuments({
            status: "pending"
        });
        const approvedClaims = await Claim.countDocuments({
            status: "approved"
        });

        res.json({
            totalUsers,
            totalItems,
            pendingClaims,
            approvedClaims
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to load dashboard statistics."
        });
    }
});

module.exports = router;