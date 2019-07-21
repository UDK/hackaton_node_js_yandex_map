const express = require("express");
const router = express.Router();

// users data
let drugsData = require("../data/drugs");

router.get("/", (req, res) => {
  res.json(usersData);
});

router.post("/search/name", (req, res) => {

  let searchString = `${req.body.name}`
  let user = drugsData.filter(item => item.title.toLowerCase().includes(searchString.toLowerCase()))
  console.log(req.body.name, user);
  res.json(user)

});

router.post("/search/id", (req, res) => {

  let searchString = `${req.body.id}`
  let user = drugsData.filter(item => item.id === searchString)[0];
  console.log(req.body.name, user);
  res.json(user)

});

module.exports = router;
