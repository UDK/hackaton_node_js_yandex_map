const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const app = express();

app.use(express.static(path.join(__dirname, "public4")));
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public4/index.html"));
});

// require routers
let users = require("./routers/users");
let documents = require("./routers/documents");
let drugs = require("./routers/drugs");
let roads = require("./routers/roads");

app.get("/api/", (req, res) => {
  res.json({ hello: "world" });
});

app.use("/api/users", users);
app.use("/api/documents", documents);
app.use("/api/drugs", drugs);
app.use("/api/roads", roads);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server on port " + port);
});
