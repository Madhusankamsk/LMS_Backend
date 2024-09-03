/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose')
const { pathOr } = require('ramda')

const repository = require('../../services/repositoryService')
const PaperEnrollModel = require('./paper-enroll.model')
const sortingConfig = require('../../config/sort.config')
const { superAdmin } = require('../../config/permissionConfig').userRoles

const { setLimitToPositiveValue } = require('../../services/commonService')
const { includeExcludeFields } = require('../../services/queryService')
const subjectService = require('../subject/subject.service');
const categoryService = require('../categories/category.service');
const folderService = require('../folder/folder.service');
const userService = require('../user/user.service');
const paperService = require('../paper/paper.service');

module.exports.getEnrollPaperById = async (id) => {
    const enrollPaper = await repository.findOne(PaperEnrollModel, {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
    })
    return enrollPaper
}

module.exports.getEnrollPaperByStudentIdWithPaperID = async (paperId, userId) => {
    const enrollPaper = await repository.findOne(PaperEnrollModel, {
        paper_id: new mongoose.Types.ObjectId(paperId),
        user_id: new mongoose.Types.ObjectId(userId),
    })
    return enrollPaper
}

module.exports.getEnrollPapers = async (body) => {
    const {
        limit,
        order,
        page,
        search,
        paper_id,
        exclude = [],
    } = body;
    const column = body.column || -1;

    const sortingOrder = order === sortingConfig.sortingOrder.descending || !order ? -1 : 1;
    const sortingColumn = sortingConfig.sortingColumn.update_at[column];

    let matchQuery = {
        is_deleted: {
            $ne: true,
        },
    };

    let projectQuery = [];
    let recordsTotal;
    let enrollPapers;

    const sortQuery = {
        [sortingColumn]: sortingOrder,
        updated_at: -1,
    };

    if (paper_id) {
        const existingPaper = await paperService.getPaperById(paper_id);

        if (existingPaper) {
            matchQuery = {
                ...matchQuery,
                'paper_id': new mongoose.Types.ObjectId(paper_id),
            };
        } else {
            throw new Error('Invalid paper _id');
        }
    }


const prePaginationQuery = [
    {
        $match: matchQuery,
    },
];

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
                        title: 1,
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
                        email: 1,
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

recordsTotal = await repository.findByAggregateQuery(PaperEnrollModel, [
    ...prePaginationQuery,
    { $count: 'count' },
]);

recordsTotal = recordsTotal[0]?.count || 0;
const pageLimit = setLimitToPositiveValue(limit, recordsTotal);

if (exclude.length >= 1) {
    projectQuery = [
        {
            $project: includeExcludeFields(exclude, 0),
        },
    ];
}

const paginationQuery = [
    { $sort: sortQuery },
    { $skip: page ? pageLimit * (page - 1) : 0 },
    { $limit: +pageLimit || +recordsTotal },
    ...projectQuery,
];

if (!search) {
    enrollPapers = await repository.findByAggregateQuery(PaperEnrollModel, [
        ...prePaginationQuery,
        ...paginationQuery,
        ...combinedQuery,
    ]);
} else {
    const searchQuery = [
        ...prePaginationQuery,
        ...combinedQuery,
        {
            $match: {
                $or: [
                    { mark: { $regex: search, $options: 'i' } },
                    { 'user.email': { $regex: search, $options: 'i' } },
                ],
            },
        },
    ];

    const data = await repository.findByAggregateQuery(PaperEnrollModel, [
        {
            $facet: {
                papers: [...searchQuery, ...paginationQuery],
                recordsTotal: [...searchQuery, { $count: 'count' }],
            },
        },
    ]);
    enrollPapers = data[0]?.papers || [];
    recordsTotal = data[0]?.recordsTotal[0]?.count || 0;
}

const recordsFiltered = enrollPapers ? enrollPapers.length : 0;

return {
    enrollPapers,
    recordsTotal,
    recordsFiltered,
};
};

module.exports.createEnrollPaper = async (body) => {
    const existingPaper = await paperService.getPaperById(body.paper_id);
    if (!existingPaper) {
        throw new Error('Paper id not valid!');
    }

    const existingUser = await userService.getUserById(body.user_id);
    if (!existingUser) {
        throw new Error('User id not valid!');
    }

    const existinePaperEnroll = await this.getEnrollPaperByStudentIdWithPaperID(body.paper_id, body.user_id);
    if (existinePaperEnroll) {
        throw new Error('User already enroll to this paper!');
    }

    if(existingUser.price < existingPaper.price){
        throw new Error('User amount is not enough to buy this paper!');
    }

    const existingTeacher = await userService.getUserById(existingPaper.teacher_id);
    const newUserPrice = existingUser.price - existingPaper.price;
    const newTeacherPrice = existingTeacher.price + existingPaper.price;

    await userService.updateUser({
        _id: body.user_id,
        price: newUserPrice,
    })

    await userService.updateUser({
        _id: existingTeacher._id,
        price: newTeacherPrice,
    })

    const newEnrollPaperToSave = new PaperEnrollModel(body);
    const saveResult = await repository.save(newEnrollPaperToSave);
    return saveResult;
}

module.exports.updateEnrollPaper = async (body) => {
    const existingPaper = await this.getEnrollPaperById(body._id);
    if (!existingPaper) throw new Error('Invalid paper-enroll _id');
    if (body.paper_id) {
        const existingPaper = await paperService.getPaperById(body.paper_id);
        if (!existingPaper) {
            throw new Error('Paper id not valid!');
        }
    }

    if (body.user_id) {
        const existingUser = await userService.getUserById(body.user_id);
        if (!existingUser) {
            throw new Error('User id not valid!');
        }
    }

    let enrollPaperToUpdate = await repository.updateOne(
        PaperEnrollModel,
        {
            _id: body._id,
        },
        body,
        {
            new: true,
        }
    );
    enrollPaperToUpdate = enrollPaperToUpdate.toObject();
    return enrollPaperToUpdate;
}

module.exports.deleteEnrollPaper = async (id) => {
    const existingEnrollPaper = await this.getEnrollPaperById(id.toString());
    if (!existingEnrollPaper) throw new Error('Invalid paper enroll _id');

    const enrollPaperToDelete = await repository.updateOne(
        PaperEnrollModel,
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

    return enrollPaperToDelete
}

