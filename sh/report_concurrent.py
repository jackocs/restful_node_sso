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

def getClientID(apps):
	client_name = r.keys("oauth_clients*")
	for k in client_name:
		key = k.decode('utf-8')
		result = json.loads(r.get(key).decode('utf-8'))
		if result['client_name'] == apps:
			#print(result['client_id'])
			return result['client_id']


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


def query_authSummary(last_hour_date_time, datenow):
	#client_id = getClientID(apps)
	select_failed = "select count(auth) as auth from loginlogs where auth='failed' and time >= '"+last_hour_date_time+"' and time <= '"+datenow+"' group by time(1h) fill(null)"
	result_failed = client.query(select_failed)

	select_true = "select count(auth) as auth from loginlogs where auth='true' and time >= '"+last_hour_date_time+"' and time <= '"+datenow+"' group by time(1h) fill(null)"
	result_true = client.query(select_true)

	times = []
	trues = []
	faileds = []
	total = []
	for point_true in result_true:
		for i in point_true:
			times.append(i['time'])
			trues.append(i['auth'])

	for point_failed in result_failed:
		j = 0
		for i in point_failed:
			faileds.append(i['auth'])
			sums = trues[j] + faileds[j]
			total.append(sums)
			j = j + 1

	result_text = {
		"times": times,
		"true": trues,
		"failed": faileds,
		"total": total
	}
	#print(result_text)
	result_json = json.dumps(result_text)
	print("ok#%s" % result_json)

try:
	if sys.argv[1]:
		hours = int(sys.argv[1])
		datenow = datetime.now()
		last_hour_date_time = datenow - timedelta(hours = hours)
		#print(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
		query_authSummary(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'), datenow.strftime('%Y-%m-%dT%H:%M:%SZ'))
except:
	print('fail#[]', end='')