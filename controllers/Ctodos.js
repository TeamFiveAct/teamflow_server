// const Visitor = require("../model/Visitor");
// const { errorlogs } = require("../utils/common");

exports.index = (req, res) => {
  console.log("todos");
  res.send({ msg: "todos" });
};
