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
else
    /bin/rm -rf $BACKUP_PATH
fi

# check 
if [ ! -d "$BACKUP_PATH" ] ; then
    printf 'ok#[]'
else
    printf 'fail#{"error":"Cannot delete data"}'
fi
