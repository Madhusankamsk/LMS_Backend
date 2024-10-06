/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose')
const { pathOr } = require('ramda')

const repository = require('../../services/repositoryService')
const PaymentModel = require('./payment.model')
const sortingConfig = require('../../config/sort.config')
const { superAdmin } = require('../../config/permissionConfig').userRoles

const { setLimitToPositiveValue } = require('../../services/commonService')
const { includeExcludeFields } = require('../../services/queryService')
const userService = require('../user/user.service');
const { payments } = require("../../config/permissionConfig");

module.exports.getPaymentById = async (id) => {
    const payment = await repository.findOne(PaymentModel, {
        _id: new mongoose.Types.ObjectId(id),
        is_deleted: false,
    })
    return payment
}

module.exports.getPayments = async (body) => {
    const {
        limit,
        order,
        page,
        search,
        user_id,
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
    let payments

    const sortQuery = {
        [sortingColumn]: sortingOrder,
        updated_at: -1,
    }

    if (user_id) {
        matchQuery = {
            ...matchQuery,
            'user_id': new mongoose.Types.ObjectId(user_id),
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
                            full_name: { $concat: ["$first_name", " ", "$last_name"] }
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
        }
    ];

    recordsTotal = await repository.findByAggregateQuery(PaymentModel, [
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
        payments = await repository.findByAggregateQuery(PaymentModel, [
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
                        { submit_date: { $regex: search, $options: 'i' } },
                        { transfer_date: { $regex: search, $options: 'i' } },
                        { 'user.full_name': { $regex: search, $options: "i" } },
                        { 'user.email': { $regex: search, $options: "i" } },
                    ],
                },
            },
        ]

        const data = await repository.findByAggregateQuery(PaymentModel, [
            {
                $facet: {
                    payments: [...searchQuery, ...paginationQuery],
                    recordsTotal: [...searchQuery, { $count: 'count' }],
                },
            },
        ])
        payments = data[0]?.payments || [];
        recordsTotal = data[0]?.recordsTotal[0]?.count || 0;
    }

    const recordsFiltered = payments ? payments.length : 0

    return {
        payments,
        recordsTotal,
        recordsFiltered,
    }
}

module.exports.createPayment = async (body) => {
    const existingUser = await userService.getUserById(body.user_id);
    if (!existingUser) {
        throw new Error('User id not valid!');
    }

    body.submitted_date = Date.now();
    
    const newPayment = new PaymentModel(body);
    const saveResult = await repository.save(newPayment);
    return saveResult;
}

module.exports.updatePayment = async (body) => {
    const existingPayment = await this.getPaymentById(body._id);
    if (!existingPayment) throw new Error('Invalid payment _id');

    if (body.user_id) {
        const existingUser = await userService.getUserById(body.user_id);
        if (!existingUser) {
            throw new Error('User id not valid!');
        }
    }
    if (body.status && !Object.values(payments).includes(body.status)) {
        throw new Error('Invalid payment status');
    }

    let PaymentToUpdate = await repository.updateOne(
        PaymentModel,
        {
            _id: body._id,
        },
        body,
        {
            new: true,
        }
    );
    PaymentToUpdate = PaymentToUpdate.toObject();
    return PaymentToUpdate;
}

module.exports.deletePayment = async (id) => {
    const existingPayment = await this.getPaymentById(id.toString());
    if (!existingPayment) throw new Error('Invalid payment _id');
    else if (existingPayment.status === payments.transfer) throw new Error('payment status is transfer');

    const paymentToDelete = await repository.updateOne(
        PaymentModel,
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

    return paymentToDelete
}

