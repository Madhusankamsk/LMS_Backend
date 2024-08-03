const router = require("express").Router();
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.json());
router.use(
  bodyParser.text({
    limit: "50mb",
    type: "*/xml",
  })
);

router.use("/user", require("../src/user/user.router"));
// router.use("/user_role", require("../src/user-role/user-role.router"));
router.use("/subject", require("../src/subject/subject.router"));
router.use("/papers", require("../src/paper/paper.router"));
router.use("/categories", require("../src/categories/category.router"));
router.use("/folders", require("../src/folder/folder.router"));
router.use("/paper-enroll", require("../src/paper-enroll/paper-enroll.router"));

module.exports = router;