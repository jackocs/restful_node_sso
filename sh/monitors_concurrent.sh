#!/bin/bash
if [ $# -eq 0 ]; then
        printf 'fail#["Unknow value"]'
        exit
fi

if [ "$1" == "" ]; then
        printf 'fail#i["Unknow detail"]'
        exit
else
        detail=$1
fi

webPID=`docker inspect --format='{{.State.Pid}}' sso`
if [ $webPID != "" ]; then
    if [ $detail == "detail" ]; then
	#data=$(nsenter -t $webPID -n netstat -tn |grep ':443' |grep 'ESTABLISHED' | awk '{print $5}' | cut -d: -f1  | sort | uniq -c |sort -nr)
	data=$(nsenter -t $webPID -n netstat -tn |grep ':443' | awk '{print $5}' | cut -d: -f1  | sort | uniq -c |sort -nr)
	printf "ok#$data"
    elif [ $detail == "sum" ]; then
	#data=$(nsenter -t $webPID -n netstat -tn |grep ':443' |grep 'ESTABLISHED' | wc -l)
	data=$(nsenter -t $webPID -n netstat -tn |grep ':443' | wc -l)
	printf "ok#$data"
    else
	printf 'ok#null value'
    fi
else
        printf 'fail#["Can not contact Web"]'
fi

