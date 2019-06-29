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
    //allows: ['127.0.0.1','158.108.253.224'],
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

	//Add Router
	app.use('/api/v1/permission',permission_router);
	//app.use('/api/v1/top',require('./v1/api_top.js'));
	app.use('/api/v1/node',require('./v1/api_node.js'));
	//DIR
	app.use('/api/v1/ckSlpad',require('./v1/api_ckSlpad.js'));
	app.use('/api/v1/dir/install',require('./v1/api_dir_install.js'));
	app.use('/api/v1/dir/del',require('./v1/api_dir_del.js'));
	app.use('/api/v1/dir/restart',require('./v1/api_dir_restart.js'));
	app.use('/api/v1/dir/stop',require('./v1/api_dir_stop.js'));
        app.use('/api/v1/dir/start',require('./v1/api_dir_start.js'));
        app.use('/api/v1/dir/resync',require('./v1/api_dir_resync.js'));
	//Count User
	app.use('/api/v1/users/count',require('./v1/api_users_count.js'));

	app.get('/api/v1/query',function(req, res){
		res.send(JSON.stringify(req.query));
		console.log(req.query);
		//res.send(req.body);
	});

	app.listen(port);
