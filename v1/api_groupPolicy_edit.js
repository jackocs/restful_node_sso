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
    if (req.body.group_policy_id === undefined || req.body.group_policy_id === null || 
        req.body.group_policy_rule === undefined || req.body.group_policy_rule === null
        ){
            result = {'status':'fail','result': 'Undefined Value Found'};
            return res.json(result);
    }

    var group_policy_id=req.body.group_policy_id.trim();
    var group_policy_rule=req.body.group_policy_rule.trim();

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
	    connection.query("select COUNT(*) as count from oauth_group_policy where group_policy_id='"+ group_policy_id +"'", function (error, results, fields) {                                                      
		if (error) {
                    result = {'status':'fail','result': error.message};                                                                     
                    return res.json(result);                                                                                                
		}else{
		    if(results[0].count === 0){
			result = {'status':'fail','result':'null value' };
                    	return res.json(result);                                                                                                
		    }else{
//				var data = '{"'+scope+'":'+attribute+'}';
				var sql = "UPDATE oauth_group_policy SET group_policy_rule='"+ group_policy_rule +"' WHERE group_policy_id=?";
				var values = [[group_policy_id],];
//	     	        	var sql = "INSERT INTO oauth_group_policy (group_policy_name,group_policy_rule) VALUES ?";
//	    	        	var values = [[group_policy_name, group_policy_rule],];
	    			connection.query(sql, [values], function (error, results, fields) {
					if (error) {
                    				result = {'status':'fail','result': error.message};
                    				return res.json(result);
					}else{
						exec("php /home/xIDM-SSO-Cent8/sso/idp/config/mysql2redis_local.php oauth_group_policy edit "+ group_policy_id, function (error, stdout, stderr) {
                                                        if (error !== null) {
                                                                result = {'status':'fail','result': error};
                                                                return res.json(result);
                                                        }else{
                                                                result = {'status':'ok','result':''};
                                                                return res.json(result);
                                                        }
                                                });
                    				//result = {'status':'ok','result':''};
                    				//return res.json(result);
					}
	    			});
		    }
		}
	
	    }); 
    	});

    });
});

module.exports = router;
