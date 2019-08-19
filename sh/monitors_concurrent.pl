#!/bin/perl -w

use DBI;
use MIME::Base64;
use strict;
use POSIX qw/strftime/;
use JSON;

my $num_args = $#ARGV + 1;
if ($num_args < 1) {
    printf 'fail#[]';
    exit;
}
my $detail=$ARGV[0];
#my $hosts=$ARGV[1];

# open the accessDB file to retrieve the database name, host name, user name and password
#open(ACCESS_INFO, "/home/xIDM-SSO/mysql/db/accessDB") || die "Can't access login credentials";

#my $database = <ACCESS_INFO>;
#my $host = <ACCESS_INFO>;
#my $userid = <ACCESS_INFO>;
#my $password = <ACCESS_INFO>;

#$host = `docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' db`;
my $web_pid = `docker inspect --format='{{.State.Pid}}' sso`;
if ($web_pid) {
    if($detail eq 'detail'){
   	 #my $raw = `nsenter -t $web_pid -n netstat -tn 2>/dev/null | grep :443 |grep 'ESTABLISHED'| awk '{print \$5}' | cut -d: -f1 | sort | uniq -c `; 
	my $raw = `nsenter -t 18501 -n netstat -tn |grep ':443' |grep 'ESTABLISHED' | awk '{print \$5}' | cut -d: -f1 | sort | uniq -c`;
   	printf $raw;
    }

}else{
    printf 'fail#["web could not start"]';
    exit;
}



#chomp ($database, $host, $userid, $password);

#my @output;
#my $string;
#$sth->execute() or die $DBI::errstr;
#   if($sth->rows > 0){
#	while (my $hr = $sth->fetchrow_hashref) {
#	#while (my $hr = $sth->fetchrow_array) {
#    		push @output, $hr;
#	}
#	printf "OK#". JSON::to_json( \@output, {utf8 => 1}); 
#
#   }else{
#	printf 'OK#[]';
#   }
#$sth->finish();
#$dbh->disconnect();

exit(0);
