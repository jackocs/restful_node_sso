var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var child;
var bodyParser = require("body-parser");
var split = require("split-string");
let mysql = require("mysql");

router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.post("", function (req, res) {
  try {
    if (
      req.body.client_name === undefined ||
      req.body.client_name === null ||
      req.body.client_id === undefined ||
      req.body.client_id === null ||
      req.body.client_details === undefined ||
      req.body.client_details === null ||
      req.body.group_policy_id === undefined ||
      req.body.group_policy_id === null
    ) {
      result = { status: "fail", result: "Undefined Value Found" };
      return res.json(result);
    }

    var client_id = req.body.client_id.trim();
    var client_name = req.body.client_name.trim();
    var client_details = req.body.client_details.trim();
    var group_policy_id = req.body.group_policy_id.trim();

    var config = require("../config.js");
    child = exec(
      "docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' db ",
      function (error, stdout, stderr) {
        if (error !== null) {
          result = { status: "fail", result: "[]" };
          return res.json(result);
        }
        config.host = stdout.trim();

        let connection = mysql.createConnection(config);
        connection.connect(function (err) {
          if (err) {
            result = { status: "fail", result: "[]" };
            return res.json(result);
          }
          connection.query(
            "select COUNT(*) as count from oauth_clients where client_id='" +
              client_id +
              "'",
            function (error, results, fields) {
              if (error) {
                result = { status: "fail", result: "[]" };
                return res.json(result);
              } else {
                if (results[0].count === 0) {
                  result = { status: "fail", result: "null value" };
                  return res.json(result);
                } else {
                  var sql =
                    "UPDATE oauth_clients set client_name=?,client_details=?,group_policy_id=? WHERE client_id=?";
                  //var values = [[client_name, client_details, redirect_uri, scope, group_policy_id, client_id],];
                  connection.query(
                    sql,
                    [client_name, client_details, group_policy_id, client_id],
                    function (error, results, fields) {
                      if (error) {
                        result = { status: "fail", result: "[]" };
                        return res.json(result);
                      } else {
                        exec(
                          "php /home/xIDM-SSO-Cent8/sso/idp/config/mysql2redis_local.php oauth_clients edit " +
                            client_id,
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
                    }
                  );
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
