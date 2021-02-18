var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var split = require("split-string");
var child;

router.get("/:apps/:start/:end", function (req, res) {
  //router.get('/', function (req, res) {

  var apps = req.params.apps.trim();
  var start = req.params.start.trim();
  var end = req.params.end.trim();

  child = exec(
    "/home/restful_node_sso/sh/report_authSummaryApps.py " +
      apps +
      " " +
      start +
      " " +
      end,
    function (error, stdout, stderr) {
      let output = stdout.split("#");
      try {
        result = { status: output[0].trim(), result: output[1].trim() };
        res.json(result);
      } catch (error) {
        //console.error(error);
        result = { status: "fail", result: error };
        return res.json(result);
      }
      console.log("stdout: " + stdout);
      console.log("stderr: " + stderr);
      if (error !== null) {
        console.log("exec error: " + error);
      }
    }
  );
});

module.exports = router;
