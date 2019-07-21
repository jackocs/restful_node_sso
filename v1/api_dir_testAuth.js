var express = require('express');
var router = express.Router();
var type,time,period,length;
var util = require('util')
var exec = require('child_process').exec;
var child;
var bodyParser = require('body-parser');
var ldap = require('ldapjs');
var split = require('split-string');

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

    // LDAP Connection Settings
    var ldapt = 'ldap';
    if (port === 636) {
	ldapt = 'ldaps';
    }
    var server = ldapt+'://'+ip+':'+port;

    // Create client and bind
    var client = ldap.createClient({
        url: server,
	timeout: 5000,
	connectTimeout: 10000
    });

    client.on('error', function(err) {
        result = {'status':'fail','result': err.message};
        return res.json(result);
    });

    const searchOptions = {
          scope: "sub",
          filter: principal,
          //filter: 'uid=admin',
    	  attributes: ['dn', 'sn', 'cn']
    };

    client.bind(principal, pw, function(err) {
        if (err) {
            result = {'status':'fail','result': err.lde_message};
            return res.json(result);
        }else{
	    client.search(base_dn, searchOptions, function(err, result) {
      		result.on('searchEntry', function (entry) {
			console.log(entry.object.dn);
      		});
      		result.on('error', function (err) {
                    result = {'status':'fail','result': err.lde_message};
                    return res.json(result);
      		});
      		result.on('end', function (result) {
                    result = {'status':'ok','result':''};
                    return res.json(result);
      		});
    	    });
        } 
    });
});

module.exports = router;
