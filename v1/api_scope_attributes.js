var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var split = require("split-string");
var child;
let mysql = require("mysql");
var ldap = require("ldapjs");

router.get("/:scope", function (req, res) {
  try {
    var scope = req.params.scope.trim();
    var config = require("../config.js");
    child = exec(
      "docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' db ",
      function (error, stdout, stderr) {
        if (error !== null) {
          result = { status: "fail", result: error };
          return res.json(result);
        }
        config.host = stdout.trim();

        let connection = mysql.createConnection(config);
        connection.connect(function (err) {
          if (err) {
            result = { status: "fail", result: err.stack };
            return res.json(result);
          }
          connection.query(
            "select * from oauth_scopes where scope='" + scope + "'",
            function (error, results, fields) {
              if (error) {
                result = { status: "fail", result: error.message };
                return res.json(result);
              } else if (!results.length) {
                result = { status: "fail", result: "[]" };
                return res.json(result);
                //		}else if (!results[0].something) {
                //                    result = {'status':'fail','result': 'null'};
                ///                    return res.json(result);
              } else {
                let attribute = JSON.parse(results[0].attribute);
                let result = { status: "ok", result: attribute };
                res.json(result);
              }
            }
          );
        });
      }
    );
  } catch (error) {
    //console.error(error);
    result = { status: "fail", result: error };
    return res.json(result);
  }
});

module.exports = router;
