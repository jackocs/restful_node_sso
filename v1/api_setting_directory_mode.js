var express = require('express');
var router = express.Router();
var type,time,period,length;
var util = require('util');
var exec = require('child_process').exec;
var split = require('split-string');
var child;

router.get('/:type', function (req, res) {
    var type=req.params.type.toLowerCase().trim();
    if (type === 'single' || type === 'multi'){
	child = exec("/home/restful_node_sso/sh/setting_directory_mode.pl "+ type , function (error, stdout, stderr) {
		let output = stdout.split('#');
		//result = {'status':output[0].trim(),'result':output[1].trim()};
		//res.json(result);
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
    }else{
            result = {'status':'fail','result': 'Undefined Value single/multi Found'};
            return res.json(result);
    }
});

module.exports = router;
