
const express = require("express");
const Claim = require("../models/Claim");
const Item = require("../models/Item");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Submit a claim
router.post("/:itemId", protect, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Please provide a claim message."
            });
        }

        const item = await Item.findById(req.params.itemId);

        if (!item) {
            return res.status(404).json({
                message: "Item not found."
            });
        }

        if (item.reportedBy.toString() === req.user._id.toString()) {
            return res.status(403).json({
                message: "You cannot claim your own report."
            });
        }

        if (item.status !== "open") {
            return res.status(400).json({
                message: "This item is not available for claiming."
            });
        }

        const existingClaim = await Claim.findOne({
            item: item._id,
            claimedBy: req.user._id,
            status: "pending"
        });

        if (existingClaim) {
            return res.status(409).json({
                message: "You already have a pending claim for this item."
            });
        }

        const claim = await Claim.create({
            item: item._id,
            claimedBy: req.user._id,
            message
        });

        res.status(201).json({
            message: "Claim submitted successfully!",
            claim
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to submit claim.",
            error: error.message
        });
    }
});

// View claims submitted by the logged-in user
router.get("/my-claims", protect, async (req, res) => {
    try {
        const claims = await Claim.find({
            claimedBy: req.user._id
        })
        .populate("item")
        .sort({ createdAt: -1 });

        res.json(claims);

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve your claims."
        });
    }
});

// Admin: View all claims
router.get("/", protect, adminOnly, async (req, res) => {
    try {
        const claims = await Claim.find()
            .populate("item")
            .populate("claimedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(claims);

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve claims."
        });
    }
});

// Admin: Approve or reject a claim
router.patch("/:claimId", protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected."
            });
        }

        const claim = await Claim.findById(req.params.claimId);

        if (!claim) {
            return res.status(404).json({
                message: "Claim not found."
            });
        }

        if (claim.status !== "pending") {
            return res.status(400).json({
                message: "This claim has already been reviewed."
            });
        }

        claim.status = status;
        await claim.save();

        if (status === "approved") {
            await Item.findByIdAndUpdate(claim.item, {
                status: "claimed"
            });

            await Claim.updateMany(
                {
                    item: claim.item,
                    _id: { $ne: claim._id },
                    status: "pending"
                },
                { status: "rejected" }
            );
        }

        res.json({
            message: `Claim ${status} successfully!`,
            claim
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to update claim."
        });
    }
});

module.exports = router;
