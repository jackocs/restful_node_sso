var express = require('express');
var router = express.Router();
var type,time,period,length;
var util = require('util')
var exec = require('child_process').exec;
var child;

router.get('/', function (req, res) {
child = exec("/home/restful_node_sso/sh/list_backup.sh " , function (error, stdout, stderr) {
        let output = stdout.split('#');
        var arr = JSON.parse(output[1]);
        result = {'status':output[0].trim(),'result':arr};
        res.json(result);
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});
});

module.exports = router;
