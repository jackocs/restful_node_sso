var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var split = require("split-string");
var child;

router.get("/:users/:domain/:start/:stop", function (req, res) {
  try {
    var users = req.params.users.trim().toLowerCase();
    var domain = req.params.domain.trim().toLowerCase();
    var start = req.params.start.trim();
    var stop = req.params.stop.trim();

    child = exec(
      "/home/restful_node_sso/sh/userSelfService_viewLoginHistory.py " +
        users +
        " " +
        domain +
        " " +
        start +
        " " +
        stop,
      function (error, stdout, stderr) {
        try {
          let output = stdout.split("#");
          var myObj = JSON.parse(output[1].trim());
          result = { status: output[0].trim(), result: myObj };
          res.json(result);
        } catch (er) {
          result = { status: "fail", result: "[]" };
          return res.json(result);
        }

        //res.json(the_json_array);
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
