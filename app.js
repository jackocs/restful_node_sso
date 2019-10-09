var express = require('express'),
    AccessControl = require('express-ip-access-control'),
    ipaddr = require('ipaddr.js'),
    validator = require('validator'),
    fs = require("fs"),
    bodyParser = require('body-parser');
var port_no = 3000;
var permit_file = './permit.json';
var port = process.env.PORT || port_no;
var permit_list = [];

//////// Permission Router Begin
function permission_load(){
	try{
		permit_list = require(permit_file).ip;
	}catch(err){
		permit_list = ["127.0.0.1"];
	}
}
permission_load();

var ac_options = {
    mode: 'allow',
    denys: [],
    allows: permit_list,
    forceConnectionAddress: false,
    log: function(clientIp, access) {
        console.log(clientIp + (access ? ' accessed.' : ' denied.'));
    },
 
    statusCode: 401,
    redirectTo: '',
    message: '{"error":"Unauthorized"}'
};

//var permit_list = ac_options.allows;
var permission_router = express.Router();
var starttime,type;

var unique = function(list)
{
	var n = {};
	for(var i = list.length - 1 ; i >= 0;i--) 
	{
		if (n[list[i]] == undefined ) 
			n[list[i]] = true; 
		else
			list.splice(i,1);
	}
	delete n;
	return list;
}

function permission_save(){
	console.log(permit_list);
	fs.writeFileSync(permit_file, JSON.stringify({'ip':permit_list}));
}

permission_router.get('/', function (req, res) {
  res.send(JSON.stringify({'permit_list':permit_list}));
});

permission_router.post('/:ip', function (req, res) {
  if (req.params.ip == undefined || !validator.isIP(req.params.ip)){
	res.send(JSON.stringify({'error':'parameter is missing or malformat'}));
	return;
  }
	
  permit_list.push(req.params.ip);
  unique(permit_list);
  console.log('allow ip '+req.params.ip);
  res.send(JSON.stringify({'allow_ip:':req.params.ip}));
  permission_save();
});

permission_router.delete('/:ip', function (req, res) {
  if (req.params.ip == undefined || !validator.isIP(req.params.ip)){
	res.send(JSON.stringify({'error':'parameter is missing or malformat'}));
	return;
  }
  var index = permit_list.indexOf(req.params.ip);	
  if(index >= 0){
	permit_list.splice(index,1);
  }
  console.log('disallow ip '+req.params.ip);
//  res.send(JSON.stringify({'disallow ip':req.params.ip}));
  let respond = {'disallow ip':req.params.ip};
  res.json(respond);
  permission_save();
});

///////// end permission Router
var	app = express();
	app.use(AccessControl(ac_options));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	// Add Router
	app.use('/api/v1/permission',permission_router);
	app.use('/api/v1/node',require('./v1/api_node.js'));
	// Directory
	app.use('/api/v1/dir/listAll',require('./v1/api_dir_listAll.js'));
	app.use('/api/v1/dir',require('./v1/api_dir_list.js'));
	app.use('/api/v1/dir/listdomain',require('./v1/api_dir_listdomain.js'));
	app.use('/api/v1/dir/testAuth',require('./v1/api_dir_testAuth.js'));
	app.use('/api/v1/dir/add',require('./v1/api_dir_add.js'));
	app.use('/api/v1/dir/delete',require('./v1/api_dir_delete.js'));
	app.use('/api/v1/dir/edit',require('./v1/api_dir_edit.js'));
	app.use('/api/v1/dir/status',require('./v1/api_dir_status.js'));
	app.use('/api/v1/dir/orders',require('./v1/api_dir_orders.js'));
	// Scope
	app.use('/api/v1/scope/listObject',require('./v1/api_scope_list_object.js'));
	app.use('/api/v1/scope/listAttributes',require('./v1/api_scope_list_attributes.js'));
	app.use('/api/v1/scope/listAttributesAll',require('./v1/api_scope_list_attributes_all.js'));
	app.use('/api/v1/scope/listAll',require('./v1/api_scope_listAll.js'));
	app.use('/api/v1/scope/list',require('./v1/api_scope_list.js'));
	app.use('/api/v1/scope/add',require('./v1/api_scope_add.js'));
	app.use('/api/v1/scope/delete',require('./v1/api_scope_delete.js'));
	app.use('/api/v1/scope/edit',require('./v1/api_scope_edit.js'));
	app.use('/api/v1/scope/attributes',require('./v1/api_scope_attributes.js'));
	// Group Policy
	app.use('/api/v1/groupPolicy/list',require('./v1/api_groupPolicy_list.js'));
	app.use('/api/v1/groupPolicy/listbyname',require('./v1/api_groupPolicy.js'));
	app.use('/api/v1/groupPolicy/listAll',require('./v1/api_groupPolicy_listAll.js'));
	app.use('/api/v1/groupPolicy/add',require('./v1/api_groupPolicy_add.js'));
	app.use('/api/v1/groupPolicy/edit',require('./v1/api_groupPolicy_edit.js'));
	app.use('/api/v1/groupPolicy/delete',require('./v1/api_groupPolicy_delete.js'));
	// Clients
	app.use('/api/v1/clients/listAll',require('./v1/api_clients_listAll.js'));
	app.use('/api/v1/clients',require('./v1/api_clients.js'));
	app.use('/api/v1/clients/add',require('./v1/api_clients_add.js'));
	app.use('/api/v1/clients/edit',require('./v1/api_clients_edit.js'));
	app.use('/api/v1/clients/delete',require('./v1/api_clients_delete.js'));
	app.use('/api/v1/clients/status',require('./v1/api_clients_status.js'));
	// Applications
	app.use('/api/v1/applications/listAll',require('./v1/api_applications_listAll.js'));
	app.use('/api/v1/applications',require('./v1/api_applications.js'));
	app.use('/api/v1/applications/edit',require('./v1/api_applications_edit.js'));
	app.use('/api/v1/applications/status',require('./v1/api_applications_status.js'));
	// Monitor
	app.use('/api/v1/monitors/concurrent',require('./v1/api_monitors_concurrent.js'));
	app.use('/api/v1/monitors/webResponse',require('./v1/api_monitors_webResponse.js'));
	app.use('/api/v1/monitors/docker',require('./v1/api_monitors_docker.js'));
	// Report
	app.use('/api/v1/report/concurrent',require('./v1/api_report_concurrent.js'));
	app.use('/api/v1/report/users',require('./v1/api_report_users.js'));
	app.use('/api/v1/report/apps/top',require('./v1/api_report_appsTop.js'));
	app.use('/api/v1/report/apps',require('./v1/api_report_apps.js'));
	// Backup
	app.use('/api/v1/backup/list',require('./v1/api_backup_list.js'));
	app.use('/api/v1/backup/all',require('./v1/api_backup_all.js'));
	app.use('/api/v1/backup/delete',require('./v1/api_backup_delete.js'));
	app.use('/api/v1/backup/files',require('./v1/api_backup_files.js'));
	app.use('/api/v1/restore/all',require('./v1/api_restore_all.js')); // on local
	app.use('/api/v1/restore/files',require('./v1/api_restore_files.js')); // on upload
	// General Settings
	app.use('/api/v1/setting/get/timeout',require('./v1/api_setting_gettimeout.js')); // on upload
	app.use('/api/v1/setting/timeout',require('./v1/api_setting_timeout.js')); // on upload
	app.use('/api/v1/setting/get/access_lifetime',require('./v1/api_setting_getaccess_lifetime.js')); // on upload
	app.use('/api/v1/setting/access_lifetime',require('./v1/api_setting_access_lifetime.js')); // on upload
	app.use('/api/v1/setting/get/refresh_token_lifetime',require('./v1/api_setting_getrefresh_token_lifetime.js')); // on upload
	app.use('/api/v1/setting/refresh_token_lifetime',require('./v1/api_setting_refresh_token_lifetime.js')); // on upload
	app.use('/api/v1/setting/get/claims_supported',require('./v1/api_setting_getclaims_supported.js'));
	app.use('/api/v1/setting/claims_supported',require('./v1/api_setting_claims_supported.js'));
	app.use('/api/v1/setting/get/directory_domain',require('./v1/api_setting_getdirectory_domain.js'));
	app.use('/api/v1/setting/directory_domain',require('./v1/api_setting_directory_domain.js'));
	app.use('/api/v1/setting/get/directory_mode',require('./v1/api_setting_getdirectory_mode.js'));
	app.use('/api/v1/setting/directory_mode',require('./v1/api_setting_directory_mode.js'));
	// EndPoint Summary
	app.use('/api/v1/endpoint/summary',require('./v1/api_endpoint_summary.js'));

	app.get('/api/v1/query',function(req, res){
		res.send(JSON.stringify(req.query));
		console.log(req.query);
		//res.send(req.body);
	});

	app.listen(port);
