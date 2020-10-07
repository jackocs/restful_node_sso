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

BACKUP_PATH="/home/restful_node_sso/backup/$PATHS"
if [ ! -d $BACKUP_PATH ] ; then
    printf 'fail#{"error":"unknown BACKUP_PATH"}'
    exit
fi

conf_file="/home/xIDM-SSO-Cent8/api_db.env"

if [ -f "$conf_file" ] ; then
    while IFS= read -r line; do
        line=${line%%#*}
        case $line in
            *=*)
                var=${line%%=*}
                case $var in
                    *[!A-Z_a-z]*)
                    echo "Warning: invalid variable name $var ignored" >&2
                    continue;;
                esac
                if eval '[ -n "${'$var'+1}" ]'; then
                    echo "Warning: variable $var already set, redefinition ignored" >&2
                    continue
                fi
                line=${line#*=}
                eval $var='"$line"'
        esac
    done <"$conf_file"

    # Restore
    if [ -f $BACKUP_PATH/backupDB.sql.gz ] ; then
        gunzip $BACKUP_PATH/backupDB.sql.gz $BACKUP_PATH/
    fi

    if [ -f "$BACKUP_PATH/backupDB.sql" ] ; then
        cat $BACKUP_PATH/backupDB.sql | docker exec -i db /usr/bin/mysql -uroot -p"$MYSQL_PASSWORD"
	/bin/php /home/xIDM-SSO-Cent8/sso/idp/config/mysql2redis_local.php 

	printf "ok#[]"
        #cat $BACKUP_PATH/backupDB.sql 
    fi                                                                                                                                                          
fi                                                                                                                                                              
