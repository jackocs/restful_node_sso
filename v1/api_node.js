var express = require('express');
var router = express.Router();
var type,time,period,length;
var util = require('util');
var exec = require('child_process').exec;
var child;

router.get('/', function (req, res) {
var id=req.query.id
child = exec("/home/restful_node_slave/sh/ckNode.sh "+ id, function (error, stdout, stderr) {
	let output = stdout.split(' ');
	//let respond = {'status':output[0].trim()};
	let respond = output[0].trim();
        //res.send(JSON.stringify(respond));
        res.send(respond);
  console.log('stdout: ' + stdout);
 console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});
});

module.exports = router;
