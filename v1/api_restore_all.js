var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var child;

router.get("/:path", function (req, res) {
  try {
    var path = req.params.path.trim();
    child = exec(
      "/home/restful_node_sso/sh/restore_all.sh " + path,
      function (error, stdout, stderr) {
        try {
          let output = stdout.split("#");
          var arr = JSON.parse(output[1]);
          result = { status: output[0].trim(), result: arr };
          res.json(result);
        } catch (error) {
          //console.error(error);
          result = { status: "fail", result: "[]" };
          return res.json(result);
        }
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
        if (error !== null) {
          console.log("exec error: " + error);
        }
      }
    );
  } catch (error) {
    //console.error(error);
    result = { status: "fail", result: "[]" };
    return res.json(result);
  }
});

module.exports = router;
