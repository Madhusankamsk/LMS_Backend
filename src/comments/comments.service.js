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

module.exports.createComment = async (body) => {
    const existingPaper = await paperService.getPaperById(body.paper_id);
    if (!existingPaper) {
        throw new Error('Paper id not valid!');
    }

    const existingUser = await userService.getUserById(body.user_id);
    if (!existingUser) {
        throw new Error('User id not valid!');
    }

    const newCommentToSave = new CommentModel(body);
    const saveResult = await repository.save(newCommentToSave);
    return saveResult;
}

module.exports.updateComment = async (body) => {
    const existingComment = await this.getCommentById(body._id);
    if (!existingComment) throw new Error('Invalid comment _id');
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
    if (!existingComment) throw new Error('Invalid comment _id');

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