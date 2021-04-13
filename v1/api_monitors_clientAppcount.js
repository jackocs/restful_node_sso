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

router.get("/", function (req, res) {
  //var ord=req.params.orders.trim();
  try {
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
          //connection.query("select COUNT(*) as count from oauth_directory where id='"+ id +"'", function (error, results, fields) {
          connection.query(
            "SELECT COUNT(*) as count FROM oauth_clients WHERE client_types='oauth2'",
            function (error, results, fields) {
              if (error) {
                result = { status: "fail", result: error.message };
                return res.json(result);
              } else {
                //console.log('Query result: ', results[0].count);
                //if(results[0].count === 0){
                if (results[0].orders === 0) {
                  result = { status: "fail", result: "Null value error" };
                  return res.json(result);
                } else {
                  result = { status: "ok", result: results[0] };
                  return res.json(result);
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
