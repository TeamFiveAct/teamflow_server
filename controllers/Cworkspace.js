// const Visitor = require("../model/Visitor");
// const { errorlogs } = require("../utils/common");

exports.index = (req, res) => {
  console.log("workspace 컨트롤러!");
  res.send({ msg: "workspace" });
};
