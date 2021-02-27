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
#print(r.get('oauth_clients:bd4de2d6455972c22dd1f1e7bee1a120e19'))
#client_name = r.get('oauth_clients:bd4de2d6455972c22dd1f1e7bee1a120e19').decode('utf-8')
#client_name = json.loads(client_name)
#print(client_name['client_name'])

def query_totalUsers(last_hour_date_time):
	#select_clause = "select count(auth) as auth from loginlogs where time > '"+last_hour_date_time+"'  group by client_id"
	select_clause = "select count(auth) from loginlogs where auth='true' and time > '"+last_hour_date_time+"' group by uid"
	result = client.query(select_clause)
	users = {}
	users['users'] = len(result)
	#print(len(result))
	"""
	#for point in result:
	for k,v in result.items():
		#print(k)
		for point in v:
			#print(point)
			if k[1]['client_id']:
				client_name = r.get("oauth_clients:"+k[1]['client_id']).decode('utf-8')
				client_name = json.loads(client_name)
				app[client_name['client_name']] = point['auth']
			else:
				app['none'] = point['auth']
	"""
	print("ok#%s" % users)

try:
	if sys.argv[1]:
		hour = sys.argv[1]
		if hour.isdigit() == True:
			hour = int(hour)
			#hour = 8760 # 365 day
			last_hour_date_time = datetime.now() - timedelta(hours = hour)
			#print(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
			query_totalUsers(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
except:
	print('fail#["Unknown query"]', end='')
