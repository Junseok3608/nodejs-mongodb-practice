const router = require("express").Router();
function areULogin(req, resp, next) {
  if (req.user) {
    next();
  } else {
    resp.send("have to login");
  }
}
router.use(areULogin);

router.get("/shirts", function (req, resp) {
  resp.send("selling shirts");
});
router.get("/pants", function (req, resp) {
  resp.send("selling pants");
});

module.exports = router;
