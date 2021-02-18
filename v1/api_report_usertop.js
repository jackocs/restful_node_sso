var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var split = require("split-string");
var child;

router.get("/:tops/:authtype/:start/:stop", function (req, res) {
  var tops = req.params.tops.trim();
  var authtype = req.params.authtype.trim();
  var start = req.params.start.trim();
  var stop = req.params.stop.trim();

  child = exec(
    "/home/restful_node_sso/sh/report_usertop.py " +
      tops +
      " " +
      authtype +
      " " +
      start +
      " " +
      stop,
    function (error, stdout, stderr) {

      try {
        let output = stdout.split("#");
        result = { status: output[0].trim(), result: output[1].trim() };
        res.json(result);
      } catch (er) {
        result = { status: "fail", result: er };
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
});

module.exports = router;
