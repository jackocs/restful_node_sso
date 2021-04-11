#!/usr/bin/env python3

import json
from json import loads
import os
from pymongo import MongoClient
import sys
from influxdb import InfluxDBClient
from datetime import datetime, timedelta

def query_resources():
	REDIS_PASSWORD = os.popen("grep REDIS_PASSWORD /home/xIDM-SSO-Cent8/sso/idp/config/config.php |cut -f4 -d\"'\"").read().replace('\n','')
	client = InfluxDBClient('127.0.0.1', 8086, 'admin', REDIS_PASSWORD, 'xidmsso')
	select_clause = 'select * from idpresources ORDER BY time DESC LIMIT 1'
	result = client.query(select_clause)
	for point in result.get_points():
		#time = point['time']
		#print(point)
		ram_use = point['rtotal'] - point['ravailable']
		ram_percent = round(ram_use * 100 / point['rtotal'])
		storage_use = point['stotal'] - point['sfree']
		storage_percent = round(storage_use * 100 / point['stotal'])
		result_text = {
			"datetime": point['time'],
			"cpu_percent": str(point['vcpu']) + "%",
			"cpu_core": point['vcc'],
			"ram_use": str(round(ram_use / 1024 /1024 /1024, 2)) + "Gb",
			"ram_total": str(round(point['rtotal'] / 1024 /1024 /1024 , 2)) + "Gb",
			"ram_percent": str(ram_percent) + "%",
			"storage_total": str(round(point['stotal']/ 1024 /1024 /1024, 2)) + "Gb",
			"storage_use": str(round(storage_use / 1024 /1024 /1024, 2)) + "Gb",
			"storage_percent": str(storage_percent) + "%",
			"uptime": str(point['uptime'])
		}
		#print(result_text)
		result_json = json.dumps(result_text)
		print("ok#%s" % result_json)
try:
	query_resources()
except:
	print('fail#[]', end='')
