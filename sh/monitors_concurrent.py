#!/usr/bin/env python3

import json
from json import loads
import os
from pymongo import MongoClient
import sys
from influxdb import InfluxDBClient
from datetime import datetime, timedelta

def query_concurrent(last_hour_date_time):
	REDIS_PASSWORD = os.popen("grep REDIS_PASSWORD /home/xIDM-SSO-Cent8/sso/idp/config/config.php |cut -f4 -d\"'\"").read().replace('\n','')
	client = InfluxDBClient('127.0.0.1', 8086, 'admin', REDIS_PASSWORD, 'xidmsso')
	select_clause = 'select * from idpnode ORDER BY time DESC LIMIT 1'
	result = client.query(select_clause)
	for point in result.get_points():
		time = point['time']
		#print(time)

	datetime = []
	data = {}
	select_clause = "select * from idpnode where time = '"+ time +"'"
	result = client.query(select_clause)
	for point in result.get_points():
		scur=[]
		#print(point['idp'])
		result_idp = client.query("select * from idpnode where idp='"+ point['idp'] +"' and time > '"+last_hour_date_time+"'")
		for point_idp in result_idp.get_points():
			if point_idp['time'] not in datetime :
				datetime.append(point_idp['time'])
			scur.append(point_idp['scur'])
			#print(point_idp)
		data[point['idp']] = scur
	data["datetime"] = datetime
	print("ok#%s" % data)

try:
	if sys.argv[1]:
		hour = sys.argv[1]
		if hour.isdigit() == True:
			hour = int(hour)
			last_hour_date_time = datetime.now() - timedelta(hours = hour)
			#print(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
			query_concurrent(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
except:
	print('fail#[]', end='')
