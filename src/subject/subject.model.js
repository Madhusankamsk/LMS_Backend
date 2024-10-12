const mongoose = require("mongoose");

// create schema
const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        is_active: {
            type: Boolean,
            required : true,
            default: true
        },
        inactive_date: {
            type: Date,
            default: null,
        },
        is_deleted: {
            type: Boolean,
            required : true,
            default: false,
        },
        delete_date: {
            type: Date,
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

schema.index({ name: 1 }); // Indexing for ascending order of subject name

const model = mongoose.model("subjects", schema);
module.exports = model;