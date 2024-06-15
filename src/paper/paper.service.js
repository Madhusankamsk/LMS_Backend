/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose')
const { pathOr } = require('ramda')

const repository = require('../../services/repositoryService')
const PaperModel = require('./paper.model')
const sortingConfig = require('../../config/sort.config')
const { superAdmin } = require('../../config/permissionConfig').userRoles

const { setLimitToPositiveValue } = require('../../services/commonService')
const { includeExcludeFields } = require('../../services/queryService')
const config = require('../../config/config')

module.exports.getPaperById = async (id) => {
    const city = await repository.findOne(PaperModel, {
        _id: new mongoose.Types.ObjectId(id),
    })
    return city
}

module.exports.createPaper = async (body) => {
    const paper = new PaperModel(body)
    const data = await repository.save(paper)
    return data
}

module.exports.updatePaper = async (body) => {
    const existingPaper = await this.getPaperById(body._id);
    if (!existingPaper) throw new Error('Invalid news id');
    let paperUpdate = await repository.updateOne(
        PaperModel,
        {
            _id: body._id,
        },
        body,
        {
            new: true,
        }
    );
    paperUpdate = paperUpdate.toObject();
    return paperUpdate;
}

module.exports.getPaper = async (body) => {
    const { limit, order, page, search, exclude = [], admin } = body

    const column = body.column || -1

    const sortingOrder =
        order === sortingConfig.sortingOrder.descending || !order ? -1 : 1
    const sortingColumn = sortingConfig.sortingColumn.papers[column]

    let matchQuery = {
        role: {
            $ne: is_deleted,
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

