#!/usr/bin/env python3

import json
from json import loads
import os
from pymongo import MongoClient
import sys
from influxdb import InfluxDBClient

REDIS_PASSWORD = os.popen("grep REDIS_PASSWORD /home/xIDM-SSO-Cent8/sso/idp/config/config.php |cut -f4 -d\"'\"").read().replace('\n','')
client = InfluxDBClient('127.0.0.1', 8086, 'admin', REDIS_PASSWORD, 'xidmsso')
select_clause = 'select * from idpnode ORDER BY time DESC LIMIT 1'
result = client.query(select_clause)
for point in result.get_points():
	time = point['time']
	#print(time)

try:
	select_clause = "select * from idpnode where time = '"+ time +"'"
	result = client.query(select_clause)
	i = 0
	up = 0
	down = 0
	status = "ok"
	list_up = []
	list_down = []
	for point in result.get_points():
		#print(point)
		if point['status'] == 'UP':
			up = up + 1
			list_up.append(point['idp'])
		else:
			down = down + 1
			status = "warning"
			list_down.append(point['idp'])
		i = i+1
	if down == i:
		status = "critical"

	result_text = {
	"datetime": time,
	"nodes": i,
	"up": up,
	"down": down,
	"status": str(status),
	"list_up": list_up,
	"list_down": list_down
	}
	#print(result_text)
	print("ok#%s" % result_text)
except:
	print('fail#["Unknown query"]', end='')
