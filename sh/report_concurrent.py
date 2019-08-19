#!/usr/bin/env python3.6

import json
from json import loads
import os
from pymongo import MongoClient
import datetime
import subprocess, sys

host = os.popen("docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mongo").read().replace('\n','') 
client = MongoClient(host,username="admin",password="dLLm280LzwVFiazOqjO3")
db = client.xidmsso

def showLogs(date_start,date_next):
	data = db.concurrentSSO.aggregate([
	{ "$match": { "time": { "$gt": date_start, "$lt": date_next } }},
	{ "$project": {'_id' : 0 ,}}
        ])
	return data

try:
	if sys.argv[1]:
		last_hour = int(sys.argv[1])
		#last_hour = 48
		n = datetime.datetime.now()
		x = datetime.datetime.now() - datetime.timedelta(hours = last_hour)
		date_start = x.strftime("%Y%m%d%H")
		date_next = n.strftime("%Y%m%d%H")

		raw = list(showLogs(date_start,date_next))
		print("ok#%s" % json.dumps(raw))
except:
	print('fail#[]', end='')

#date_start = "2019081307"
#date_next = "2019081407"

client.close()
