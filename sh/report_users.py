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

def showLogs(date_start,date_next,users,domain):
	if domain != "default":
		data = db.logsSSO.aggregate([
		{ "$match": { "time": { "$gt": date_start, "$lt": date_next } }},
		{"$match": {"account": users}},
		{"$match": {"domain": domain}},
		{"$sort": {"_id":-1}},
		{ "$project": {"_id" : 0 ,}}
        	])
	else:
		data = db.logsSSO.aggregate([
		{ "$match": { "time": { "$gt": date_start, "$lt": date_next } }},
		{"$match": {"account": users}},
		{"$sort": {"_id":-1}},
		{ "$project": {"_id" : 0 ,}}
        	])
	return data

try:
	if sys.argv[1]:
		users = sys.argv[1]
		domain = sys.argv[2].strip()
		date_start = sys.argv[3].strip()
		date_next = sys.argv[4].strip()

		if (date_start == "default") or (date_next == "default"):
			n = datetime.datetime.now()
			x = datetime.datetime.now() - datetime.timedelta(hours = 24)
			date_start = x.strftime("%Y%m%d%H")
			date_next = n.strftime("%Y%m%d%H")

		raw = list(showLogs(date_start,date_next,users,domain))
		print("ok#%s" % json.dumps(raw))
except:
	print('fail#[]', end='')

client.close()
