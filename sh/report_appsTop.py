#!/usr/bin/env python3.6

import json
from json import loads
import os
from pymongo import MongoClient
import datetime
import subprocess, sys
from mysql.connector import MySQLConnection, Error
from python_mysql_dbconfig import read_db_config

host = os.popen("docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mongo").read().replace('\n','') 
client = MongoClient(host,username="admin",password="dLLm280LzwVFiazOqjO3")
db = client.xidmsso

def showLogs(date_start,date_next,tops):
	if tops != "default":
		data = db.logsSSO.aggregate([
		{ "$match": { "time": { "$gt": date_start, "$lt": date_next } }},
		#{"$group" : {"_id":"$client_id", "count":{"$sum":1}}},
		{"$group" : {
		   "_id":{"apps":"$client_id","auth":"$auth"},
                    "count":{"$sum":1}},
                },
                {"$group":{
                    "_id":"$_id.apps",
                    "authen":{
                        "$push":{
                            "type":"$_id.auth",
                            "count":"$count"
                        }
                    }
                }},
		{"$sort": {"_id":-1}},
		{ "$limit" : tops}
        	])
	else:
		data = db.logsSSO.aggregate([
		{ "$match": { "time": { "$gt": date_start, "$lt": date_next } }},
#		{"$group" : {"_id":"$client_id", "count":{"$sum":1}}},
		{"$group" : {
		   "_id":{"apps":"$client_id","auth":"$auth"},
                    "count":{"$sum":1}},
                },
                {"$group":{
                    "_id":"$_id.apps",
                    "authen":{
                        "$push":{
                            "type":"$_id.auth",
                            "count":"$count"
                        }
                    }
                }},
		{"$sort": {"_id":-1}}
        	])
	return data

def query_with_fetchall(cursor,sql):
	try:
		cursor.execute(sql)
		rows = cursor.fetchone()
		#print('Total Row(s):', cursor.rowcount)
		if cursor.rowcount > 0:
			return rows[0]
		else:
			return 'unknown'
	except Error as e:
		print(e)

try:
	if sys.argv[1]:
		tops = sys.argv[1]
		if tops.isdigit() == True:
			tops = int(tops)
		date_start = sys.argv[2].strip()
		date_next = sys.argv[3].strip()

		if (date_start == "default") or (date_next == "default"):
			n = datetime.datetime.now()
			x = datetime.datetime.now() - datetime.timedelta(hours = 24)
			date_start = x.strftime("%Y%m%d%H")
			date_next = n.strftime("%Y%m%d%H")

		dbconfig = read_db_config()
		conn = MySQLConnection(**dbconfig)
		cursor = conn.cursor()

		raw = list(showLogs(date_start,date_next,tops))
		for a in raw:
#			print(a)
#			print(list(a['authen']))
#			print(a['authen'][1])
#			print(a['authen'][0])
			auths = list(a['authen'])
			total = 0
			for j in auths:
				d = j['type']
				a[d] = j['count']
				total = total + j['count']
			a['total'] = total
			#if a['authen'][0]:
#			if auths[0] is not None:
#				print(auths[1])
#				d = auths[0]['type']
#				a[d] = auths[0]['count']
#			if auths[1] is not None:
#				j = auths[1]['type']
#				a[j] = auths[1]['count']

			client_id = a['_id']
			if client_id != 'portal':
				sql = "SELECT client_name FROM oauth_clients where client_id='"+client_id+"'" 
				client_name = query_with_fetchall(cursor,sql)
			else:	
				client_name = client_id
			#print(client_id +" : "+client_name)
#				j = a['authen'][1]['type']
			a['client_name'] = client_name
			a.pop('authen')

		print("ok#%s" % json.dumps(raw))
except:
	print('fail#[]', end='')

finally:
	cursor.close()
	conn.close()

client.close()
