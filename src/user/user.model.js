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
        profile_picture: {
            type: String,
        },
        phone: {
            type: String,
            trim: true,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        salt: {
            type: String,
            required: true,
        },
        address: {
            type: String,
        },
        school: {
            type: String,
        },
        grade: {
            type: String,
        },
        role: {
            type: String,
            default: "Student",
            required: true,
        },
        status: {
            type: String,
            default: userStatus.notConfirmed,
            trim: true,
        },
        is_active: {
            type: Boolean,
            required: true,
            default: true,
        },
        is_deleted: {
            type: Boolean,
            required: true,
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
    this.salt = crypto.randomBytes(16).toString("hex");
    this.password = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
        .toString("hex");
}

schema.index({ email: 1, school: 1 }); // Indexing

// create modal
const model = mongoose.model("users", schema);
module.exports = model;














