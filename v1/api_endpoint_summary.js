var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var child;

router.get("/", function (req, res) {
  child = exec(
    "/home/restful_node_sso/sh/endpoint_summary.py ",
    function (error, stdout, stderr) {
      try {
        let output = stdout.split("#");
        //result = {'status':output[0].trim(),'result':output[1]};
        //res.json(result);
        var arr = JSON.parse(output[1]);
        let result = { status: output[0].trim(), result: arr };
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
});

module.exports = router;
