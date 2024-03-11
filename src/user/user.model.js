const mongoose = require("mongoose");
const crypto = require("crypto");
const { userStatus } = require("../../config/permissionConfig");

// create schema
const schema = new mongoose.Schema(
    {
        email: {
            type: String,
            lowercase: true,
            trim: true,
            required: true,
        },
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
            required: true,
        },
        birthday: {
            type: Date,
        },
        profile_picture: {
            type: String,
        },
        phone: {
            type: String,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        is_first_time: {
            type: Boolean,
            default: true,
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
        school: {
            type: String,
        },
        Shy: {
            type: String,
        },
        grade: {
            type: String,
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_role",
            required: true,
        },
        status: {
            type: String,
            default: userStatus.notConfirmed,
            trim: true,
        },
        is_active: {
            type: Boolean,
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
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

schema.methods.validatePassword = function (password) {
    const salt = this.password.split('$')[0]; 
    const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 512, "sha512")
        .toString("hex");
    return this.password === hash;
};

schema.methods.setPassword = function (password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 512, "sha512")
        .toString("hex");
    this.password = `${salt}$${hash}`;
}

schema.index({ email: 1, school: 1 }); // Indexing

// create modal
const model = mongoose.model("user", schema);
module.exports = model;














