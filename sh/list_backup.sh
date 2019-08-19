#!/bin/bash

#TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_PATH="/home/restful_node_sso/backup/"

if [ -d ${BACKUP_PATH} ] ; then
    #list=$(ls -d ${BACKUP_PATH}/*)
    #echo $list
    list=$(echo '[' ; ls -t ${BACKUP_PATH} --format=commas |grep -v "backup"|sed -e 's/^/\"/'|sed -e 's/,$/\",/'|sed -e 's/\([^,]\)$/\1\"\]/'|sed -e 's/, /\", \"/g')
    #echo $list
    printf "ok#$list"

fi
