#!/bin/bash

if [ "$1" == "" ]; then
        printf 'fail#{"error":"BACKUP_PATH"}'
        exit
fi
PATHS=$1

BACKUP_PATH="/home/restful_node_sso/backup/$PATHS"
if [ ! -d $BACKUP_PATH ] ; then
    printf 'fail#{"error":"unknown BACKUP_PATH"}'
    exit
fi

/bin/cd /home/restful_node_sso/backup/
/bin/tar -C /home/restful_node_sso/backup/$PATHS/ -cf /tmp/$PATHS.tar ./

if [ -f "/tmp/$PATHS.tar" ] ; then
    printf "/tmp/$PATHS.tar"
fi
