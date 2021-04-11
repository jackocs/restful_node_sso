var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var split = require("split-string");
var child;

router.get("/:hours", function (req, res) {
  var hours = req.params.hours.trim();
  child = exec(
    "/home/restful_node_sso/sh/report_concurrent.py " +
      hours , 
    function (error, stdout, stderr) {
      try {
        let output = stdout.split("#");
        var myObj = JSON.parse(output[1].trim());
        result = { status: output[0].trim(), result: myObj };
        //result = { status: output[0].trim(), result: output[1].trim() };
        res.json(result);
      } catch (er) {
        result = { status: "fail", result: er };
        return res.json(result);
      }

      //var arr = JSON.parse(output[1]);
      //let result = {'status':output[0].trim(),'result':arr};

      //res.json(result);
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
