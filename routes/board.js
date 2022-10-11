const router = require("express").Router();

router.get("/sub/sports", function (req, resp) {
  resp.send("sports board");
});
router.get("/sub/game", function (req, resp) {
  resp.send("game board");
});

module.exports = router;
