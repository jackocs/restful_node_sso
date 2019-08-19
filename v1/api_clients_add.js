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
    if (req.body.client_name === undefined || req.body.client_name === null || 
        req.body.client_details === undefined || req.body.client_details === null ||
        req.body.redirect_uri === undefined || req.body.redirect_uri === null ||
        req.body.scope === undefined || req.body.scope === null ||
        req.body.group_policy_id === undefined || req.body.group_policy_id === null
        ){
            result = {'status':'fail','result': 'Undefined Value Found'};
            return res.json(result);
    }

    var client_name=req.body.client_name.trim();
    var client_details=req.body.client_details.trim(); 
    var redirect_uri=req.body.redirect_uri.trim(); 
    var scope=req.body.scope.trim(); 
    var group_policy_id=req.body.group_policy_id.trim(); 

    function generateHexString(length) {
	var ret = "";
	  while (ret.length < length) {
	    ret += Math.random().toString(16).substring(2);
	  }
	  return ret.substring(0,length);
    }

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
	    connection.query("select COUNT(*) as count from oauth_clients where client_name='"+ client_name +"'", function (error, results, fields) {                                                      
		if (error) {
                    result = {'status':'fail','result': error.message};                                                                     
                    return res.json(result);                                                                                                 
		}else{
		    //console.log('Query result: ', results[0].count);
		    if(results[0].count > 0){
                    	result = {'status':'fail','result':'already exists error' };                                                                     
                    	return res.json(result);                                                                                                
		    }else{

			var client_id = generateHexString(35); // 40-/64-bit WEP: 10 digit key // 104-/128-bit WEP: 26 digit key // 256-bit WEP: 58 digit key
			var client_secret = generateHexString(86); // 40-/64-bit WEP: 10 digit key // 104-/128-bit WEP: 26 digit key // 256-bit WEP: 58 digit key
			var grant_types = 'authorization_code';
//                    	result = {'status':'ok','result': client_id};
//                  	return res.json(result);

	     	        	var sql = "INSERT INTO oauth_clients (client_id,client_name,client_details,client_secret,redirect_uri,grant_types,scope,group_policy_id,client_use) VALUES ?";
	    	        	var values = [[client_id, client_name, client_details, client_secret, redirect_uri, grant_types, scope, group_policy_id, 1],];
	    			connection.query(sql, [values], function (error, results, fields) {
					if (error) {
                    				result = {'status':'fail','result': error.message};
                    				return res.json(result);
					}else{

						exec("php /home/xIDM-SSO/sso/idp/config/mysql2redis_local.php oauth_clients add "+ client_id, function (error, stdout, stderr) {
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
