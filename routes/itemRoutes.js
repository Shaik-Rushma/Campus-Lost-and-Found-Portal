
const express = require("express");
const Item = require("../models/Item");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Report a lost or found item
router.post("/", protect, async (req, res) => {
    try {
        const {
            name,
            category,
            description,
            location,
            building,
            date,
            type,
            image
        } = req.body;

        const item = await Item.create({
            name,
            category,
            description,
            location,
            building,
            date,
            type,
            image,
            reportedBy: req.user._id
        });

        res.status(201).json({
            message: "Item reported successfully!",
            item
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to report item.",
            error: error.message
        });
    }
});

// Get all items with search and filters
router.get("/", async (req, res) => {
    try {
        const { search, category, type, building } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (category) filter.category = category;
        if (type) filter.type = type;
        if (building) filter.building = building;

        const items = await Item.find(filter)
            .populate("reportedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(items);

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve items."
        });
    }
});

// Get items reported by the logged-in user
router.get("/my-items", protect, async (req, res) => {
    try {
        const items = await Item.find({
            reportedBy: req.user._id
        }).sort({ createdAt: -1 });

        res.json(items);

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve your items."
        });
    }
});

// Get one item by ID
router.get("/:id", async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate("reportedBy", "name email");

        if (!item) {
            return res.status(404).json({
                message: "Item not found."
            });
        }

        res.json(item);

    } catch (error) {
        res.status(400).json({
            message: "Invalid item ID."
        });
    }
});

// Update an item (owner or admin)
router.put("/:id", protect, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found."
            });
        }

        if (
            item.reportedBy.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "Not authorized to update this item."
            });
        }

        const allowedFields = [
            "name", "category", "description",
            "location", "building", "date",
            "type", "image", "status"
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                item[field] = req.body[field];
            }
        });

        await item.save();

        res.json({
            message: "Item updated successfully!",
            item
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to update item."
        });
    }
});

// Delete an item (owner or admin)
router.delete("/:id", protect, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found."
            });
        }

        if (
            item.reportedBy.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "Not authorized to delete this item."
            });
        }

        await item.deleteOne();

        res.json({
            message: "Item deleted successfully!"
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to delete item."
        });
    }
});

module.exports = router;
