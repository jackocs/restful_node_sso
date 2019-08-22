var express = require('express');
var router = express.Router();
var type,time,period,length;
var util = require('util');
var exec = require('child_process').exec;
var split = require('split-string');
var child;

router.get('/:client_id/:statuss', function (req, res) {
	var client_id=req.params.client_id.trim();
	var st=req.params.statuss.trim();
	var statuss=parseInt(st, 10);
    if(statuss === 0 || statuss === 1){
	child = exec("/home/restful_node_sso/sh/applications_status.pl "+ client_id +" "+ statuss , function (error, stdout, stderr) {
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
            result = {'status':'fail','result': 'Variable is not an integer!'};
            return res.json(result);
    }
});

module.exports = router;
