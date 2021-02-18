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


def query_authSummary(user, domain, start, end):
	if start == 'default' or end == 'default':
		datenow = datetime.now()
		last_hour_date_time = datenow - timedelta(24)
		last_hour_date_time = last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ')
		if domain == 'default':
			select = "select * from loginlogs where uid='"+user+"' and time >= '"+last_hour_date_time+"' order by time desc"
		else:
			select = "select * from loginlogs where uid='"+user+"' and domain='"+domain+"' and time >= '"+last_hour_date_time+"' order by time desc"
	else:
		if domain == 'default':
			select = "select * from loginlogs where uid='"+user+"' and time >= '"+start+"'  and time <= '"+end+"' order by time desc"
		else:
			select = "select * from loginlogs where uid='"+user+"' and domain='"+domain+"' and time >= '"+start+"'  and time <= '"+end+"' order by time desc"

	result = client.query(select)
	data = []
	for point in result:
		j = None
		for i in point:
			#print(i['client_id'])
			client_n = None
			if i['client_id'] in client_name:
				client_n = client_name[i['client_id']]
				#print(client_n)
			else:
				client_n = getClientName(i['client_id'])
				#print(getClientName(i['client_id']))
			del i['client_id']
			i['client_name'] = 	client_n
			j = i
			data.append(j)

	"""
	result_text = {
		"times": times,
		"true": trues,
		"failed": faileds,
		"total": total
	}
	#print(result_text)
	
	"""
	print("ok#%s" % data)

try:
	if sys.argv[1] and sys.argv[2]:
		user = sys.argv[1]
		domain = sys.argv[2]
		start = sys.argv[3]
		end = sys.argv[4]
		
		#datenow = datetime.now()
		#last_hour_date_time = datenow - timedelta(hours = hours)
		#print(last_hour_date_time.strftime('%Y-%m-%dT%H:%M:%SZ'))
		query_authSummary(user, domain, start, end)
except:
	print('fail#["Unknown query"]', end='')