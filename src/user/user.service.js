const UserModel = require('./user.model')
const { getUserRolesById } = require('../user-role/user-role.service')

module.exports.getUserById = async (body) => {
    const user = await repository.findOne(UserModel, {
        _id: mongoose.Types.ObjectId(body.id),
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
    const existingUser = await this.getUserByEmail(body.email, false)
    if (existingUser) {
        throw new Error('Email already exists.')
    }

    const existingNic = await this.getUserByNic(body.nic, false)
    if (existingNic) {
        throw new Error('Nic number already exists.')
    }

    const existingPhone = await this.getUserByPhoneNumber(body.phone, false)
    if (existingPhone) {
        throw new Error('Phone number already exists.')
    }

    const exisingRole = await getUserRolesById(body.role)
    if (!exisingRole) {
        throw new Error('invalid role')
    }

    if (!exisingRole.is_allowed) {
        throw new Error('This role has been disabled ')
    }
    const password = generator.generate({
        length: 10,
        numbers: true,
    })

    let newUser = new UserModel(body)
    newUser.setPassword(password)
    // console.log(newUser);
    await repository.save(newUser)

    newUser = newUser.toObject()
    delete newUser.password

    await createUserMail({
        name: newUser.name,
        to: newUser.email,
        new_password: password,
        subject: 'Congratulations! Your account has been created',
    })

    return newUser
}