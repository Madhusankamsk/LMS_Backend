/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const { pathOr } = require('ramda');
const repository = require('../../services/repositoryService');
const sortingConfig = require('../../config/sort.config');
const SubjectModel = require('./subject.model');
const { setLimitToPositiveValue } = require('../../services/commonService');
const { includeExcludeFields } = require('../../services/queryService');

module.exports.getSubjectById = async (id) => {
    const subject = await repository.findOne(SubjectModel, {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false, 
    })
    return subject
}

module.exports.getSubjectByCode = async (code, filterActive = true) => {
    const filter = {
        code: { $eq: code },
        is_active: true,
        is_deleted: false,
    }

    if (!filterActive) delete filter.is_active

    return repository.findOne(SubjectModel, filter)
}

module.exports.getSubjects = async (body) => {
    const {
        limit,
        order,
        page,
        search,
        exclude = [],
    } = body
    const column = body.column || -1

    const sortingOrder =
        order === sortingConfig.sortingOrder.descending || !order ? -1 : 1
    const sortingColumn = sortingConfig.sortingColumn.update_at[column];

    const matchQuery = {
        is_deleted: {
            $ne: true,
        },
    };

    let projectQuery = []
    let recordsTotal
    let subjects

    const sortQuery = {
        [sortingColumn]: sortingOrder,
        updated_at: -1,
    }

    const prePaginationQuery = [
        {
            $match: matchQuery,
        },
    ]

    recordsTotal = await repository.findByAggregateQuery(SubjectModel, [
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
        subjects = await repository.findByAggregateQuery(SubjectModel, [
            ...prePaginationQuery,
            ...paginationQuery,
        ])
    } else {
        const searchQuery = [
            ...prePaginationQuery,
            {
                $match: {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { code: { $regex: search, $options: 'i' } },
                    ],
                },
            },
        ]

        const data = await repository.findByAggregateQuery(SubjectModel, [
            {
                $facet: {
                    subjects: [...searchQuery, ...paginationQuery],
                    recordsTotal: [...searchQuery, { $count: 'count' }],
                },
            },
        ])
        subjects = pathOr([], [0, 'subjects'], data)
        recordsTotal = pathOr(0, [0, 'recordsTotal', 0, 'count'], data)
    }

    const recordsFiltered = subjects ? subjects.length : 0

    return {
        subjects,
        recordsTotal,
        recordsFiltered,
    }
}

module.exports.createSubject = async (body) => {
    const existingCode = await this.getSubjectByCode(body.code, false);

    if (existingCode) {
        throw new Error('Subject code is already taken!');
    }

    const newSubjectToSave = new SubjectModel(body);
    const saveResult = await repository.save(newSubjectToSave);
    return saveResult;
}

module.exports.updateSubject = async (body) => {
    const existingSubject = await this.getSubjectById(body._id);
    if (!existingSubject) throw new Error('Invalid subject _id');

    if(body.code){
        const existingSubjectWithSameCode = await this.getSubjectByCode(body.code);
        if(existingSubjectWithSameCode){
            if(existingSubjectWithSameCode.code !== existingSubject.code){
                throw new Error('Subject code already taken!');
            }
        }

    }
    
    let subjectToUpdate = await repository.updateOne(
        SubjectModel,
        {
            _id: body._id,
        },
        body,
        {
            new: true,
        }
    );
    subjectToUpdate = subjectToUpdate.toObject();
    return subjectToUpdate;
}

module.exports.deleteSubject = async (id) => {
    const existingSubject = await this.getSubjectById(id.toString());
    if (!existingSubject) throw new Error('Invalid subject _id');

    const subjectToDelete = await repository.updateOne(
        SubjectModel,
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

    return subjectToDelete
}




