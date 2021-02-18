var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var ldap = require("ldapjs");
var child;

router.get("/", function (req, res) {
  ///var host_id=req.query.id
  //child = exec("/home/restful_node/sh/ckSlpad.sh "+ ip, function (error, stdout, stderr) {
  child = exec(
    "/home/restful_node/sh/salfServices_query.sh ",
    function (error, stdout, stderr) {
      try {
        let output = stdout.split("#");
        let respond = { status: output[0].trim(), result: output[1].trim() };
        //res.send(JSON.stringify(respond)+req.query.host_id);
        //let respond = stdout.trim();
        //res.send(JSON.stringify(respond));
        res.send(respond);
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
