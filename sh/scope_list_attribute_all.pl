#!/usr/bin/perl -w
use Net::LDAP;
use Net::LDAP::Schema;
use Net::LDAP::Entry;
use JSON;

my $ip = $ARGV[0];
my $port = $ARGV[1];
my $admin = $ARGV[2];
my $passwd = $ARGV[3];

#my $ldap = Net::LDAP->new ( $ip , port => $port , timeout=>30) or die printf 'fail#["Could not connect"]';
my $ldap = Net::LDAP->new ( $ip , port => $port , timeout=>2) or die printf 'fail#["Could not connect"]';

my $mesg = $ldap->bind( $admin, password => $passwd ) || die printf 'fail#["Could not bind"]';

if ( $mesg->code ) {
	printf 'fail#["Could not bind"]';
	exit;
}

my $schema = $ldap->schema();
my @ocs = $schema->all_objectclasses;
my @output;
# Get the attributes
@atts = $schema->all_attributes;
foreach my $oc (@atts){
	push @output, $oc->{name};
	#print $oc->{name} . "\n";
}
my (%hash) ;
foreach my $j (sort { "\U$a" cmp "\U$b" } @output){
	#push @data, $j;
	$hash{$j} =1 ;
}
my (@char) = keys(%hash) ;
#foreach my $oc (@ocs){
#	push @output, $oc->{name};
#}
my @data;
foreach my $j (sort { "\U$a" cmp "\U$b" } @char){
	push @data, $j;
}

printf "OK#". JSON::to_json( \@data, {utf8 => 1});

#my $schema = $ldap->schema();
#if($schema){
#	printf("Dump of Schema\n");
#	$schema->dump();
#}

$ldap->unbind();
