const router = require("express").Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.json());
router.use(
  bodyParser.text({
    limit: "50mb",
    type: "*/xml",
  })
);

router.use("/user", require("../src/users/user.router"));

module.exports = router;