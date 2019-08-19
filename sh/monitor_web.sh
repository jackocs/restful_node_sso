#!/bin/bash

HOST=127.0.0.1
#HOST=$(hostname)
SERVER=https://$HOST/idp/apps/auth/signin

/usr/bin/curl -sSfk $SERVER > /dev/null 2>&1
CS=$?
#echo "STATUS = $CS"
if [ $CS -ne 0 ]
then
	response=$(/usr/bin/curl -s -w  '%{time_total}' -o /dev/null $SERVER)
        echo "down#$response"

elif [ $CS -eq 0 ]
then
	#response=$(/usr/bin/curl -s -w  '%{time_total}' -o /dev/null https://127.0.0.1/idp/apps/auth/signin)
	response=$(/usr/bin/curl -s -w  '%{time_total}' -o /dev/null $SERVER)
	echo "up#$response"
fi
