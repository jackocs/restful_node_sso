#!/usr/bin/env python3

import json
from json import loads
import os
from pymongo import MongoClient
import sys
from influxdb import InfluxDBClient
from datetime import datetime, timedelta
import redis

REDIS_PASSWORD = os.popen("grep REDIS_PASSWORD /home/xIDM-SSO-Cent8/sso/idp/config/config.php |cut -f4 -d\"'\"").read().replace('\n','')
client = InfluxDBClient('127.0.0.1', 8086, 'admin', REDIS_PASSWORD, 'xidmsso')

r = redis.Redis(host='127.0.0.1',password=REDIS_PASSWORD, port=16379, db=0)


def query_topapplication(last_hour_date_time):
	select_clause = "select * from loginlogs where time > '"+last_hour_date_time+"' order by time desc limit 10"
	result = client.query(select_clause)
	topapplication = []
	#print(result)
	for point in result:
		for value in point:
			
			client_name = r.get("oauth_clients:"+value['client_id']).decode('utf-8')
			client_name = json.loads(client_name)
			value['client_name'] = client_name['client_name']
			del value['client_id']
			del value['policy']
			#print(value)
			topapplication.append(value)
	#print(topapplication)
	print("ok#%s" % topapplication)

try:
	hour = 2160 # 90 day
	last_hour_date_time = datetime.now() - timedelta(hours = hour)
	query_topapplication(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
except:
	print('fail#["Unknown query"]', end='')
