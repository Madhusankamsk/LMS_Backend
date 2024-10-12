const mongoose = require("mongoose");

// create schema
const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        subject_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subjects",
            required: true,
        },
        has_folder: {
            type: Boolean,
            required : true,
            default: false,
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

schema.index({ name : 1 }); 

const model = mongoose.model("categories", schema);
module.exports = model;