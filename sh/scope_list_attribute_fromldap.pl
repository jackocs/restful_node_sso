#!/bin/perl -w

use DBI;
use MIME::Base64;
use strict;
use POSIX qw/strftime/;
use JSON;
use Net::LDAP;
use Net::LDAP::Schema;
use Net::LDAP::Entry;

#my $num_args = $#ARGV + 1;
#if ($num_args < 2) {
#    print "Error: modify_acl.pl baseDN hostIP";
#    exit;
#}
#my $basedn=$ARGV[0];
#my $hosts=$ARGV[1];

# open the accessDB file to retrieve the database name, host name, user name and password
open(ACCESS_INFO, "/home/xIDM-SSO-Cent8/mysql/db/accessDB") || die "Can't access login credentials";

my $database = <ACCESS_INFO>;
my $host = <ACCESS_INFO>;
my $userid = <ACCESS_INFO>;
my $password = <ACCESS_INFO>;

$host = `docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' db`;
chomp ($database, $host, $userid, $password);

my $driver = "mysql"; 
my $dsn = "DBI:$driver:database=$database;host=$host;";
my $dbh = DBI->connect($dsn, $userid, $password ,{mysql_enable_utf8 => 1}) or die $DBI::errstr;

my $sql = "select * from oauth_directory where `use`='1' order by orders";
#my $sql = "select group_policy_id,client_use,client_secret,client_details,client_id,redirect_uri,grant_types,client_name,scope from oauth_clients order by client_name";

my $sth = $dbh->prepare("$sql");
my @output;
my $string;
$sth->execute() or die $DBI::errstr;
   if($sth->rows > 0){
	#while (my $hr = $sth->fetchrow_hashref) {
	my @data = "";
	while (my $row = $sth->fetchrow_hashref) {
#    		$row->{ip} = decode_json($row->{ip});
		my $ip = $row->{ip};    		
		my $port = $row->{port};    		
		my $type = lc $row->{type};    		
		my $admin = lc $row->{principal};    		
		my $pw = $row->{pw};    		
		#printf "$type";
		if($type eq 'ad'){
			my $sql_ad = "select attribute from oauth_objectclasses where type='AD'";
			my $sth_ad = $dbh->prepare("$sql_ad");
			$sth_ad->execute() or die $DBI::errstr;
			if($sth_ad->rows > 0){
				#my $attribute = $sth_ad->fetchrow_hashref;
				#my $att = decode_json($attribute->{attribute});
				#my $aa =JSON::to_json( $att->{user}, {utf8 => 1});
				#my $arrayref = decode_json $aa;
        			while (my $hr = $sth_ad->fetchrow_array) {
			                push @data, $hr;
                                }
				#foreach my $item(@$arrayref){
				#	#print $item;
				#	if($item ne ""){
			        #	   push @data, $item ;
				#	}
				#}
			}
		}else{
			my $sql_secret = "select value from oauth_conf where conf='secret_key'";
			my $sth_secret = $dbh->prepare("$sql_secret");
			$sth_secret->execute() or die $DBI::errstr;
			if($sth_secret->rows > 0){
				my $secret_key = $sth_secret->fetchrow_hashref;
				#printf "$secret_key->{value}";
				my $passwd = `php /home/restful_node_sso/v1/stringEncryption.php 'decrypt' $pw  $secret_key->{value}`;
				#my $attb = `perl /home/restful_node_sso/sh/scope_list_attribute_all.pl $ip $port $principal $secret_key_raw`;
				#
				#my $ldap = Net::LDAP->new ( $ip , port => $port , timeout=>30) or die printf 'fail#["Could not connect"]';
				if (my $ldap = Net::LDAP->new ( $ip , port => $port , timeout=>2)) {
					my $mesg = $ldap->bind( $admin, password => $passwd ) || die printf 'fail#["Could not bind"]';

					if ( $mesg->code ) {
				        	printf 'fail#["Could not bind"]';
				        	exit;
					}

					my $schema = $ldap->schema();
					# Get the attributes
					my @atts = $schema->all_attributes;
					foreach my $oc (@atts){
			        		push @data, $oc->{name};
					}
					$ldap->unbind();
				}
			}
		}
	}
				my (%hash) ;
				foreach my $j (sort { "\U$a" cmp "\U$b" } @data){
					if($j ne "") {
        					$hash{$j} =1 ;
					}
				}
				my (@char) = keys(%hash) ;
				my @output;
				foreach my $j (sort { "\U$a" cmp "\U$b" } @char){
				        push @output, $j;
				}
	printf "OK#". JSON::to_json( \@output, {utf8 => 1});

   }else{
	printf 'OK#[]';
   }
$sth->finish();
$dbh->disconnect();

exit(0);
