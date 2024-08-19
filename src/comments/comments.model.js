const mongoose = require('mongoose')
const Config = require('../../config/config')

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
        comment: {
            type: String,
            required: true,
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

schema.index({ title: 1 })

const model = mongoose.model('comments', schema)
module.exports = model