var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var child;

router.get("/", function (req, res) {
  try {
    var id = req.query.id;
    child = exec(
      "/home/restful_node_sso/sh/ckNode.sh " + id,
      function (error, stdout, stderr) {
        try {
          let output = stdout.split(" ");
          //let respond = {'status':output[0].trim()};
          let respond = output[0].trim();
          //res.send(JSON.stringify(respond));
          res.send(respond);
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
