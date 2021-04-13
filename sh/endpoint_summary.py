#!/usr/bin/env python3.6

import json
from json import loads
import os
#from pymongo import MongoClient
import sys

import subprocess
try:
	host='https://localhost/idp/apps/.hostname'
	res = subprocess.check_output(['curl', '-sk', host])
	hostname = res.decode()
#	print(hostname)

	url='https://'+hostname+'/idp/apps/.well-known/openid-configuration'
	response = subprocess.check_output(['curl', '-sk', url])
	result = {}
	if response: 
		data = json.loads(response)
		#print(data)
		result['issuer'] = data['issuer']
		result['Authorization EndPoint'] = data['authorization_endpoint']
		result['Token EndPoint'] = data['token_endpoint']
		result['UserInfo EndPoint'] = data['userinfo_endpoint']
		result['JSON Web Key Set Endpoint'] = data['jwks_uri']
		result['OpenID Metadata EndPoint'] = url

	print("ok#%s" % json.dumps(result))
except:
	print('fail#[]', end='')

