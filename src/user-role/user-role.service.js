/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose')
const { pathOr } = require('ramda')

const repository = require('../../services/repositoryService')
const UserRoleModel = require('./user-role.model')
const sortingConfig = require('../../config/sort.config')
const { superAdmin } = require('../../config/permissionConfig').userRoles

const { setLimitToPositiveValue } = require('../../services/commonService')
const { includeExcludeFields } = require('../../services/queryService')
const config = require('../../config/config')

module.exports.createUserRole = async (body) => {
    const exisingRole = await repository.findOne(UserRoleModel, {
        role: body.role,
    })

    if (exisingRole) {
        throw new Error(`Role is already defined`)
    }

    const user = new UserRoleModel(body)
    const data = await repository.save(user)
    return data
}

module.exports.updateUserRole = async (body) => {
    const { routes, role, is_allowed, _id } = body
    let deleteRoutes = []
    let updateRoutes = []
    let insertRoutes = []

    if (routes && routes.length > 0) {
        deleteRoutes = routes.filter((r) => r.action === 'delete')
        updateRoutes = routes.filter((r) => r.action === 'update')
        insertRoutes = routes.filter((r) => r.action === 'insert')
    }

    // validate role
    const existingRole = await repository.findOne(UserRoleModel, {
        _id: mongoose.Types.ObjectId(_id),
    })

    if (!existingRole) {
        throw new Error('role not found')
    }

    // valdate the routes on insert
    const exisingRoute = await repository.findOne(UserRoleModel, {
        role,
        'routes.baseRoute': {
            $in: insertRoutes.map((route) => route.baseRoute),
        },
    })

    if (exisingRoute) {
        throw new Error(
            `${exisingRoute.routes
                .map((route) => route.baseRoute)
                .join(' ')} already defined, unable to proceed`
        )
    }

    if (
        existingRole.role !== role ||
        existingRole.is_allowed.toString() !== is_allowed.toString()
    ) {
        await repository.updateOne(
            UserRoleModel,
            {
                _id: mongoose.Types.ObjectId(_id),
            },
            {
                role,
                is_allowed,
            }
        )
    }

    if (updateRoutes.length > 0) {
        const setObj = {}
        const arrayFilter = []

        if (role) {
            setObj.role = role
        }
        if (is_allowed === false || is_allowed === true) {
            setObj.is_allowed = is_allowed
        }
        updateRoutes.forEach((route) => {
            const { _id: routeId, ...rest } = route
            const elemKey = `routes.$[elem${routeId}]`
            setObj[elemKey] = rest
            arrayFilter.push({
                [`elem${routeId}._id`]: mongoose.Types.ObjectId(routeId),
            })
        })

        const query = [
            {
                _id: mongoose.Types.ObjectId(_id),
            },
            {
                $set: setObj,
            },
            {
                arrayFilters: arrayFilter,
                new: true,
            },
        ]

        await repository.updateOne(UserRoleModel, ...query)
    }

    if (insertRoutes.length > 0) {
        const query = [
            {
                _id: mongoose.Types.ObjectId(_id),
            },
            {
                $push: {
                    routes: { $each: insertRoutes },
                },
            },
            {
                new: true,
            },
        ]

        await repository.updateOne(UserRoleModel, ...query)
    }

    if (deleteRoutes.length > 0) {
        const deleteRouteIds = deleteRoutes.map((r) => r._id)
        const query = [
            {
                _id: mongoose.Types.ObjectId(_id),
            },
            {
                $pull: {
                    routes: { _id: deleteRouteIds },
                },
            },
            {
                new: true,
            },
        ]

        await repository.updateOne(UserRoleModel, ...query)
    }

    const returnResult = await repository.findOne(UserRoleModel, {
        _id: mongoose.Types.ObjectId(_id),
    })

    return returnResult
}

module.exports.getUserRoles = async (body) => {
    const { limit, order, page, search, exclude = [], admin } = body

    const column = body.column || -1

    const sortingOrder =
        order === sortingConfig.sortingOrder.descending || !order ? -1 : 1
    const sortingColumn = sortingConfig.sortingColumn.users[column]

    let matchQuery = {
        role: {
            $ne: superAdmin,
        },
    }
    let projectQuery = []
    let recordsTotal
    let usersRoles

    const sortQuery = {
        [sortingColumn]: sortingOrder,
        updated_at: -1,
    }

    if (admin && JSON.parse(admin) === true) {
        matchQuery = {
            ...matchQuery,
            role_type: config.role_types.admin,
        }
    }else{
        matchQuery = {
            ...matchQuery,
            role_type: config.role_types.user,
        }
    }

    const prePaginationQuery = [
        {
            $match: matchQuery,
        },
    ]

    recordsTotal = await repository.findByAggregateQuery(UserRoleModel, [
        ...prePaginationQuery,
        { $count: 'count' },
    ])

    recordsTotal = pathOr(0, [0, 'count'], recordsTotal)

    const pageLimit = setLimitToPositiveValue(limit, recordsTotal)

    if (exclude.length >= 1) {
        projectQuery = [
            {
                $project: includeExcludeFields(exclude, 0),
            },
        ]
    }

    const paginationQuery = [
        { $sort: sortQuery },
        { $skip: page ? pageLimit * (page - 1) : 0 },
        { $limit: +pageLimit || +recordsTotal },
        ...projectQuery,
    ]

    if (!search) {
        usersRoles = await repository.findByAggregateQuery(UserRoleModel, [
            ...prePaginationQuery,
            ...paginationQuery,
        ])
    } else {
        const searchQuery = [
            ...prePaginationQuery,
            {
                $match: {
                    $or: [{ role: { $regex: search, $options: 'i' } }],
                },
            },
        ]

        const data = await repository.findByAggregateQuery(UserRoleModel, [
            {
                $facet: {
                    usersRoles: [...searchQuery, ...paginationQuery],
                    recordsTotal: [...searchQuery, { $count: 'count' }],
                },
            },
        ])

        usersRoles = pathOr([], [0, 'usersRoles'], data)
        recordsTotal = pathOr(0, [0, 'recordsTotal', 0, 'count'], data)
    }

    const recordsFiltered = usersRoles ? usersRoles.length : 0

    return {
        usersRoles,
        recordsTotal,
        recordsFiltered,
    }
}

module.exports.getUserRolesById = async (id) => {
    const matchQuery = {
        _id: mongoose.Types.ObjectId(id),
        role: {
            $ne: superAdmin,
        },
    }

    const userRoles = await repository.findByAggregateQuery(UserRoleModel, [
        {
            $match: matchQuery,
        },
    ])
    return userRoles[0]
}

module.exports.toggleBlock = async (body) => {
    const { _id } = body
    const existingRole = await this.getUserRolesById(_id)
    if (!existingRole) {
        throw new Error('Role not found')
    }
    await this.updateUserRole({
        is_allowed: !existingRole.is_allowed,
        // eslint-disable-next-line object-shorthand
        _id: _id,
        role: existingRole.role,
    })
    return 'success'
}
