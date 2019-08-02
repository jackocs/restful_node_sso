var express = require('express');
var router = express.Router();
var type,time,period,length;
var util = require('util')
var exec = require('child_process').exec;
var child;
var bodyParser = require('body-parser');
var split = require('split-string');
let mysql = require('mysql');

router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.post('', function(req, res) {
    if (req.body.scope === undefined || req.body.scope === null || 
        req.body.attribute === undefined || req.body.attribute === null
        ){
            result = {'status':'fail','result': 'Undefined Value Found'};
            return res.json(result);
    }

    var scope=req.body.scope.trim().toLowerCase();
    var attribute=req.body.attribute.trim();

    var config = require('../config.js');
    child = exec("docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' db ", function (error, stdout, stderr) {
	if (error !== null) {
		result = {'status':'fail','result': error};
                return res.json(result);
	}
	config.host = stdout.trim();

        let connection = mysql.createConnection(config);
        connection.connect(function(err) {
            if (err) {
		result = {'status':'fail','result': err.stack};
                return res.json(result);
            }
	    connection.query("select COUNT(*) as count from oauth_scopes where scope='"+ scope +"'", function (error, results, fields) {                                                      
		if (error) {
                    result = {'status':'fail','result': error.message};                                                                     
                    return res.json(result);                                                                                                 
		}else{
		    //console.log('Query result: ', results[0].count);
		    if(results[0].count === 0){
                    	result = {'status':'fail','result':'null value' };                                                                     
                    	return res.json(result);                                                                                                
		    }else{
				var data = '{"'+scope+'":'+attribute+'}';
	     	        	//var sql = "UPDATE oauth_scopes SET attribute=? WHERE scope=?";
	     	        	var sql = "UPDATE oauth_scopes SET attribute='"+ data +"' WHERE scope=?";
	    	        	//var values = [[data, scope],];
	    	        	var values = [[scope],];
	    			connection.query(sql, [values], function (error, results, fields) {
					if (error) {
                    				result = {'status':'fail','result': error.message};
                    				return res.json(result);
					}else{
                    				result = {'status':'ok','result':''};
                    				return res.json(result);
					}
	    			});

		    }
		}
	
	    }); 
    	});

    });
});

module.exports = router;
