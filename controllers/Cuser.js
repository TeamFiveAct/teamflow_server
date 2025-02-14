// const Visitor = require("../model/Visitor");
// const { errorlogs } = require("../utils/common");

exports.join = (req, res) => {
  console.log("user! join 컨트롤러!");
  res.send({ msg: "user" });
};
