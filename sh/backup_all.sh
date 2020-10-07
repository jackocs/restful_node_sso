#!/bin/bash

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_PATH=/home/restful_node_sso/backup/${TIMESTAMP}

/bin/mkdir -p ${BACKUP_PATH}

if [ -d ${BACKUP_PATH} ] ; then
    # backup DB
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

    # Backup
	sql="mysqldump --all-databases --quick --single-transaction --skip-lock-tables --flush-privileges -uroot -p\"$MYSQL_PASSWORD\""
	#echo $sql
        /bin/docker exec db sh -c "$sql" | gzip > $BACKUP_PATH/backupDB.sql.gz

    # Restore
    #gunzip -k ./backupDB.sql.gz
    #cat backup.sql | docker exec -i db sh -c 'mysql -uroot -p"$MYSQL_PASSWORD"'

    fi


    #
    check_db=$(ls "${BACKUP_PATH}/backupDB.sql.gz" |wc -l)
    if [ $check_db == 1 ] ; then
        printf "ok#[]"
    else
        printf 'fail#{"error":"Backup error"}'
    fi


fi
