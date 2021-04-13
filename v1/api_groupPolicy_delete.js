var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var split = require("split-string");
var child;
let mysql = require("mysql");
var ldap = require("ldapjs");

router.get("/:group_policy_id", function (req, res) {
  var group_policy_id = req.params.group_policy_id.trim();
  var config = require("../config.js");
  child = exec(
    "docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' db ",
    function (error, stdout, stderr) {
      if (error !== null) {
        result = { status: "fail", result: error };
        return res.json(result);
      }
      try {
        config.host = stdout.trim();

        let connection = mysql.createConnection(config);
        connection.connect(function (err) {
          if (err) {
            result = { status: "fail", result: err.stack };
            return res.json(result);
          }
          connection.query(
            "select * from oauth_group_policy where group_policy_id='" +
              group_policy_id +
              "'",
            function (error, results, fields) {
              if (error) {
                result = { status: "fail", result: error.message };
                return res.json(result);
              } else if (!results.length) {
                result = { status: "fail", result: "null value" };
                return res.json(result);
              } else {
                connection.query(
                  "DELETE FROM oauth_group_policy where group_policy_id='" +
                    group_policy_id +
                    "'",
                  function (error, results, fields) {
                    if (error) {
                      let result = { status: "fail", result: error.message };
                      return res.json(result);
                    } else {
                      exec(
                        "php /home/xIDM-SSO-Cent8/sso/idp/config/mysql2redis_local.php oauth_group_policy delete " +
                          group_policy_id,
                        function (error, stdout, stderr) {
                          if (error !== null) {
                            result = { status: "fail", result: error };
                            return res.json(result);
                          } else {
                            result = { status: "ok", result: "" };
                            return res.json(result);
                          }
                        }
                      );
                      //let result = {'status':'ok','result':''};
                      //res.json(result);
                    }
                  }
                );
              }
            }
          );
        });
      } catch (error) {
        //console.error(error);
        result = { status: "fail", result: "[]" };
        return res.json(result);
      }
    }
  );
  
});

module.exports = router;
