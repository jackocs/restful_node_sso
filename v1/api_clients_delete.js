var express = require('express');
var router = express.Router();
var type,time,period,length;
var util = require('util');
var exec = require('child_process').exec;
var split = require('split-string');
var child;
let mysql = require('mysql');
var ldap = require('ldapjs');

router.get('/:client_id', function (req, res) {
	var client_id=req.params.client_id.trim();
	var config = require('../config.js');

	if (client_id === 'bd4de2d6455972c22dd1f1e7bee1a120e19'){
		result = {'status':'fail','result': 'Client ID portal'};
		return res.json(result);                                                                                               
	}

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
            connection.query("select * from oauth_clients where client_id='"+ client_id +"'", function (error, results, fields) {
                if (error) {                                                                                          
                    result = {'status':'fail','result': error.message};                                                                     
                    return res.json(result);                                                                                                                    
		}else if (!results.length) {
                    result = {'status':'fail','result': 'null value'};                                                                     
                    return res.json(result);
                }else {  
            			connection.query("DELETE FROM oauth_clients where client_id='"+ client_id +"'", function (error, results, fields) {
                			if (error) {	
						let result = {'status':'fail','result': error.message};
						return res.json(result); 
					}else{

						exec("php /home/xIDM-SSO-Cent8/sso/idp/config/mysql2redis_local.php oauth_clients delete "+ client_id , function (error, stdout, stderr) {
                                                        if (error !== null) {
                                                                result = {'status':'fail','result': error};
                                                                return res.json(result);
                                                        }else{
                                                                result = {'status':'ok','result':''};
                                                                return res.json(result);
                                                        }
                                                });
						//let result = {'status':'ok','result':''};
						//res.json(result);
					}                                                                                                                   

	  			});

		}
	  });

	});

	});
/*
	child = exec("/home/restful_node_sso/sh/scope_list.pl "+id, function (error, stdout, stderr) {
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
*/
});

module.exports = router;
