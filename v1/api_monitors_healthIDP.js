var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var split = require("split-string");
var child;

router.get("/", function (req, res) {
  //var detail=req.params.detail.trim();
  child = exec(
    "/home/restful_node_sso/sh/monitors_healthIDP.py",
    function (error, stdout, stderr) {
      try {
        let output = stdout.split("#");
        result = { status: output[0].trim(), result: output[1].trim() };
        res.json(result);
      } catch (error) {
        //console.error(error);
        result = { status: "fail", result: error };
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
