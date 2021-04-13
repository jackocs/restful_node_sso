#!/usr/bin/env python3.6

import json
from json import loads
import os
from pymongo import MongoClient
import sys
#from datetime import datetime,timedelta
#import datetime
#from datetime import date, timedelta
#from dateutil.relativedelta import relativedelta

host = os.popen("docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mongo").read().replace('\n','') 
client = MongoClient(host,username="admin",password="dLLm280LzwVFiazOqjO3")
db = client.xidmsso

def showLogs(detail):
	if detail == "all":
		data = db.monitorSSO.aggregate([
		{ "$sort": {'_id' : -1 ,}},{ "$limit" : 1 },
		{ "$project": {'_id' : 0 ,}}
		])
#		print(list(data))
	else:
		data = []
	return data

try:
	if sys.argv[1]:
		detail = sys.argv[1]
		#print(detail)
		raw_data = list(showLogs(detail))
		#print("ok#%s" % list(raw_data))
		#print(json.dumps(raw_data[0]))
		print("ok#%s" % json.dumps(raw_data[0]))
except:
	print('fail#[]', end='')

client.close()
