/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const { pathOr } = require('ramda');
const repository = require('../../services/repositoryService');
const sortingConfig = require('../../config/sort.config');
const CategoryModel = require('./category.model');
const { setLimitToPositiveValue } = require('../../services/commonService');
const { includeExcludeFields } = require('../../services/queryService');
const subjectService = require('../subject/subject.service');
const paperService = require('../paper/paper.service');

module.exports.getCategoryByNameWithSameSubject = async (name, subject_id, filterActive = true) => {
    const filter = {
        name,
        subject_id,
        is_active: true,
        is_deleted: false,
    }

    if (!filterActive) delete filter.is_active

    return repository.findOne(CategoryModel, filter)
}

module.exports.toggleCategoriesBySubject = async (subject_id, SubjectInactiveDate) => {
    //Assume subject_id is existing one,
    const existingSubject = await subjectService.getSubjectById(subject_id);
    if (!existingSubject) throw new Error('Invalid subject _id');

    if(existingSubject.is_active){
        console.log(typeof existingSubject.inactive_date);
        console.log(existingSubject.inactive_date);
        const date = new Date(existingSubject.inactive_date);
        console.log(typeof date);
        console.log(date);
        const categoriesToToggle = await repository.updateMany(
            CategoryModel,
            {
                subject_id: new mongoose.Types.ObjectId(subject_id),
                inactive_date: SubjectInactiveDate,
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
        );
        return categoriesToToggle
    } else {
        const categoriesToToggle = await repository.updateMany(
            CategoryModel,
            {
                subject_id: new mongoose.Types.ObjectId(subject_id),
                inactive_date: null, 
            },
            {
                $set: {
                    is_active: false,
                    inactive_date: SubjectInactiveDate,
                },
            },
            {
                new: true, 
            }
        );
        return categoriesToToggle
    }
}

module.exports.deleteCategoriesBySubject = async (subject_id) => {
    const existingSubject = await subjectService.getSubjectById(subject_id);
    if (!existingSubject) throw new Error('Invalid subject _id');

    const categoriesToDelete = await repository.updateMany(
        CategoryModel,
        {
            subject_id: new mongoose.Types.ObjectId(subject_id),
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
    );

    return categoriesToDelete;
}

module.exports.getCategoryById = async (id) => {
    const category = await repository.findOne(CategoryModel, {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
    })
    return category
}

module.exports.getCategories = async (body) => {
    const {
        limit,
        order,
        page,
        search,
        subject_id,
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
    let categories

    const sortQuery = {
        [sortingColumn]: sortingOrder,
        updated_at: -1,
    }
    
    if (subject_id) {
        matchQuery = {
            ...matchQuery,
            'subject_id': new mongoose.Types.ObjectId(subject_id),
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
    ];

    recordsTotal = await repository.findByAggregateQuery(CategoryModel, [
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
        categories = await repository.findByAggregateQuery(CategoryModel, [
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
                    ],
                },
            },
        ]

        const data = await repository.findByAggregateQuery(CategoryModel, [
            {
                $facet: {
                    categories: [...searchQuery, ...paginationQuery],
                    recordsTotal: [...searchQuery, { $count: 'count' }],
                },
            },
        ])
        categories = pathOr([], [0, 'categories'], data)
        recordsTotal = pathOr(0, [0, 'recordsTotal', 0, 'count'], data)
    }

    const recordsFiltered = categories ? categories.length : 0

    return {
        categories,
        recordsTotal,
        recordsFiltered,
    }
}

module.exports.createCategory = async (body) => {
    const existingSubject = await subjectService.getSubjectById(body.subject_id);
    if (!existingSubject) {
        throw new Error('Subject id not valid!');
    }

    const existingNameWithSameSubject = await this.getCategoryByNameWithSameSubject(body.name, body.subject_id);
    if (existingNameWithSameSubject) {
        throw new Error('Category is already taken to this subject!');
    }

    const newCategoryToSave = new CategoryModel(body);
    const saveResult = await repository.save(newCategoryToSave);
    return saveResult;
}

module.exports.updateCategory = async (body) => {
    const existingCategory = await this.getCategoryById(body._id);
    if (!existingCategory) throw new Error('Invalid category _id');

    if (body.subject_id) {
        const existingSubject = await subjectService.getSubjectById(body.subject_id);
        if (!existingSubject) {
            throw new Error('Subject id not valid!');
        }
    }

    if (body.name) {
        const existingNameWithSameSubject = await this.getCategoryByNameWithSameSubject(body.name, body.subject_id, false);
        if (existingNameWithSameSubject) {
            if (existingNameWithSameSubject.name !== existingCategory.name) {
                throw new Error('Category is already taken to this subject!!');
            }
        }

    }

    let categoryToUpdate = await repository.updateOne(
        CategoryModel,
        {
            _id: body._id,
        },
        body,
        {
            new: true,
        }
    );
    categoryToUpdate = categoryToUpdate.toObject();
    return categoryToUpdate;
}

module.exports.toggleCategory = async (id) => {
    const existingCategory = await this.getCategoryById(id.toString());
    if (!existingCategory) throw new Error('Invalid category _id');

    if(existingCategory.is_active){
        const categoryToToggle = await repository.updateOne(
            CategoryModel,
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
        const papersToToggle = await paperService.togglePapersByCategory(existingCategory._id , existingCategory.inactive_date)
        return {
            toggledCategories: categoryToToggle,
            toggledPapers: papersToToggle
        };
    } else {
        const categoryToToggle = await repository.updateOne(
            CategoryModel,
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
        const papersToToggle = await paperService.togglePapersByCategory(existingCategory._id , existingCategory.inactive_date)
        return {
            toggledCategories: categoryToToggle,
            toggledPapers: papersToToggle
        };
    }
}

module.exports.deleteCategory = async (id) => {
    const existingCategory = await this.getCategoryById(id.toString());
    if (!existingCategory) throw new Error('Invalid category _id');

    const papersToDelete = await paperService.deletePapersByCategory(existingCategory._id);

    const categoryToDelete = await repository.updateOne(
        CategoryModel,
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

    return {
        deletedCategories: categoryToDelete,
        deletedPapers: papersToDelete
    };
}

