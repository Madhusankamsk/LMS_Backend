/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose')
const { pathOr } = require('ramda')

const repository = require('../../services/repositoryService')
const UserModel = require('./user.model')
const nodemailer = require('nodemailer')
const { validatePassword } = require('../../services/password')
const moment = require('moment')
const userConfig = require('../../config/userConfig')
const { userStatus , userRoles} = require("../../config/permissionConfig");

const {
    createUserMail,
    forgotPassword,
    verifyMail,
} = require('../../mails/mails.service')

const {
    generateCode,
    generateEightByteCode,
    generateFourByteCode,
} = require("../../services/generateCode");

module.exports.getUserById = async (id , isFrontendRequest = false) => {
    let user = await repository.findOne(UserModel, {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
    })
    if (isFrontendRequest){
        user = user.toObject()
        delete user.salt
        delete user.password
        delete user.email_verify_code
        delete user.email_verify_code_sent_at
        delete user.password_reset_code
        delete user.password_reset_code_sent_at
        if(user.role === userRoles.techer){
            user.role = "Teacher";
        }
    }
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

module.exports.userEmailVerify = async (body) => {
    const email = body.email
    const user = await this.getUserByEmail(email, false)
    const emailResetCode = generateFourByteCode();

    if (user) {
        //throw new Error('Email is Already Registed')
        if(user.status === userStatus.registed){
            throw new Error('Email is Already Registed')
        }
        const userUpdate = await this.updateUser({
            _id: user._id,
            email_verify_code: emailResetCode,
            email_verify_code_sent_at: new Date(),
        })
        await verifyMail({
            to: user.email,
            email_verify_code: emailResetCode,
            subject: 'Your Email Verify Code',
        })
        return userUpdate;

    } else {
        let newUser = new UserModel(body)
        await repository.save(newUser)

        const userUpdate = await this.updateUser({
            _id: newUser._id,
            email_verify_code: emailResetCode,
            email_verify_code_sent_at: new Date(),
        })

        await verifyMail({
            to: userUpdate.email,
            email_verify_code: emailResetCode,
            subject: 'Your Email Verify Code',
        })

        return userUpdate;

    }
}

module.exports.userEmailVerifyWithCode = async (body) => {
    const user = await this.getUserById(body._id, false)

    if (!user) {
        throw new Error('user not found')
    } else if (user.status === userStatus.registed) {
        throw new Error('Email is Already Registed')
    }

    if (body.email_verify_code !== user.email_verify_code) {
        throw new Error('Invalid reset code.')
    }

    if (
        new Date(user.email_verify_code_sent_at) <
        moment()
            .subtract(userConfig.passwordResetCodeExpireDuration, 'minutes')
            .toDate()
    ) {
        throw new Error('Reset code expired.')
    }

    const userUpdate = await this.updateUser({
        _id: user._id,
        status: userStatus.confirmed
    })

    return userUpdate
}

module.exports.createUser = async (body) => {
    const existingUser = await this.getUserById(body._id, false)

    if (!existingUser) {
        throw new Error('User Not Found')
    } 
    else {
        if (existingUser.status === userStatus.notConfirmed) {
            throw new Error('Email is Not Verify')
        } 

        if (existingUser.status === userStatus.registed) {
            throw new Error('Email is Already Registed')
        }
        else if (existingUser.status === userStatus.confirmed) {
            const existingPhone = await this.getUserByPhoneNumber(body.phone, false)
            if (existingPhone && existingPhone._id.toString() !== existingUser._id.toString()) {
                console.log(existingPhone._id )
                console.log(existingUser._id)
                throw new Error('Phone number already exists.')
            }

            let userUpdate = await this.updateUser({
                _id: body._id,
                first_name: body.first_name,
                last_name: body.last_name,
                phone: body.phone,
                password: body.password,
                status: userStatus.registed
            })
        
            const fullName = userUpdate.first_name + " " + userUpdate.last_name;
        
            await createUserMail({
                name: fullName,
                to: userUpdate.email,
                new_password: body.password,
                subject: 'Congratulations! Your account has been created',
            })
        
            return userUpdate
        }
    } 
}

module.exports.loginUser = async (body) => {
    let user = await this.getUserByEmail(body.email, false)
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
            user = user.toObject()

            delete user.password
            delete user.salt
            delete user.role

            return user
        }
        throw new Error(invalidEmailOrPassword)
    } else {
        throw new Error(invalidEmailOrPassword)
    }
}

module.exports.updateUser = async (body) => {
    const user = await this.getUserById(body._id)

    if (!user) throw new Error('Invalid user id')

    // Email validation
    if (body.email) {
        const userByEmail = await this.getUserByEmail(body.email, false)

        if (userByEmail && userByEmail._id.toString() !== body._id) {
            throw new Error('Email already exists.')
        }
    }

    // Phone number validation
    if (body.phone) {
        const userByPhone = await this.getUserByPhoneNumber(body.phone, false)

        if (userByPhone && userByPhone._id.toString() !== body._id) {
            throw new Error('Phone Number is already exists.')
        }
    }

    // Check if password needs to be updated
    if (body.password) {
        user.setPassword(body.password);
        body.password = user.password;
        body.salt = user.salt;
    }

    userUpdated = await repository.updateOne(
        UserModel,
        {
            _id: new mongoose.Types.ObjectId(body._id),
        },
        body,
        {
            new: true,
        }
    )

    userUpdated = userUpdated.toObject()
    delete userUpdated.salt
    delete userUpdated.password
    delete userUpdated.email_verify_code
    delete userUpdated.email_verify_code_sent_at
    delete userUpdated.password_reset_code
    delete userUpdated.password_reset_code_sent_at
    if(user.role === userRoles.techer){
        userUpdated.role = "Teacher"
    }

    return userUpdated
}

module.exports.userForgotPasswordEmail = async (body) => {
    const email = body.email
    const user = await this.getUserByEmail(email, false)

    if (!user) {
        throw new Error('invalid email')
    }

    const passwordRestCode = generateFourByteCode();

    await this.updateUser({
        _id: user._id,
        password_reset_code: passwordRestCode,
        password_reset_code_sent_at: new Date(),
    })

    const fullName = user.first_name + " " + user.last_name;

    await forgotPassword({
        name: fullName,
        to: user.email,
        password_reset_code: passwordRestCode,
        subject: 'Your password reset code',
    })

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

    await repository.save(user);

    let userToReturn = user.toObject()
    delete userToReturn.salt
    delete userToReturn.password
    delete userToReturn.role
    delete userToReturn.email_verify_code
    delete userToReturn.email_verify_code_sent_at
    delete userToReturn.password_reset_code
    delete userToReturn.password_reset_code_sent_at

    return userToReturn;
}





// module.exports.userPasswordReset = async (body) => {
//     const user = await this.getUserById({
//         id: body._id,
//     })

//     if (!user) {
//         throw new Error('user not found')
//     }

//     user.setPassword(body.password)
//     await repository.save(user)

//     return 'success'
// }



