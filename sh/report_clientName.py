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

def query_clientName():
	clientName = []
	client_name = r.keys("oauth_clients*")
	for k in client_name:
		key = k.decode('utf-8')
		result = json.loads(r.get(key).decode('utf-8'))
		clientName.append(result['client_name'])
	result_json = json.dumps(clientName)
	print("ok#%s" % result_json)

try:
	query_clientName()
except:
	print('fail#[]', end='')