const mongoose = require('mongoose')
const Config = require('../../config/config')

const schema = new mongoose.Schema(
    {
        role: {
            type: String,
            required: true,
        },
        role_type: {
            type: String,
            enum: Object.values(Config.role_types),
            default: Config.role_types.student,
            required: true,
        },
        routes: {
            type: [
                {
                    baseRoute: {
                        type: String,
                        required: true,
                    },
                    is_allowed: {
                        type: Boolean,
                        required: true,
                        default: true,
                    },
                    submit_button_actions: {
                        type: [
                            {
                                name: {
                                    type: String,
                                    required: true,
                                },
                                index: {
                                    type: Number,
                                    required: true,
                                },
                                is_allowed: {
                                    type: Boolean,
                                    default: true,
                                    required: true,
                                },
                            },
                        ],
                    },
                },
            ],
            required: true,
        },
        is_allowed: {
            type: Boolean,
            required: true,
            default: true,
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
        delete_date: {
            type: Date,
        },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

schema.index({ role: 1 }) // Indexing

const model = mongoose.model('user_roles', schema)
module.exports = model