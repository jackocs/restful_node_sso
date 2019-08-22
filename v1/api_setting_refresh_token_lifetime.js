var express = require('express');
var router = express.Router();
var type,time,period,length;
var util = require('util');
var exec = require('child_process').exec;
var split = require('split-string');
var child;

router.get('/:second', function (req, res) {
	var second=req.params.second.trim();
	if(Math.round(second) != second) {
            result = {'status':'fail','result': 'Variable is not an integer!'};
            return res.json(result);
}
	child = exec("/home/restful_node_sso/sh/setting_refresh_token_lifetime.pl "+ second , function (error, stdout, stderr) {
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
});

module.exports = router;
