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

schema.index({ name : 1 }); // Indexing
schema.index({ name: -1, code: -1 }); 

const model = mongoose.model("subjects", schema);
module.exports = model;