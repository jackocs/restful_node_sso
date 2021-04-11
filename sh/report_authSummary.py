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
			client_name = r.get("oauth_clients:"+k[1]['client_id']).decode('utf-8')
			client_name = json.loads(client_name)
			app[client_name['client_name']] = point['auth']
			#print(k[1]['client_id'])
			#print(point)
	#print(app)
	result_json = json.dumps(app)
	print("ok#%s" % result_json)
	

	"""
	monthfullmonth = []
	month_true = []
	month_failed = []
	month_sum = []
	monthlySummary = {}
	for i in range(month):
		#print(getMonth(i))
		result_month = getMonth(i)
		monthfullmonth.append(result_month['fullmonth'])
		select_failed = "select count(auth) as auth from loginlogs where auth='failed' and time >= '"+result_month['firstmonth']+"' and time <= '"+result_month['lastmonth']+"'"
		result_failed = client.query(select_failed)

		select_true = "select count(auth) as auth from loginlogs where auth='true' and time >= '"+result_month['firstmonth']+"' and time <= '"+result_month['lastmonth']+"'"
		result_true = client.query(select_true)

		if result_true:
			for point_true in result_true:
				#print(point[0]["auth"])
				#monthlySummary.append({result_month['fullmonth']: point_failed[0]['auth']})
				month_true.append(point_true[0]['auth'])
		else:
			#monthlySummary.append({result_month['fullmonth']: 0})
			month_true.append(0)

		if result_failed:
			for point_failed in result_failed:
				#print(point[0]["auth"])
				#monthlySummary.append({result_month['fullmonth']: point_failed[0]['auth']})
				month_failed.append(point_failed[0]['auth'])
		else:
			#monthlySummary.append({result_month['fullmonth']: 0})
			month_failed.append(0)

		month_sum.append(month_true[i] + month_failed[i])
	
	#print(monthfullmonth)
	#print(month_true)
	#print(month_failed)
	monthlySummary['month'] = monthfullmonth
	monthlySummary['true'] = month_true
	monthlySummary['failed'] = month_failed
	monthlySummary['sum'] = month_sum

	print("ok#%s" % monthlySummary)
	"""

try:
	if sys.argv[1] and sys.argv[2]:
		start = sys.argv[1]
		end = sys.argv[2]
		
			#last_hour_date_time = datetime.now() - timedelta(hours = hour)
			#print(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
			#query_topapplication(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
		query_authSummary(start, end)
except:
	print('fail#["Unknown query"]', end='')