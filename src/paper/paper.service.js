/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const { pathOr } = require("ramda");

const repository = require("../../services/repositoryService");
const PaperModel = require("./paper.model");
const sortingConfig = require("../../config/sort.config");
const { superAdmin } = require("../../config/permissionConfig").userRoles;

const { setLimitToPositiveValue } = require("../../services/commonService");
const { includeExcludeFields } = require("../../services/queryService");
const subjectService = require("../subject/subject.service");
const categoryService = require("../categories/category.service");
const folderService = require("../folder/folder.service");
const userService = require("../user/user.service");
const paperEnrollService = require("../paper-enroll/paper-enroll.service");

module.exports.togglePapersBySubject = async (
  subject_id,
  SubjectInactiveDate
) => {
  const existingSubject = await subjectService.getSubjectById(subject_id);
  if (!existingSubject) throw new Error("Invalid subject _id");

  if (existingSubject.is_active) {
    const papersToToggle = await repository.updateMany(
      PaperModel,
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
    return papersToToggle;
  } else {
    const papersToToggle = await repository.updateMany(
      PaperModel,
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
    return papersToToggle;
  }
};

module.exports.togglePapersByCategory = async (
  category_id,
  CategoryInactiveDate
) => {
  const existingCategory = await categoryService.getCategoryById(category_id);
  if (!existingCategory) throw new Error("Invalid category _id");

  if (existingCategory.is_active) {
    const papersToToggle = await repository.updateMany(
      PaperModel,
      {
        category_id: new mongoose.Types.ObjectId(category_id),
        inactive_date: CategoryInactiveDate,
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
    return papersToToggle;
  } else {
    const papersToToggle = await repository.updateMany(
      PaperModel,
      {
        category_id: new mongoose.Types.ObjectId(category_id),
        inactive_date: null,
      },
      {
        $set: {
          is_active: false,
          inactive_date: CategoryInactiveDate,
        },
      },
      {
        new: true,
      }
    );
    return papersToToggle;
  }
};

module.exports.deletePapersBySubject = async (subject_id) => {
  const existingSubject = await subjectService.getSubjectById(subject_id);
  if (!existingSubject) throw new Error("Invalid subject _id");

  const papersToDelete = await repository.updateMany(
    PaperModel,
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

  return papersToDelete;
};

module.exports.deletePapersByCategory = async (category_id) => {
  const existingCategory = await subjectService.getSubjectById(category_id);
  if (!existingCategory) throw new Error("Invalid category _id");

  const papersToDelete = await repository.updateMany(
    PaperModel,
    {
      category_id: new mongoose.Types.ObjectId(category_id),
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

  return papersToDelete;
};

module.exports.getPaperById = async (id) => {
  const paper = await repository.findOne(PaperModel, {
    _id: new mongoose.Types.ObjectId(id),
    is_deleted: false,
  });
  return paper;
};

// module.exports.getPapers = async (body) => {
//     const existingCategory = await categoryService.getCategoryById(parent_id);
//     if (existingCategory) {
//         throw new Error('Invalid subject _id');
//     }
//     else {
//         const existingFolder = await folderService.getFolderById(parent_id);
//         if (!existingFolder) throw new Error('Invalid parent _id');
//     }
//     if (!existingCategory) throw new Error('Invalid subject _id');
//     const {
//         limit,
//         order,
//         page,
//         search,
//         folder_id: parent_id,
//         exclude = [],
//     } = body
//     const column = body.column || -1

//     const sortingOrder =
//         order === sortingConfig.sortingOrder.descending || !order ? -1 : 1
//     const sortingColumn = sortingConfig.sortingColumn.update_at[column];

//     let matchQuery = {
//         is_deleted: {
//             $ne: true,
//         },
//     };

//     let projectQuery = []
//     let recordsTotal
//     let papers

//     const sortQuery = {
//         [sortingColumn]: sortingOrder,
//         updated_at: -1,
//     }

//     if (subject_id) {
//         matchQuery = {
//             ...matchQuery,
//             'folder_id': new mongoose.Types.ObjectId(parent_id),
//         }
//     }

//     const prePaginationQuery = [
//         {
//             $match: matchQuery,
//         },
//     ]

//     const combinedQuery = [
//         {
//             $lookup: {
//                 from: 'users',
//                 let: { teacherID: '$teacher_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ['$_id', '$$teacherID'] },
//                         },
//                     },
//                     {
//                         $project: {
//                             first_name: 1,
//                             last_name: 1,
//                             email: 1,
//                         },
//                     },
//                 ],
//                 as: 'teacher',
//             },
//         },
//         {
//             $addFields: {
//                 teacher: {
//                     $arrayElemAt: ['$teacher', 0],
//                 },
//             },
//         },
//         {
//             $lookup: {
//                 from: 'subjects',
//                 let: { subjectID: '$subject_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ['$_id', '$$subjectID'] },
//                         },
//                     },
//                     {
//                         $project: {
//                             name: 1,
//                             code: 1,
//                         },
//                     },
//                 ],
//                 as: 'subject',
//             },
//         },
//         {
//             $addFields: {
//                 subject: {
//                     $arrayElemAt: ['$subject', 0],
//                 },
//             },
//         },
//         {
//             $lookup: {
//                 from: 'categories',
//                 let: { categoryID: '$category_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ['$_id', '$$categoryID'] },
//                         },
//                     },
//                     {
//                         $project: {
//                             name: 1,
//                         },
//                     },
//                 ],
//                 as: 'category',
//             },
//         },
//         {
//             $lookup: {
//                 from: 'folders',
//                 let: { categoryID: '$folder_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ['$_id', '$$folderID'] },
//                         },
//                     },
//                     {
//                         $project: {
//                             name: 1,
//                         },
//                     },
//                 ],
//                 as: 'folder',
//             },
//         },
//         {
//             $addFields: {
//                 category: {
//                     $arrayElemAt: ['$folder', 0],
//                 },
//             },
//         },
//     ];

//     recordsTotal = await repository.findByAggregateQuery(PaperModel, [
//         ...prePaginationQuery,
//         { $count: 'count' },
//     ])

//     recordsTotal = pathOr(0, [0, 'count'], recordsTotal)
//     const pageLimit = setLimitToPositiveValue(limit, recordsTotal)

//     if (exclude.length >= 1) {
//         projectQuery = [
//             {
//                 $project: includeExcludeFields(exclude, 0),
//             },
//         ]
//     }

//     const paginationQuery = [
//         { $sort: sortQuery },
//         { $skip: page ? pageLimit * (page - 1) : 0 },
//         { $limit: +pageLimit || +recordsTotal },
//         ...projectQuery,
//     ]

//     if (!search) {
//         papers = await repository.findByAggregateQuery(PaperModel, [
//             ...prePaginationQuery,
//             ...paginationQuery,
//             ...combinedQuery,
//         ])
//     } else {
//         const searchQuery = [
//             ...prePaginationQuery,
//             ...combinedQuery,
//             {
//                 $match: {
//                     $or: [
//                         { title: { $regex: search, $options: 'i' } },
//                         { publish_date: { $regex: search, $options: 'i' } },
//                         { price: { $regex: search, $options: 'i' } },
//                         { 'teacher.first_name': { $regex: search, $options: "i" } },
//                         { 'teacher.last_name': { $regex: search, $options: "i" } },
//                         { 'subject.name': { $regex: search, $options: "i" } },
//                         { 'subject.code': { $regex: search, $options: "i" } },
//                         { 'category.name': { $regex: search, $options: "i" } },
//                         { 'folder.name': { $regex: search, $options: "i" } },
//                         { 'category.name': { $regex: search, $options: "i" } },
//                     ],
//                 },
//             },
//         ]

//         const data = await repository.findByAggregateQuery(PaperModel, [
//             {
//                 $facet: {
//                     papers: [...searchQuery, ...paginationQuery],
//                     recordsTotal: [...searchQuery, { $count: 'count' }],
//                 },
//             },
//         ])
//         papers = pathOr([], [0, 'papers'], data)
//         recordsTotal = pathOr(0, [0, 'recordsTotal', 0, 'count'], data)
//     }

//     const recordsFiltered = papers ? papers.length : 0

//     return {
//         papers,
//         recordsTotal,
//         recordsFiltered,
//     }
// }
module.exports.getPapers = async (body) => {
  const {
    limit,
    order,
    page,
    search,
    parent_id,
    user_id, // Add user_id here
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
  let papers;

  const sortQuery = {
    [sortingColumn]: sortingOrder,
    updated_at: -1,
  };

  if (parent_id) {
    const existingCategory = await categoryService.getCategoryById(parent_id);

    if (existingCategory) {
      matchQuery = {
        ...matchQuery,
        category_id: new mongoose.Types.ObjectId(parent_id),
      };
    } else {
      const existingFolder = await folderService.getFolderById(parent_id);

      if (!existingFolder) {
        throw new Error("Invalid parent _id");
      }

      matchQuery = {
        ...matchQuery,
        folder_id: new mongoose.Types.ObjectId(parent_id),
      };
    }
  }

  const prePaginationQuery = [
    {
      $match: matchQuery,
    },
  ];
  console.log("1");

  const combinedQuery = [
    {
      $lookup: {
        from: "users",
        let: { teacherID: "$teacher_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$teacherID"] },
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
        as: "teacher",
      },
    },
    {
      $lookup: {
        from: "subjects",
        let: { subjectID: "$subject_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$subjectID"] },
            },
          },
          {
            $project: {
              name: 1,
              code: 1,
            },
          },
        ],
        as: "subject",
      },
    },
    {
      $lookup: {
        from: "categories",
        let: { categoryID: "$category_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$categoryID"] },
            },
          },
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: "category",
      },
    },
    {
      $lookup: {
        from: "folders",
        let: { folderID: "$folder_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$folderID"] },
            },
          },
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: "folder",
      },
    },
    {
      $addFields: {
        subject: {
          $arrayElemAt: ["$subject", 0],
        },
        category: {
          $arrayElemAt: ["$category", 0],
        },
        folder: {
          $arrayElemAt: ["$folder", 0],
        },
        teacher: {
          $arrayElemAt: ["$teacher", 0],
        },
      },
    },
  ];
  console.log("2");

  recordsTotal = await repository.findByAggregateQuery(PaperModel, [
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
    papers = await repository.findByAggregateQuery(PaperModel, [
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
            { title: { $regex: search, $options: "i" } },
            { publish_date: { $regex: search, $options: "i" } },
            { price: { $regex: search, $options: "i" } },
            { "teacher.first_name": { $regex: search, $options: "i" } },
            { "teacher.last_name": { $regex: search, $options: "i" } },
            { "subject.name": { $regex: search, $options: "i" } },
            { "subject.code": { $regex: search, $options: "i" } },
            { "category.name": { $regex: search, $options: "i" } },
            { "folder.name": { $regex: search, $options: "i" } },
          ],
        },
      },
    ];

    const data = await repository.findByAggregateQuery(PaperModel, [
      {
        $facet: {
          papers: [...searchQuery, ...paginationQuery],
          recordsTotal: [...searchQuery, { $count: "count" }],
        },
      },
    ]);
    papers = data[0]?.papers || [];
    recordsTotal = data[0]?.recordsTotal[0]?.count || 0;
  }

  const recordsFiltered = papers ? papers.length : 0;

  // Iterate over each paper and call getPaperById
  if (!user_id) {
    return {
      papers,
      recordsTotal,
      recordsFiltered,
    };
  } else {
    const processedPapers = await Promise.all(
      papers.map(async (paper) => {
        const fullPaperData =
          await paperEnrollService.getEnrollPaperByStudentIdWithPaperID(
            paper._id,
            user_id
          );

        const isPurchase = !!fullPaperData;

        return { ...paper, isPurchase };
      })
    );

    return {
      papers: processedPapers,
      recordsTotal,
      recordsFiltered,
    };
  }
};

// module.exports.getPapers = async (body) => {
//     const {
//         limit,
//         order,
//         page,
//         search,
//         parent_id,
//         exclude = [],
//     } = body;
//     const column = body.column || -1;

//     const sortingOrder = order === sortingConfig.sortingOrder.descending || !order ? -1 : 1;
//     const sortingColumn = sortingConfig.sortingColumn.update_at[column];

//     let matchQuery = {
//         is_deleted: {
//             $ne: true,
//         },
//     };

//     let projectQuery = [];
//     let recordsTotal;
//     let papers;

//     const sortQuery = {
//         [sortingColumn]: sortingOrder,
//         updated_at: -1,
//     };

//     if (parent_id) {
//         const existingCategory = await categoryService.getCategoryById(parent_id);

//         if (existingCategory) {
//             matchQuery = {
//                 ...matchQuery,
//                 'category_id': new mongoose.Types.ObjectId(parent_id),
//             };
//         } else {
//             const existingFolder = await folderService.getFolderById(parent_id);

//             if (!existingFolder) {
//                 throw new Error('Invalid parent _id');
//             }

//             matchQuery = {
//                 ...matchQuery,
//                 'folder_id': new mongoose.Types.ObjectId(parent_id),
//             };
//         }
//     }

//     const prePaginationQuery = [
//         {
//             $match: matchQuery,
//         },
//     ];

//     const combinedQuery = [
//         {
//             $lookup: {
//                 from: 'users',
//                 let: { teacherID: '$teacher_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ['$_id', '$$teacherID'] },
//                         },
//                     },
//                     {
//                         $project: {
//                             first_name: 1,
//                             last_name: 1,
//                             email: 1,
//                         },
//                     },
//                 ],
//                 as: 'teacher',
//             },
//         },
//         {
//             $addFields: {
//                 teacher: {
//                     $arrayElemAt: ['$teacher', 0],
//                 },
//             },
//         },
//         {
//             $lookup: {
//                 from: 'subjects',
//                 let: { subjectID: '$subject_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ['$_id', '$$subjectID'] },
//                         },
//                     },
//                     {
//                         $project: {
//                             name: 1,
//                             code: 1,
//                         },
//                     },
//                 ],
//                 as: 'subject',
//             },
//         },
//         {
//             $lookup: {
//                 from: 'categories',
//                 let: { categoryID: '$category_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ['$_id', '$$categoryID'] },
//                         },
//                     },
//                     {
//                         $project: {
//                             name: 1,
//                         },
//                     },
//                 ],
//                 as: 'category',
//             },
//         },
//         {
//             $lookup: {
//                 from: 'folders',
//                 let: { folderID: '$folder_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ['$_id', '$$folderID'] },
//                         },
//                     },
//                     {
//                         $project: {
//                             name: 1,
//                         },
//                     },
//                 ],
//                 as: 'folder',
//             },
//         },
//         {
//             $lookup: {
//                 from: 'Paper-enroll',
//                 let: { paperID: '$_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: { $eq: ['$paper_id', '$$paperID'] },
//                         },
//                     },
//                     {
//                         $project: {
//                             user_id: 1,
//                         },
//                     },
//                 ],
//                 as: 'paper-enrolls',
//             },
//         },
//         {
//             $addFields: {
//                 subject: {
//                     $arrayElemAt: ['$subject', 0],
//                 },
//                 category: {
//                     $arrayElemAt: ['$category', 0],
//                 },
//                 folder: {
//                     $arrayElemAt: ['$folder', 0],
//                 },
//                 paperEnroll: {
//                     $arrayElemAt: ['$paper-enrolls', 0],
//                 },
//             },
//         },
//     ];

//     recordsTotal = await repository.findByAggregateQuery(PaperModel, [
//         ...prePaginationQuery,
//         { $count: 'count' },
//     ]);

//     recordsTotal = recordsTotal[0]?.count || 0;
//     const pageLimit = setLimitToPositiveValue(limit, recordsTotal);

//     if (exclude.length >= 1) {
//         projectQuery = [
//             {
//                 $project: includeExcludeFields(exclude, 0),
//             },
//         ];
//     }

//     const paginationQuery = [
//         { $sort: sortQuery },
//         { $skip: page ? pageLimit * (page - 1) : 0 },
//         { $limit: +pageLimit || +recordsTotal },
//         ...projectQuery,
//     ];

//     if (!search) {
//         papers = await repository.findByAggregateQuery(PaperModel, [
//             ...prePaginationQuery,
//             ...paginationQuery,
//             ...combinedQuery,
//         ]);
//     } else {
//         const searchQuery = [
//             ...prePaginationQuery,
//             ...combinedQuery,
//             {
//                 $match: {
//                     $or: [
//                         { title: { $regex: search, $options: 'i' } },
//                         { publish_date: { $regex: search, $options: 'i' } },
//                         { price: { $regex: search, $options: 'i' } },
//                         { 'teacher.first_name': { $regex: search, $options: 'i' } },
//                         { 'teacher.last_name': { $regex: search, $options: 'i' } },
//                         { 'subject.name': { $regex: search, $options: 'i' } },
//                         { 'subject.code': { $regex: search, $options: 'i' } },
//                         { 'category.name': { $regex: search, $options: 'i' } },
//                         { 'folder.name': { $regex: search, $options: 'i' } },
//                     ],
//                 },
//             },
//         ];

//         const data = await repository.findByAggregateQuery(PaperModel, [
//             {
//                 $facet: {
//                     papers: [...searchQuery, ...paginationQuery],
//                     recordsTotal: [...searchQuery, { $count: 'count' }],
//                 },
//             },
//         ]);
//         papers = data[0]?.papers || [];
//         recordsTotal = data[0]?.recordsTotal[0]?.count || 0;
//     }

//     const recordsFiltered = papers ? papers.length : 0;

//     return {
//         papers,
//         recordsTotal,
//         recordsFiltered,
//     };
// };

module.exports.createPaper = async (body) => {
  console.log("1");
  const existingSubject = await subjectService.getSubjectById(body.subject_id);
  if (!existingSubject) {
    throw new Error("Subject id not valid!");
  }

  const existingCategory = await categoryService.getCategoryById(
    body.category_id
  );
  if (!existingCategory) {
    throw new Error("Category id not valid!");
  }

  const existingUser = await userService.getUserById(body.teacher_id); // need to check if teacher id
  if (!existingUser) {
    throw new Error("User id not valid!");
  }

  if (body.folder_id) {
    const existingFolder = await folderService.getFolderById(body.folder_id);
    if (!existingFolder) {
      throw new Error("Folder id not valid!");
    }
  }

  const newPaperToSave = new PaperModel(body);
  const saveResult = await repository.save(newPaperToSave);
  return saveResult;
};

module.exports.updatePaper = async (body) => {
  const existingPaper = await this.getPaperById(body._id);
  if (!existingPaper) throw new Error("Invalid paper _id");
  if (body.subject_id) {
    const existingSubject = await subjectService.getSubjectById(
      body.subject_id
    );
    if (!existingSubject) {
      throw new Error("Subject id not valid!");
    }
  }

  if (body.category_id) {
    const existingCategory = await categoryService.getCategoryById(
      body.category_id
    );
    if (!existingCategory) {
      throw new Error("Category id not valid!");
    }
  }

  if (body.teacher_id) {
    const existingUser = await userService.getUserById(body.teacher_id); // need to check if teacher id
    if (!existingUser) {
      throw new Error("User id not valid!");
    }
  }

  if (body.folder_id) {
    const existingFolder = await folderService.getFolderById(body.folder_id);
    if (!existingFolder) {
      throw new Error("Folder id not valid!");
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
};

module.exports.togglePaper = async (id) => {
  const existingPaper = await this.getPaperById(id.toString());
  if (!existingPaper) throw new Error("Invalid paper _id");

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
    );
    return paperToToggle;
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
    );
    return paperToToggle;
  }
};

module.exports.deletePaper = async (id) => {
  const existingPaper = await this.getPaperById(id.toString());
  if (!existingPaper) throw new Error("Invalid paper _id");

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
  );

  return paperToDelete;
};
