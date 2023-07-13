const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // get query params
  console.log(req.query.name);
  res.send("user list");
});

router.get("/new", (req, res) => {
  res.send("user new form");
});

router.post("/", (req, res) => {
  res.sent("create user");
});

// handle all the GET, PUT, DELETE in same call
router
  .route("/:id")
  .get((req, res) => {
    res.send(`get user with ID: ${req.params.id}`);
  })
  .put((req, res) => {
    res.send(`get user with ID: ${req.params.id}`);
  })
  .delete((req, res) => {
    res.send(`get user with ID: ${req.params.id}`);
  });

// middleware for any ID call
router.param("id", (req, res, next, id) => {
  console.log("received id req");
  next();
});

module.exports = router;
