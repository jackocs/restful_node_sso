var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var child;

router.get("/:folder", function (req, res) {
  try {
    var folder = req.params.folder.trim();
    child = exec(
      "/home/restful_node_sso/sh/restore_files.sh " + folder,
      { maxBuffer: 8192 * 2048 },
      function (error, stdout, stderr) {
        try {
          let file = stdout.trim();
          //res.send(respond);
          res.download(file);
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
