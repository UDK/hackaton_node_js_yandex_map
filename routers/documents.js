const express = require("express");
const router = express.Router();

// users data
let documentsData = require("../data/documents");

router.get("/", (req, res) => {
  res.json(documentsData);
});

router.post("/search/", (req, res) => {

  let searchString = `${req.body.name}`
  let user = documentsData.filter(item => item.title.toLowerCase().includes(searchString.toLowerCase()))
  console.log(req.body.name, user);
  res.json(user)

});

module.exports = router;