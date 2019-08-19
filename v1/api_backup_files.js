var express = require('express');
var router = express.Router();
var type,time,period,length;
var util = require('util')
var exec = require('child_process').exec;
var child;

router.get('/:folder', function (req, res) {
var folder=req.params.folder.trim();

child = exec("/home/restful_node_sso/sh/backup_files.sh "+folder , {maxBuffer: 8192 * 2048} , function (error, stdout, stderr) {
        //let output = stdout.split('#');
        //var arr = JSON.parse(output[1]);
        //result = {'status':output[0].trim(),'result':arr};
        //res.json(result);
        let file = stdout.trim();
	//let result = file.search(/fail/i);
	if(file.search(/fail/i) !== 0){
        	res.download(file);
	}else{
        	let output = stdout.split('#');
        	var arr = JSON.parse(output[1]);
        	result = {'status':output[0].trim(),'result':arr};
        	res.json(result);
	}
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});
});

module.exports = router;
