var express = require('express');
var router = express.Router();
var type,time,period,length;
var util = require('util');
var exec = require('child_process').exec;
var split = require('split-string');
var child;

router.get('/:domain', function (req, res) {
	var domain=req.params.domain.trim();	
	child = exec("/home/restful_node_sso/sh/dir_listdomain.pl "+ domain, function (error, stdout, stderr) {
		let output = stdout.split('#');
		var arr = JSON.parse(output[1]);
		let result = {'status':output[0].trim(),'result':arr};
		
		res.json(result);
		//res.json(the_json_array);
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
	  if (error !== null) {
		console.log('exec error: ' + error);
	  }
	});
});

module.exports = router;