/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose')
const { pathOr } = require('ramda')

const repository = require('../../services/repositoryService')
const UserModel = require('./user.model')
const nodemailer = require('nodemailer')
// import nodemailer from "nodemailer";

// const {
//     createUserMail,
// } = require('../../mails/mails.service')

module.exports.getUserById = async (id) => {
    console.log(id);
    const user = await repository.findOne(UserModel, {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
    })
    return user
}

module.exports.getUserByEmail = async (email, filterActive = true) => {
    const filter = {
        email: { $eq: email },
        is_active: true,
        is_deleted: false,
    }

    if (!filterActive) delete filter.is_active

    return repository.findOne(UserModel, filter)
}

module.exports.getUserByIDWithRole = async (id) => {
    const filter = {
        _id: mongoose.Types.ObjectId(id),
    }

    const user = await repository.findByAggregateQuery(UserModel, [
        {
            $match: filter,
        },
        {
            $lookup: {
                from: 'user_roles',
                localField: 'role',
                foreignField: '_id',
                as: 'user_role',
            },
        },
        {
            $addFields: {
                role: { $arrayElemAt: ['$user_role.role', 0] },
                user_role: { $arrayElemAt: ['$user_role', 0] },
            },
        },
    ])

    return user[0]
}

module.exports.getUserByNic = async (nic, filterActive = true) => {
    const filter = {
        nic: { $eq: nic },
        is_active: true,
        is_deleted: false,
    }

    if (!filterActive) delete filter.is_active

    return repository.findOne(UserModel, filter)
}

module.exports.getUserByPhoneNumber = async (phone, filterActive = true) => {
    const filter = {
        phone: { $eq: phone },
        is_active: true,
        is_deleted: false,
    }

    if (!filterActive) delete filter.is_active

    return repository.findOne(UserModel, filter)
}

module.exports.createUser = async (body) => {
    console.log("1");
    const existingUser = await this.getUserByEmail(body.email, false)
    if (existingUser) {
        throw new Error('Email already exists.')
    }
    console.log("2");

    const existingPhone = await this.getUserByPhoneNumber(body.phone, false)
    if (existingPhone) {
        throw new Error('Phone number already exists.')
    }
    console.log("3");

    // const exisingRole = await getUserRolesById(body.role)
    // if (!exisingRole) {
    //     throw new Error('invalid role')
    // }
    // console.log("4");

    // if (!exisingRole.is_allowed) {
    //     throw new Error('This role has been disabled ')
    // }
    // console.log("5");

    console.log("body password: " + body.password);

    let newUser = new UserModel(body)
    newUser.setPassword(body.password)
    await repository.save(newUser)
    console.log("6");

    
    newUser = newUser.toObject()
    delete newUser.password
    delete newUser.salt
    console.log("7");

    const fullName = newUser.first_name + " " + newUser.last_name;
    console.log("8");

    // await createUserMail({
    //     name: fullName,
    //     to: newUser.email,
    //     new_password: password,
    //     subject: 'Congratulations! Your account has been created',
    // })
    console.log(newUser);

    return newUser
}