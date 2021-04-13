var express = require("express");
var router = express.Router();
var type, time, period, length;
var util = require("util");
var exec = require("child_process").exec;
var split = require("split-string");
var child;
let mysql = require("mysql");
var ldap = require("ldapjs");

router.get("/:id/:ob", function (req, res) {
  try {
    var id = req.params.id.trim();
    var ob = req.params.ob.trim();
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
            "select * from oauth_directory where id='" + id + "'",
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
                let ip = results[0].ip.trim();
                let port = results[0].port;
                let principal = results[0].principal.trim();
                let pw = results[0].pw;

                if (results[0].type.toLowerCase() === "ad") {
                  connection.query(
                    "select attribute from oauth_objectclasses where type='AD' and objectclass='" +
                      ob +
                      "' ",
                    function (error, results, fields) {
                      //            			connection.query("select * from oauth_objectclasses where type='AD'", function (error, results, fields) {
                      if (error) {
                        result = { status: "fail", result: error.message };
                        return res.json(result);
                      } else {
                        var list = [];
                        for (var i = results.length - 1; i >= 0; i--) {
                          list.push(results[i].attribute);
                        }
                        //console.log(JSON.parse(results[0].attribute));
                        //var arr = JSON.parse(results[0].attribute);
                        //console.log(Object.keys(arr));
                        //let result = {'status':'ok','result':arr};
                        //let result = {'status':'ok','result':Object.keys(arr)};
                        let result = { status: "ok", result: list.sort() };
                        res.json(result);
                      }
                    }
                  );
                } else {
                  connection.query(
                    "select value from oauth_conf where conf='secret_key'",
                    function (error, results, fields) {
                      if (error) {
                        result = { status: "fail", result: error.message };
                        return res.json(result);
                      } else {
                        let secret_key = results[0].value;
                        child = exec(
                          "php /home/restful_node_sso/v1/stringEncryption.php 'decrypt' " +
                            pw +
                            " " +
                            secret_key +
                            " ",
                          function (error, stdout, stderr) {
                            let secret_key_raw = stdout;
                            child = exec(
                              "perl /home/restful_node_sso/sh/scope_list_attribute.pl " +
                                ip +
                                " " +
                                port +
                                " " +
                                principal +
                                " " +
                                secret_key_raw +
                                " " +
                                ob,
                              function (error, stdout, stderr) {
                                let output = stdout.split("#");
                                var arr = JSON.parse(output[1]);
                                let result = {
                                  status: output[0].trim(),
                                  result: arr,
                                };
                                res.json(result);

                                if (error !== null) {
                                  result = { status: "fail", result: error };
                                  return res.json(result);
                                }
                              }
                            );
                          }
                        );
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
