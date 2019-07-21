const express = require("express");
const router = express.Router();

// users data
let roadsData = require("../data/roads");

router.get("/", (req, res) => {
  res.json(roadsData);
});

router.post("/", (req, res) => {
  //console.log("BODY", req.body);
  pointsReturn = [];
  let color;
  var nearest_road_arr = [];
  roadsData.forEach(element => {
    var MBW = element.MBW;
    var count = Number(Object.keys(element.data).length);
    var newMB = Number(req.body["countCars"]) + count;
    if (newMB <= MBW) {
      color = "008000";
    } else if (newMB <= MBW * 1.5) {
      color = "FFFF00";
    } else {
      color = "FF0000";
    }
    const { geo_point_bad } = element;
    if (
      geo_point_bad[0][0][0] - req.body.POINT_COORD[0] < 0.05 &&
      geo_point_bad[0][0][1] - req.body.POINT_COORD[1] < 0.05
    ) {
      nearest_road_arr.push(element.nearest_road);
      pointsReturn.push([geo_point_bad[0], color]);
      //console.log("aaa", nearest_road_arr);
    }
  });
  console.log("sssss1", pointsReturn[0][1]);
  console.log("sssss2", pointsReturn[1][1]);
  
    pointsReturn.push(nearest_road_arrp[]);
  
  res.json(pointsReturn);
});

// router.post("/search/name", (req, res) => {

//   let searchString = `${req.body.name}`
//   let user = usersData.filter(item => item.title.toLowerCase().includes(searchString.toLowerCase()))
//   console.log(req.body.name, user);
//   res.json(user)

// });

// router.post("/search/id", (req, res) => {

//   let searchString = `${req.body.id}`
//   let user = usersData.filter(item => item.id === searchString)[0];
//   console.log(req.body.name, user);
//   res.json(user)

// });

module.exports = router;
