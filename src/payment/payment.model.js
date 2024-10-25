const mongoose = require('mongoose')
const Config = require('../../config/config')
const { payments } = require("../../config/permissionConfig");

const schema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        image_link: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
        },
        status: {
            type: String,
            default: payments.toDoPayment,
            required: true,
        },
        submit_date: {
            type: Date,
            required: true,
            default: Date.now
        },
        transfer_date: {
            type: Date,
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

schema.index({ createdAt: -1 })

const model = mongoose.model('payments', schema)
module.exports = model