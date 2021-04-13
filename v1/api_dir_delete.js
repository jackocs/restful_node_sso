var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var child;
//var bodyParser = require('body-parser');
var split = require("split-string");
let mysql = require("mysql");

//router.use(bodyParser.json()); // support json encoded bodies
//router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.get("/:id", function (req, res) {
  if (req.params.id === undefined || req.params.id === null) {
    result = { status: "fail", result: "Undefined Value Found" };
    return res.json(result);
  }
  try {
    var id = req.params.id.trim();

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
            "select COUNT(*) as count from oauth_directory where id='" +
              id +
              "'",
            function (error, results, fields) {
              if (error) {
                result = { status: "fail", result: error.message };
                return res.json(result);
              } else {
                //console.log('Query result: ', results[0].count);
                if (results[0].count === 0) {
                  result = { status: "fail", result: "Null value error" };
                  return res.json(result);
                } else {
                  var sql = "DELETE FROM oauth_directory WHERE id='" + id + "'";
                  connection.query(sql, function (error, results, fields) {
                    if (error) {
                      result = { status: "fail", result: error.message };
                      return res.json(result);
                    } else {
                      exec(
                        "php /home/xIDM-SSO-Cent8/sso/idp/config/mysql2redis_local.php oauth_directory delete " +
                          id,
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
                      //result = {'status':'ok','result':''};
                      //return res.json(result);
                    }
                  });
                }
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
