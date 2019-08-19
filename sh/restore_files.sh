#!/bin/bash
#
#
#==============================================================================

if [ $# -eq 0 ]; then
        printf 'fail#{"error":"Unknow value"}'
        exit
fi

if [ "$1" == "" ]; then
        printf 'fail#{"error":"BACKUP_PATH"}'
        exit
fi
PATHS=$1

if [ ! -f "$PATHS" ] ; then
        printf 'fail#{"error":"BACKUP_PATH"}'
        exit
fi

BACKUP_PATH="/home/restful_node_sso/backup"

file=$( echo ${PATHS##/*/} )
dir_file=$( echo $file |cut -f1 -d".")
if [ ! -d "$BACKUP_PATH/$dir_file" ] ; then
    /bin/mkdir -p "$BACKUP_PATH/$dir_file"
fi
# 
# restore DB
/home/restful_node_sso/sh/restore_all.sh $dir_file

