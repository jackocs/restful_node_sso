var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var split = require("split-string");
var child;
let mysql = require("mysql");
var ldap = require("ldapjs");

router.get("/:attribute", function (req, res) {
  try {
    var attribute = req.params.attribute.trim().toLowerCase();
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
            "select * from oauth_objectclasses where attribute='" +
              attribute +
              "'",
            function (error, results, fields) {
              if (error) {
                result = { status: "fail", result: error.message };
                return res.json(result);
              } else if (!results.length) {
                result = { status: "fail", result: "null value" };
                return res.json(result);
                //		}else if (!results[0].something) {
                //                    result = {'status':'fail','result': 'null'};
                ///                    return res.json(result);
              } else {
                connection.query(
                  "DELETE FROM oauth_objectclasses where attribute='" +
                    attribute +
                    "'",
                  function (error, results, fields) {
                    if (error) {
                      let result = { status: "fail", result: error.message };
                      return res.json(result);
                    } else {
                      exec(
                        "php /home/xIDM-SSO-Cent8/sso/idp/config/mysql2redis_local.php oauth_objectclasses delete " +
                          attribute,
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
      }
    );

  } catch (error) {
    //console.error(error);
    result = { status: "fail", result: "[]" };
    return res.json(result);
  }
});

module.exports = router;
