/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const { pathOr } = require("ramda");

const repository = require("../../services/repositoryService");
const PaperEnrollModel = require("./paper-enroll.model");
const sortingConfig = require("../../config/sort.config");
const { superAdmin } = require("../../config/permissionConfig").userRoles;

const { setLimitToPositiveValue } = require("../../services/commonService");
const { includeExcludeFields } = require("../../services/queryService");
const subjectService = require("../subject/subject.service");
const categoryService = require("../categories/category.service");
const folderService = require("../folder/folder.service");
const userService = require("../user/user.service");
const paperService = require("../paper/paper.service");
const { studentAnswers , userRoles } = require("../../config/permissionConfig");
const { sendDefualtMail } = require("../../mails/mails.service");


module.exports.getEnrollPaperByPaperId = async (paper_id) => {
  const enrollPaper = await repository.findOne(PaperEnrollModel, {
    paper_id: new mongoose.Types.ObjectId(paper_id),
    is_deleted: false,
  });
  return enrollPaper;
};

module.exports.getEnrollPaperById = async (id) => {
  const enrollPaper = await repository.findOne(PaperEnrollModel, {
    _id: new mongoose.Types.ObjectId(id),
    is_deleted: false,
  });
  return enrollPaper;
};

module.exports.getEnrollPaperByStudentIdWithPaperID = async (
  paperId,
  userId
) => {
  const enrollPaper = await repository.findOne(PaperEnrollModel, {
    paper_id: new mongoose.Types.ObjectId(paperId),
    user_id: new mongoose.Types.ObjectId(userId),
  });
  return enrollPaper;
};

module.exports.getEnrollPapers = async (body) => {
  const {
    limit,
    order,
    page,
    search,
    paper_id,
    teacher_id,
    user_id,
    exclude = [],
  } = body;
  const column = body.column || -1;

  const sortingOrder =
    order === sortingConfig.sortingOrder.descending || !order ? -1 : 1;
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
        paper_id: new mongoose.Types.ObjectId(paper_id),
      };
    } else {
      throw new Error("Invalid paper ID");
    }
  }

  if (user_id) {
    const existingUser = await userService.getUserById(user_id);

    if (existingUser) {
      matchQuery = {
        ...matchQuery,
        user_id: new mongoose.Types.ObjectId(user_id),
      };
    } else {
      throw new Error("Invalid User ID");
    }
  }

  if (teacher_id) {
    const existingTeacher = await userService.getUserById(teacher_id);
    if (!existingTeacher) {
      throw new Error("Invalid User ID");
    } else if (existingTeacher.role !== userRoles.techer) {
      throw new Error("You are not teacher!!!");
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
        from: "papers",
        let: { paperID: "$paper_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$paperID"] },
            },
          },
          {
            $project: {
              title: 1,
              teacher_id: 1,
            },
          },
          // If teacher_id is provided, filter by teacher_id
          ...(teacher_id
            ? [
                {
                  $match: {
                    teacher_id: new mongoose.Types.ObjectId(teacher_id),
                  },
                },
              ]
            : []),
        ],
        as: "paper",
      },
    },
    {
      $addFields: {
        paper: {
          $arrayElemAt: ["$paper", 0],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { userID: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userID"] },
            },
          },
          {
            $project: {
              email: 1,
              full_name: { $concat: ["$first_name", " ", "$last_name"] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $addFields: {
        user: {
          $arrayElemAt: ["$user", 0],
        },
      },
    },
  ];

  recordsTotal = await repository.findByAggregateQuery(PaperEnrollModel, [
    ...prePaginationQuery,
    { $count: "count" },
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
            { "paper.title": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
          ],
        },
      },
    ];

    const data = await repository.findByAggregateQuery(PaperEnrollModel, [
      {
        $facet: {
          enrollPapers: [...searchQuery, ...paginationQuery],
          recordsTotal: [...searchQuery, { $count: "count" }],
        },
      },
    ]);
    enrollPapers = data[0]?.enrollPapers || [];
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
    throw new Error("Paper ID not valid!!!");
  }

  const existingUser = await userService.getUserById(body.user_id);
  if (!existingUser) {
    throw new Error("User ID not valid!!!");
  }

  const existinePaperEnroll = await this.getEnrollPaperByStudentIdWithPaperID(
    body.paper_id,
    body.user_id
  );

  if (existinePaperEnroll) {
    throw new Error("User is already enrolled to this paper!!!");
  }

  console.log(existingUser.price, " ", existingPaper.price);

  if (existingUser.price < existingPaper.price) {
    throw new Error("Your balance is not sufficient to purchase this paper!!!");
  }

  const existingTeacher = await userService.getUserById(
    existingPaper.teacher_id
  );
  const newUserPrice = existingUser.price - existingPaper.price;
  const newTeacherPrice = existingTeacher.price + existingPaper.price;

  await userService.updateUser({
    _id: body.user_id,
    price: newUserPrice,
  });

  await userService.updateUser({
    _id: existingTeacher._id,
    price: newTeacherPrice,
  });

  const newEnrollPaperToSave = new PaperEnrollModel(body);
  const saveResult = await repository.save(newEnrollPaperToSave);
  return saveResult;
};

module.exports.updateEnrollPaper = async (body) => {
  const existingPaperEnroll = await this.getEnrollPaperById(body._id);
  if (!existingPaperEnroll) throw new Error("Invalid paper enrollment ID!!!");
  if (body.paper_id) {
    const existingPaper = await paperService.getPaperById(body.paper_id);
    if (!existingPaper) {
      throw new Error("Paper ID not valid!!!");
    }
  }

  if (body.user_id) {
    const existingUser = await userService.getUserById(body.user_id);
    if (!existingUser) {
      throw new Error("User ID not valid!!!");
    }
  }

  if (body.student_link) {
    if (existingPaperEnroll.student_link) {
      throw new Error("You have already updated the answer!!!");
    }
  }

  if (body.status && body.status === studentAnswers.submitted) {
    if (!(body.mark || existingPaperEnroll.mark)) {
      throw new Error("Mark is required when submitting!");
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

  if (body.status) {
    if (enrollPaperToUpdate.user_id) {
      const student = await userService.getUserById(
        enrollPaperToUpdate.user_id
      );
      if (!student) {
        throw new Error("User ID not valid!!!");
      }

      if (enrollPaperToUpdate.paper_id) {
        const paper = await paperService.getPaperById(
          enrollPaperToUpdate.paper_id
        );
        if (!paper) {
          throw new Error("Paper ID not valid!!!");
        }

        if (body.status === studentAnswers.submitted) {
          await sendDefualtMail({
            to: student.email,
            subject: "Your Paper Has Been Marked",
            text: `Dear ${student.first_name},\n\nYour paper "${paper.title}" has been marked. Your score is ${body.mark}.\n\nFeedback: ${body.feedback}\n\nPlease log in to your account to view more details.\n\nBest regards,\nThe Team`,
            name: student.first_name,
          });
        }
      }
    }
  }

  enrollPaperToUpdate = enrollPaperToUpdate.toObject();
  return enrollPaperToUpdate;
};

module.exports.deleteEnrollPaper = async (id) => {
  const existingEnrollPaper = await this.getEnrollPaperById(id.toString());
  if (!existingEnrollPaper) throw new Error("Invalid paper enrollment ID!!!");

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
  );

  return enrollPaperToDelete;
};
