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
my $group_policy_name=$ARGV[0];
#my $hosts=$ARGV[1];

# open the accessDB file to retrieve the database name, host name, user name and password
open(ACCESS_INFO, "/home/xIDM-SSO/mysql/db/accessDB") || die "Can't access login credentials";

my $database = <ACCESS_INFO>;
my $host = <ACCESS_INFO>;
my $userid = <ACCESS_INFO>;
my $password = <ACCESS_INFO>;

$host = `docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' db`;
chomp ($database, $host, $userid, $password);

my $driver = "mysql"; 
my $dsn = "DBI:$driver:database=$database;host=$host;";
my $dbh = DBI->connect($dsn, $userid, $password ,{mysql_enable_utf8 => 1}) or die $DBI::errstr;

my $sql = "select * from oauth_group_policy where group_policy_name='$group_policy_name' limit 1";
my $sth = $dbh->prepare("$sql");
my @output;
my $string;
my %aa;
$sth->execute() or die $DBI::errstr;
   if($sth->rows > 0){
	while (my $row = $sth->fetchrow_hashref) { 
		$row->{group_policy_rule} = decode_json($row->{group_policy_rule});
		push @output, $row;
	}
	printf "OK#". JSON::to_json( \@output, {utf8 => 1}); 

   }else{
	printf 'OK#[]';
   }
$sth->finish();
$dbh->disconnect();

exit(0);
