#!/usr/bin/env python3

import json
from json import loads
import os
from pymongo import MongoClient
import sys
from influxdb import InfluxDBClient
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
import redis

REDIS_PASSWORD = os.popen("grep REDIS_PASSWORD /home/xIDM-SSO-Cent8/sso/idp/config/config.php |cut -f4 -d\"'\"").read().replace('\n','')
client = InfluxDBClient('127.0.0.1', 8086, 'admin', REDIS_PASSWORD, 'xidmsso')

r = redis.Redis(host='127.0.0.1',password=REDIS_PASSWORD, port=16379, db=0)


#today_date = datetime.today()
today_date = date.today()
def getMonth(month):
	result = {}
	one_month_ago = today_date - relativedelta(months=month-1)
	last_day_of_prev_month = one_month_ago.replace(day=1) - timedelta(days=1)
	start_day_of_prev_month = one_month_ago.replace(day=1) - timedelta(days=last_day_of_prev_month.day)
	#print("First month ago date: %s" % start_day_of_prev_month)
	#print("Last month ago date: %s" % last_day_of_prev_month)
	result['firstmonth'] = start_day_of_prev_month.strftime('%Y-%m-%dT00:00:00Z')
	result['lastmonth'] = last_day_of_prev_month.strftime('%Y-%m-%dT23:59:59Z')
	#result['numday'] = last_day_of_prev_month.strftime('%d')
	result['fullmonth'] = last_day_of_prev_month.strftime('%B')
	return result


def query_authSummary(start, end):
	select = "select count(auth) as auth from loginlogs where time >= '"+start+"' and time <= '"+end+"' group by client_id"
	result = client.query(select)
	#print(result_failed)
	#for i in result_failed.get_points():
	#	print(i)
	app = {}
	for k, v in result.items():
		for point in v:
			try:
				client_name = r.get("oauth_clients:"+k[1]['client_id']).decode('utf-8')
				client_name = json.loads(client_name)
				app[client_name['client_name']] = point['auth']
			except:
				app['unknown'] = point['auth']
			
			#print(k[1]['client_id'])
			#print(point)
	#print(app)
	result_json = json.dumps(app)
	print("ok#%s" % result_json)
	

try:
	if sys.argv[1] and sys.argv[2]:
		start = sys.argv[1]
		end = sys.argv[2]
		
			#last_hour_date_time = datetime.now() - timedelta(hours = hour)
			#print(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
			#query_topapplication(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
		query_authSummary(start, end)
except:
	print('fail#[]', end='')