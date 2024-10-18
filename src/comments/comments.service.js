const mongoose = require('mongoose')
const { pathOr } = require('ramda')

const repository = require('../../services/repositoryService')
const CommentModel = require('./comments.model')
const sortingConfig = require('../../config/sort.config')
const { superAdmin } = require('../../config/permissionConfig').userRoles

const { setLimitToPositiveValue } = require('../../services/commonService')
const { includeExcludeFields } = require('../../services/queryService')
const paperService = require('../paper/paper.service')
const userService = require('../user/user.service')

module.exports.getCommentById = async (id) => {
    const comment = await repository.findOne(CommentModel, {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
    })
    return comment
}

module.exports.getComments = async (body) => {
    const {
        limit,
        order,
        page,
        search,
        paper_id,
        exclude = [],
    } = body
    const column = body.column || -1

    const sortingOrder =
        order === sortingConfig.sortingOrder.descending || !order ? -1 : 1
    const sortingColumn = sortingConfig.sortingColumn.update_at[column];

    let matchQuery = {
        is_deleted: {
            $ne: true,
        },
    };
    
    let projectQuery = []
    let recordsTotal
    let comments

    const sortQuery = {
        [sortingColumn]: sortingOrder,
        updated_at: -1,
    }
    
    if (paper_id) {
        matchQuery = {
            ...matchQuery,
            'paper_id': new mongoose.Types.ObjectId(paper_id),
        }
    }

    const prePaginationQuery = [
        {
            $match: matchQuery,
        },
    ]

    const combinedQuery = [
        {
            $lookup: {
                from: 'papers',
                let: { paperID: '$paper_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$paperID'] },
                        },
                    },
                    {
                        $project: {
                            name: 1,
                        },
                    },
                ],
                as: 'paper',
            },
        },
        {
            $addFields: {
                paper: {
                    $arrayElemAt: ['$paper', 0],
                },
            },
        },
        {
            $lookup: {
                from: 'users',
                let: { userID: '$user_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$userID'] },
                        },
                    },
                    {
                        $project: {
                            profile_picture: 1,
                            first_name: 1,
                            last_name: 1,
                        },
                    },
                ],
                as: 'user',
            },
        },
        {
            $addFields: {
                user: {
                    $arrayElemAt: ['$user', 0],
                },
            },
        },
    ];

    recordsTotal = await repository.findByAggregateQuery(CommentModel, [
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
        comments = await repository.findByAggregateQuery(CommentModel, [
            ...prePaginationQuery,
            ...paginationQuery,
            ...combinedQuery,
        ])
    } else {
        const searchQuery = [
            ...prePaginationQuery,
            ...combinedQuery,
            {
                $match: {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { 'paper.name': { $regex: search, $options: "i" } },
                        { 'paper.description': { $regex: search, $options: "i" } },
                    ],
                },
            },
        ]

        const data = await repository.findByAggregateQuery(CommentModel, [
            {
                $facet: {
                    comments: [...searchQuery, ...paginationQuery],
                    recordsTotal: [...searchQuery, { $count: 'count' }],
                },
            },
        ])
        comments = pathOr([], [0, 'comments'], data)
        recordsTotal = pathOr(0, [0, 'recordsTotal', 0, 'count'], data)
    }

    const recordsFiltered = comments ? comments.length : 0

    return {
        comments,
        recordsTotal,
        recordsFiltered,
    }
}

module.exports.createComment = async (body) => {
    const existingPaper = await paperService.getPaperById(body.paper_id);
    if (!existingPaper) {
        throw new Error('Paper ID not valid!!!');
    }

    const existingUser = await userService.getUserById(body.user_id);
    if (!existingUser) {
        throw new Error('User ID not valid!!!');
    }

    const newCommentToSave = new CommentModel(body);
    const saveResult = await repository.save(newCommentToSave);
    return saveResult;
}

module.exports.updateComment = async (body) => {
    const existingComment = await this.getCommentById(body._id);
    if (!existingComment) throw new Error('Invalid comment ID!!!');
    if (body.paper_id) {
        const existingPaper = await paperService.getPaperById(body.paper_id);
        if (!existingPaper) {
            throw new Error('Paper ID not valid!!!');
        }
    }

    if (body.user_id) {
        const existingUser = await userService.getUserById(body.user_id);
        if (!existingUser) {
            throw new Error('User ID not valid!!!');
        }

        if (body.user_id !== existingComment.user_id.toString()) {
            throw new Error('You are not allowed to update this comment!!!');
        }
    }

    let commentToUpdate = await repository.updateOne(
        CommentModel,
        {
            _id: body._id,
        },
        body,
        {
            new: true,
        }
    );
    commentToUpdate = commentToUpdate.toObject();
    return commentToUpdate;
}

module.exports.deleteComment = async (id) => {
    const existingComment = await this.getCommentById(id.toString());
    if (!existingComment) throw new Error('Invalid comment ID!!!');

    const commentToDelete = await repository.updateOne(
        CommentModel,
        {
            _id: new mongoose.Types.ObjectId(id),
        },
        {
            $set: {
                is_deleted: true,
                delete_date: new Date(),
            },
        },
        {
            new: true,
        }
    )

    return commentToDelete
}