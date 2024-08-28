const mongoose = require('mongoose')
const Config = require('../../config/config')
const { studentAnswers } = require("../../config/permissionConfig");


const schema = new mongoose.Schema(
    {
        paper_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "papers",
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        student_link: {
            type: String,
        },
        mark: {
            type: Number,
        },
        student_answer_time: {
            type: String,
        },
        feedback: {
            type: String,
        },
        status: {
            type: String,
            default: studentAnswers.toDo,
            trim: true,
        },
        is_active: {
            type: Boolean,
            default: true,
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
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

schema.index({ title: 1 }) // Indexing

const model = mongoose.model('paper-enrolls', schema)
module.exports = model