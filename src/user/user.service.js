/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose')
const { pathOr } = require('ramda')

const repository = require('../../services/repositoryService')
const UserModel = require('./user.model')
const nodemailer = require('nodemailer')
const { validatePassword } = require('../../services/password')

const {
    createUserMail,
} = require('../../mails/mails.service')

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

module.exports.getUserByEmailWithRole = async (email, filterActive = true) => {
    const filter = {
        email: { $eq: email },
        is_active: true,
        is_deleted: false,
    }

    if (!filterActive) delete filter.is_active

    const user = await repository.findByAggregateQuery(UserModel, [
        {
            $match: filter,
        },
        // {
        //     $lookup: {
        //         from: 'user_roles',
        //         localField: 'role',
        //         foreignField: '_id',
        //         as: 'user_role',
        //     },
        // },
        // {
        //     $addFields: {
        //         user_role: { $arrayElemAt: ['$user_role', 0] },
        //         role: { $arrayElemAt: ['$user_role.role', 0] },
        //     },
        // },
    ])

    return user[0]
}

module.exports.createUser = async (body) => {
    const existingUser = await this.getUserByEmail(body.email, false)
    if (existingUser) {
        throw new Error('Email already exists.')
    }

    const existingPhone = await this.getUserByPhoneNumber(body.phone, false)
    if (existingPhone) {
        throw new Error('Phone number already exists.')
    }

    let newUser = new UserModel(body)
    newUser.setPassword(body.password)
    await repository.save(newUser)
    console.log("6");

    newUser = newUser.toObject()

    const fullName = newUser.first_name + " " + newUser.last_name;
    
    await createUserMail({
        name: fullName,
        to: newUser.email,
        new_password: newUser.password,
        subject: 'Congratulations! Your account has been created',
    })

    delete newUser.password
    delete newUser.salt
    delete newUser.role

   

    
    console.log(newUser);

    return newUser
}


module.exports.loginUser = async (body) => {
    const user = await this.getUserByEmailWithRole(body.email, false)
    const invalidEmailOrPassword = 'Invalid username or password.'

    if (user) {
        if (!user.is_active) {
            throw new Error(
                'Your account has been blocked by the system administrator'
            )
        }
        const passwordValidity = validatePassword(
            body.password,
            user.password,
            user.salt
        )

        // Valid password
        if (passwordValidity) {
            delete user.password
            delete user.salt

            return user
        }
        throw new Error(invalidEmailOrPassword)
    } else {
        throw new Error(invalidEmailOrPassword)
    }
}

module.exports.userForgotPasswordEmail = async (body) => {
    const email = body.email
    const user = await this.getUserByEmail(email, false)

    if (!user) {
        throw new Error('invalid email')
    }

    const uuid = uuidv4()

    await this.updateUser({
        _id: user._id,
        password_reset_code: uuid,
        password_reset_code_sent_at: new Date(),
    })

    // await forgotPasswordMail({
    //     name: user.name,
    //     to: user.email,
    //     password_reset_code: uuid,
    //     subject: 'Your password reset code',
    // })

    return 'success'
}

module.exports.userForgotPasswordReset = async (body) => {
    const user = await this.getUserByEmail(body.email, false)

    if (!user) {
        throw new Error('user not found')
    }

    if (body.password_reset_code !== user.password_reset_code) {
        throw new Error('Invalid reset code.')
    }

    if (
        new Date(user.password_reset_code_sent_at) <
        moment()
            .subtract(userConfig.passwordResetCodeExpireDuration, 'minutes')
            .toDate()
    ) {
        throw new Error('Reset code expired.')
    }

    user.setPassword(body.password)
    await repository.save(user)

    return 'success'
}

module.exports.userPasswordReset = async (body) => {
    const user = await this.getUserById({
        id: body._id,
    })

    if (!user) {
        throw new Error('user not found')
    }

    user.setPassword(body.password)
    await repository.save(user)

    return 'success'
}