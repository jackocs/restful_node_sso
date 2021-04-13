#!/usr/bin/env python3

import json
from json import loads
import os
from pymongo import MongoClient
import sys
from influxdb import InfluxDBClient

REDIS_PASSWORD = os.popen("grep REDIS_PASSWORD /home/xIDM-SSO-Cent8/sso/idp/config/config.php |cut -f4 -d\"'\"").read().replace('\n','')
client = InfluxDBClient('127.0.0.1', 8086, 'admin', REDIS_PASSWORD, 'xidmsso')
select_clause = 'select * from containerlog ORDER BY time DESC LIMIT 1'
result = client.query(select_clause)
for point in result.get_points():
	time = point['time']
	#print(time)

try:
	select_clause = "select * from containerlog where time = '"+ time +"'"
	result = client.query(select_clause)
	i = 0
	up = 0
	down = 0
	status = "ok"
	container = {}
	for point in result.get_points():
		#print(point)
		if point['status'] == 'true':
			container[point['container']] = 'up'
			up = up + 1
		else:
			container[point['container']] = 'down'
			down = down + 1
			status = "warning"
		i = i+1
	if down == i:
		status = "critical"
	
	result_text = {
		"datetime": time,
		"status": str(status),
		"idp": container['idp'],
		"cache": container['cache'],
		"db": container['db'],
		"report": container['report']	
	}
	#print(result_text)
	result_json = json.dumps(result_text)
	print("ok#%s" % result_json)
	
except:
	print('fail#[]', end='')
