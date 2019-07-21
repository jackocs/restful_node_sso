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
    if (req.body.ip === undefined || req.body.ip === null || 
        req.body.principal === undefined || req.body.principal === null ||
        req.body.pw === undefined || req.body.pw === null ||
        req.body.port === undefined || req.body.port === null ||
        req.body.filter === undefined || req.body.filter === null ||
        req.body.domain === undefined || req.body.domain === null ||
        req.body.base_dn === undefined || req.body.base_dn === null ||
        req.body.host === undefined || req.body.host === null ||
        req.body.type === undefined || req.body.type === null
        ){
            result = {'status':'fail','result': 'Undefined Value Found'};
            return res.json(result);
    }

    var ip=req.body.ip.trim();
    var principal=req.body.principal.trim().toLowerCase();
    var pw=req.body.pw.trim();
    var port=req.body.port.trim();
    var filter=req.body.filter.trim().toLowerCase();
    var domain=req.body.domain.trim().toLowerCase();
    var base_dn=req.body.base_dn.trim().toLowerCase();
    var host=req.body.host.trim();
    var type=req.body.type.trim();

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
	    connection.query("select COUNT(*) as count from oauth_directory where domain='"+ domain  +"' and ip='"+ ip +"' and base_dn='"+ base_dn  +"'", function (error, results, fields) {                                                      
		if (error) {
                    result = {'status':'fail','result': error.message};                                                                     
                    return res.json(result);                                                                                                
		}else{
		    //console.log('Query result: ', results[0].count);
		    if(results[0].count > 0){
                    	result = {'status':'fail','result':'already exists error' };                                                                     
                    	return res.json(result);                                                                                                
		    }else{
		
	   	        connection.query("select value from oauth_conf where conf='secret_key'", function (error, results, fields) {                                                      if (error) {
                    		result = {'status':'fail','result': error.message};                                                                     
                    		return res.json(result);                                                                                                
               		     }else{                                                                                                                      
		    	      let secret_key = results[0].value;
    		    	      child = exec("php /home/restful_node_sso/v1/stringEncryption.php 'encrypt' "+ pw +" "+ secret_key +" ", function (error, stdout, stderr) {
	         		let secret_key_raw = stdout;
	     	        	var sql = "INSERT INTO oauth_directory (domain,host,ip,base_dn,port,type,filter,principal,pw,is_default) VALUES ?";
	    	        	var values = [[domain, host, ip, base_dn, port, type, filter, principal, secret_key_raw, 1],];
	    			connection.query(sql, [values], function (error, results, fields) {
					if (error) {
                    				result = {'status':'fail','result': error.message};
                    				return res.json(result);
					}else{
                    				result = {'status':'ok','result':''};
                    				return res.json(result);
					}
	    			});
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
