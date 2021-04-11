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

client_name = {}

def getClientID(apps):
	client_name = r.keys("oauth_clients*")
	for k in client_name:
		key = k.decode('utf-8')
		result = json.loads(r.get(key).decode('utf-8'))
		if result['client_name'] == apps:
			#print(result['client_id'])
			return result['client_id']

def getClientName(apps):
	result = json.loads(r.get("oauth_clients:"+apps).decode('utf-8'))
	#print(result['client_name'])
	client_name[apps] = result['client_name']
	return result['client_name']
	"""
	client_name = r.keys("oauth_clients*")
	for k in client_name:
		key = k.decode('utf-8')
		result = json.loads(r.get(key).decode('utf-8'))
		if result['client_name'] == apps:
			#print(result['client_id'])
			return result['client_id']
	"""


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


def query_authSummary(tops, status, start, end):
	if status == 'all':
		select = "select count(auth) as auth from loginlogs where time >= '"+start+"'  and time <= '"+end+"' group by uid"
	else: 
		select = "select count(auth) as auth from loginlogs where auth='"+status+"' and time >= '"+start+"'  and time <= '"+end+"' group by uid"
	result = client.query(select)
	#print(result)
	table = {}
	for k, v in result.items():
		#print(k[1]['uid'])
		for point in v:
			table[k[1]['uid']] = point['auth']
	
	data = sorted(table.items(), key=lambda x: x[1], reverse=True)

	data_top = []
	i = 0
	for d in data:
		if i >= int(tops):
			pass
		else:
			#print(d)
			data_top.append(d)
		i = i + 1
		
	#print("ok#%s" % data_top)
	result_json = json.dumps(data_top)
	print("ok#%s" % result_json)

	"""
	result_text = {
		"times": times,
		"true": trues,
		"failed": faileds,
		"total": total
	}
	#print(result_text)
	
	"""

try:
	if sys.argv[1] and sys.argv[2]:
		tops = sys.argv[1]
		status = sys.argv[2]
		start = sys.argv[3]
		end = sys.argv[4]
		
		#datenow = datetime.now()
		#last_hour_date_time = datenow - timedelta(hours = hours)
		#print(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
		query_authSummary(tops, status, start, end)
except:
	print('fail#["Unknown query"]', end='')