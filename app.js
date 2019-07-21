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

	//Add Router
	app.use('/api/v1/permission',permission_router);
	app.use('/api/v1/node',require('./v1/api_node.js'));
	// Directory
	app.use('/api/v1/dir/listAll',require('./v1/api_dir_listAll.js'));
	app.use('/api/v1/dir/testAuth',require('./v1/api_dir_testAuth.js'));
	app.use('/api/v1/dir/add',require('./v1/api_dir_add.js'));
	app.use('/api/v1/dir/delete',require('./v1/api_dir_delete.js'));
	app.use('/api/v1/dir/edit',require('./v1/api_dir_edit.js'));
	

	app.get('/api/v1/query',function(req, res){
		res.send(JSON.stringify(req.query));
		console.log(req.query);
		//res.send(req.body);
	});

	app.listen(port);
