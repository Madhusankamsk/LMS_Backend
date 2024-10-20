/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose')
const { pathOr } = require('ramda')

const repository = require('../../services/repositoryService')
const FolderModel = require('./folder.model')
const sortingConfig = require('../../config/sort.config')
const { superAdmin } = require('../../config/permissionConfig').userRoles

const { setLimitToPositiveValue } = require('../../services/commonService')
const { includeExcludeFields } = require('../../services/queryService')
const subjectService = require('../subject/subject.service');
const categoryService = require('../categories/category.service');
const paperService = require('../paper/paper.service');
const userService = require('../user/user.service');

module.exports.getFolderById = async (id) => {
    const folder = await repository.findOne(FolderModel, {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
    })
    return folder
}

module.exports.getFolders = async (body) => {
    const {
        limit,
        order,
        page,
        search,
        category_id,
        exclude = [],
    } = body
    const column = body.column || -1

    const sortingOrder =
        order === sortingConfig.sortingOrder.descending || !order ? -1 : 1
    const sortingColumn = sortingConfig.sortingColumn.name[column];

    let matchQuery = {
        is_deleted: {
            $ne: true,
        },
    };

    let projectQuery = []
    let recordsTotal
    let folders

    const sortQuery = {
        [sortingColumn]: sortingOrder,
        name: 1,
    }

    if (category_id) {
        matchQuery = {
            ...matchQuery,
            'category_id': new mongoose.Types.ObjectId(category_id),
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
                from: 'subjects',
                let: { subjectID: '$subject_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$subjectID'] },
                        },
                    },
                    {
                        $project: {
                            name: 1,
                            code: 1,
                        },
                    },
                ],
                as: 'subject',
            },
        },
        {
            $addFields: {
                subject: {
                    $arrayElemAt: ['$subject', 0],
                },
            },
        },
        {
            $lookup: {
                from: 'categories',
                let: { categoryID: '$category_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$categoryID'] },
                        },
                    },
                    {
                        $project: {
                            name: 1,
                        },
                    },
                ],
                as: 'category',
            },
        },
        {
            $addFields: {
                category: {
                    $arrayElemAt: ['$category', 0],
                },
            },
        },
    ];

    recordsTotal = await repository.findByAggregateQuery(FolderModel, [
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
        folders = await repository.findByAggregateQuery(FolderModel, [
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
                        { 'subject.name': { $regex: search, $options: "i" } },
                        { 'subject.code': { $regex: search, $options: "i" } },
                        { 'category.name': { $regex: search, $options: "i" } },
                    ],
                },
            },
        ]

        const data = await repository.findByAggregateQuery(FolderModel, [
            {
                $facet: {
                    folders: [...searchQuery, ...paginationQuery],
                    recordsTotal: [...searchQuery, { $count: 'count' }],
                },
            },
        ])
        folders = pathOr([], [0, 'folders'], data)
        recordsTotal = pathOr(0, [0, 'recordsTotal', 0, 'count'], data)
    }

    const recordsFiltered = folders ? folders.length : 0

    return {
        folders,
        recordsTotal,
        recordsFiltered,
    }
}

module.exports.createFolder = async (body) => {
    const existingSubject = await subjectService.getSubjectById(body.subject_id);
    if (!existingSubject) {
        throw new Error('Subject ID not valid!!!');
    }

    const existingCategory = await categoryService.getCategoryById(body.category_id);
    if (!existingCategory) {
        throw new Error('Category ID not valid!!!');
    }

    if(!existingCategory.has_folder){
        throw new Error('This category type does not support folders!!!');
    }

    const newFoderToSave = new FolderModel(body);
    const saveResult = await repository.save(newFoderToSave);
    return saveResult;
}

module.exports.updateFolder = async (body) => {
    const existingPaper = await this.getFolderById(body._id);
    if (!existingPaper) throw new Error('Invalid folder ID!!!');
    if (body.subject_id) {
        const existingSubject = await subjectService.getSubjectById(body.subject_id);
        if (!existingSubject) {
            throw new Error('Subject ID not valid!!!');
        }
    }

    if (body.category_id) {
        const existingCategory = await categoryService.getCategoryById(body.category_id);
        if (!existingCategory) {
            throw new Error('Category ID not valid!!!');
        }
    }

    let folderToUpdate = await repository.updateOne(
        FolderModel,
        {
            _id: body._id,
        },
        body,
        {
            new: true,
        }
    );
    folderToUpdate = folderToUpdate.toObject();
    return folderToUpdate;
}

module.exports.toggleFolder = async (id) => {
    const existingPaper = await this.getPaperById(id.toString());
    if (!existingPaper) throw new Error('Invalid paper ID!!!');

    if (existingPaper.is_active) {
        const paperToToggle = await repository.updateOne(
            FolderModel,
            {
                _id: new mongoose.Types.ObjectId(id),
            },
            {
                $set: {
                    is_active: false,
                    inactive_date: new Date(),
                },
            },
            {
                new: true,
            }
        )
        return paperToToggle
    } else {
        const paperToToggle = await repository.updateOne(
            FolderModel,
            {
                _id: new mongoose.Types.ObjectId(id),
            },
            {
                $set: {
                    is_active: true,
                    inactive_date: null,
                },
            },
            {
                new: true,
            }
        )
        return paperToToggle
    }
}

module.exports.deleteFolder = async (id) => {
    const existingFolder = await this.getFolderById(id.toString());
    if (!existingFolder) throw new Error('Invalid folder ID!!!');

    const existingPaper = await paperService.getPaperByFolderId(id.toString());
    if (existingPaper) throw new Error('This folder has papers!!!');

    const paperToDelete = await repository.updateOne(
        FolderModel,
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

    return paperToDelete
}

