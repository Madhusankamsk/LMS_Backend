/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose')
const { pathOr } = require('ramda')

const repository = require('../../services/repositoryService')
const PaperModel = require('./folder.model')
const sortingConfig = require('../../config/sort.config')
const { superAdmin } = require('../../config/permissionConfig').userRoles

const { setLimitToPositiveValue } = require('../../services/commonService')
const { includeExcludeFields } = require('../../services/queryService')
const subjectService = require('../subject/subject.service');
const categoryService = require('../categories/category.service');
const userService = require('../user/user.service');

// module.exports.togglePapersBySubject = async (subject_id, SubjectInactiveDate) => {
//     const existingSubject = await subjectService.getSubjectById(subject_id);
//     if (!existingSubject) throw new Error('Invalid subject _id');

//     if(existingSubject.is_active){
//         const papersToToggle = await repository.updateMany(
//             PaperModel,
//             {
//                 subject_id: new mongoose.Types.ObjectId(subject_id),
//                 inactive_date: SubjectInactiveDate,
//             },
//             {
//                 $set: {
//                     is_active: true,
//                     inactive_date: null,
//                 },
//             },
//             {
//                 new: true, 
//             }
//         );
//         return papersToToggle
//     } else {
//         const papersToToggle = await repository.updateMany(
//             PaperModel,
//             {
//                 subject_id: new mongoose.Types.ObjectId(subject_id),
//                 inactive_date: null, 
//             },
//             {
//                 $set: {
//                     is_active: false,
//                     inactive_date: SubjectInactiveDate,
//                 },
//             },
//             {
//                 new: true, 
//             }
//         );
//         return papersToToggle
//     }
// }

// module.exports.togglePapersByCategory = async (category_id, CategoryInactiveDate) => {
//     const existingCategory = await categoryService.getCategoryById(category_id);
//     if (!existingCategory) throw new Error('Invalid category _id');

//     if(existingCategory.is_active){
//         const papersToToggle = await repository.updateMany(
//             PaperModel,
//             {
//                 category_id: new mongoose.Types.ObjectId(category_id),
//                 inactive_date: CategoryInactiveDate,
//             },
//             {
//                 $set: {
//                     is_active: true,
//                     inactive_date: null,
//                 },
//             },
//             {
//                 new: true, 
//             }
//         );
//         return papersToToggle
//     } else {
//         const papersToToggle = await repository.updateMany(
//             PaperModel,
//             {
//                 category_id: new mongoose.Types.ObjectId(category_id),
//                 inactive_date: null, 
//             },
//             {
//                 $set: {
//                     is_active: false,
//                     inactive_date: CategoryInactiveDate,
//                 },
//             },
//             {
//                 new: true, 
//             }
//         );
//         return papersToToggle
//     }
// }

// module.exports.deletePapersBySubject = async (subject_id) => {
//     const existingSubject = await subjectService.getSubjectById(subject_id);
//     if (!existingSubject) throw new Error('Invalid subject _id');

//     const papersToDelete = await repository.updateMany(
//         PaperModel,
//         {
//             subject_id: new mongoose.Types.ObjectId(subject_id),
//         },
//         {
//             $set: {
//                 is_deleted: true,
//                 delete_date: new Date(),
//             },
//         },
//         {
//             new: true, 
//         }
//     );

//     return papersToDelete;
// }

// module.exports.deletePapersByCategory = async (category_id) => {
//     const existingCategory = await subjectService.getSubjectById(category_id);
//     if (!existingCategory) throw new Error('Invalid category _id');

//     const papersToDelete = await repository.updateMany(
//         PaperModel,
//         {
//             category_id: new mongoose.Types.ObjectId(category_id),
//         },
//         {
//             $set: {
//                 is_deleted: true,
//                 delete_date: new Date(),
//             },
//         },
//         {
//             new: true, 
//         }
//     );

//     return papersToDelete;
// }

module.exports.getFolderById = async (id) => {
    const paper = await repository.findOne(PaperModel, {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
    })
    return paper
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
    const sortingColumn = sortingConfig.sortingColumn.update_at[column];

    let matchQuery = {
        is_deleted: {
            $ne: true,
        },
    };

    let projectQuery = []
    let recordsTotal
    let papers

    const sortQuery = {
        [sortingColumn]: sortingOrder,
        updated_at: -1,
    }

    if (subject_id) {
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
                from: 'users',
                let: { teacherID: '$teacher_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$teacherID'] },
                        },
                    },
                    {
                        $project: {
                            first_name: 1,
                            last_name: 1,
                            email: 1,
                        },
                    },
                ],
                as: 'teacher',
            },
        },
        {
            $addFields: {
                teacher: {
                    $arrayElemAt: ['$teacher', 0],
                },
            },
        },
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

    recordsTotal = await repository.findByAggregateQuery(PaperModel, [
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
        papers = await repository.findByAggregateQuery(PaperModel, [
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
                        { 'teacher.first_name': { $regex: search, $options: "i" } },
                        { 'teacher.last_name': { $regex: search, $options: "i" } },
                        { 'subject.name': { $regex: search, $options: "i" } },
                        { 'subject.code': { $regex: search, $options: "i" } },
                        { 'category.name': { $regex: search, $options: "i" } },
                    ],
                },
            },
        ]

        const data = await repository.findByAggregateQuery(PaperModel, [
            {
                $facet: {
                    papers: [...searchQuery, ...paginationQuery],
                    recordsTotal: [...searchQuery, { $count: 'count' }],
                },
            },
        ])
        papers = pathOr([], [0, 'papers'], data)
        recordsTotal = pathOr(0, [0, 'recordsTotal', 0, 'count'], data)
    }

    const recordsFiltered = papers ? papers.length : 0

    return {
        papers,
        recordsTotal,
        recordsFiltered,
    }
}

module.exports.createFolder = async (body) => {
    const existingSubject = await subjectService.getSubjectById(body.subject_id);
    if (!existingSubject) {
        throw new Error('Subject id not valid!');
    }

    const existingCategory = await categoryService.getCategoryById(body.category_id);
    if (!existingCategory) {
        throw new Error('Category id not valid!');
    }

    const existingUser = await userService.getUserById(body.teacher_id);// need to check if teacher id
    if (!existingUser) {
        throw new Error('User id not valid!');
    }

    const newPaperToSave = new CategoryModel(body);
    const saveResult = await repository.save(newPaperToSave);
    return saveResult;
}

module.exports.updateFolder = async (body) => {
    const existingPaper = await this.getPaperById(body._id);
    if (!existingPaper) throw new Error('Invalid paper _id');
    if (body.subject_id) {
        const existingSubject = await subjectService.getSubjectById(body.subject_id);
        if (!existingSubject) {
            throw new Error('Subject id not valid!');
        }
    }

    if (body.category_id) {
        const existingCategory = await categoryService.getCategoryById(body.category_id);
        if (!existingCategory) {
            throw new Error('Category id not valid!');
        }
    }

    if (body.teacher_id) {
        const existingUser = await userService.getUserById(body.teacher_id);// need to check if teacher id
        if (!existingUser) {
            throw new Error('User id not valid!');
        }
    }

    let paperToUpdate = await repository.updateOne(
        PaperModel,
        {
            _id: body._id,
        },
        body,
        {
            new: true,
        }
    );
    paperToUpdate = paperToUpdate.toObject();
    return paperToUpdate;
}

module.exports.toggleFolder = async (id) => {
    const existingPaper = await this.getPaperById(id.toString());
    if (!existingPaper) throw new Error('Invalid paper _id');

    if (existingPaper.is_active) {
        const paperToToggle = await repository.updateOne(
            PaperModel,
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
            PaperModel,
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
    const existingPaper = await this.getPaperById(id.toString());
    if (!existingPaper) throw new Error('Invalid paper _id');

    const paperToDelete = await repository.updateOne(
        PaperModel,
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
