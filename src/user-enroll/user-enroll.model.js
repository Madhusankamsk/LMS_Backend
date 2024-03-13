const mongoose = require("mongoose");

// create schema
const schema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        course: {
            type: [
                {
                    id: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: true,
                    },
                },
            ],
        },
        paper: {
            type: [
                {
                    id: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: true,
                    },
                },
            ],
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
        delete_date: {
            type: Date,
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

schema.index({ user_id: 1, }); // Indexing

// create modal
const model = mongoose.model("user_enroll", schema);
module.exports = model;