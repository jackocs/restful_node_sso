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
my $second=$ARGV[0];

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

my $sql = "UPDATE oauth_conf SET value='$second' where conf='setSessionTime'";

my $sth = $dbh->prepare("$sql");
my @output;
my $string;

$sth->execute() or die printf 'fail#[]';

system("php /home/xIDM-SSO/sso/idp/config/mysql2redis_local.php oauth_conf update");

printf 'OK#[]';

$sth->finish();
$dbh->disconnect();

exit(0);
