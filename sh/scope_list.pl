#!/bin/perl -w

use DBI;
use MIME::Base64;
use strict;
use POSIX qw/strftime/;
use JSON;

#my $num_args = $#ARGV + 1;
#if ($num_args < 2) {
#    print "Error: modify_acl.pl baseDN hostIP";
#    exit;
#}
#my $basedn=$ARGV[0];
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

my $sql = "select scope from oauth_scopes order by scope";

my $sth = $dbh->prepare("$sql");
my @output;
my $string;
$sth->execute() or die $DBI::errstr;
   if($sth->rows > 0){
	#while (my $hr = $sth->fetchrow_hashref) {
	while (my $row = $sth->fetchrow_arrayref) {
    		#push @output, $hr;
#    		$row->{attribute} = decode_json($row->{attribute});
    		push @output, @$row[0];
    		#push @output,  \@decoded_json;
	}
	printf "OK#". JSON::to_json( \@output, {utf8 => 1}); 

   }else{
	printf 'OK#[]';
   }
$sth->finish();
$dbh->disconnect();

exit(0);
