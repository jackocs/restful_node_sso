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
    if (req.body.attribute === undefined || req.body.attribute === null || 
        req.body.description === undefined || req.body.description === null
        ){
            result = {'status':'fail','result': 'Undefined Value Found'};
            return res.json(result);
    }

    var attribute=req.body.attribute.trim().toLowerCase();
    var description=req.body.description.trim();

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
	    connection.query("select COUNT(*) as count from oauth_objectclasses where attribute='"+ attribute +"'", function (error, results, fields) {                                                      
		if (error) {
                    result = {'status':'fail','result': error.message};                                                                     
                    return res.json(result);                                                                                                 
		}else{
		    if(results[0].count > 0){
                    	result = {'status':'fail','result':'already exists error' };                                                                     
                    	return res.json(result);                                                                                                
		    }else{
	     	        	var sql = "INSERT INTO oauth_objectclasses (attribute,objectclass,type,description,is_default) VALUES ?";
	    	        	var values = [[attribute, 'user', 'AD', description, 0],];
	    			connection.query(sql, [values], function (error, results, fields) {
					if (error) {
                    				result = {'status':'fail','result': error.message};
                    				return res.json(result);
					}else{
						exec("php /home/xIDM-SSO-Cent8/sso/idp/config/mysql2redis_local.php oauth_objectclasses add "+ attribute, function (error, stdout, stderr) {
                                                        if (error !== null) {
                                                                result = {'status':'fail','result': error};
                                                                return res.json(result);
                                                        }else{
                                                                result = {'status':'ok','result':''};
                                                                return res.json(result);
                                                        }
                                                });
					}
	    			});
		    }
		}
	
	    }); 
    	});

    });
});

module.exports = router;
