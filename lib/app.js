var express = require('express');
var argv = require('minimist')(process.argv.slice(2));

var syslog_server = require('./syslog_server.js');
var rest_api_server = require('./rest_api_server.js');

var db = require('./db');
db.init_db(false);

var syslog_port = argv['s'] || 3000;
var rest_port = argv['r'] || 3001;

/*Start Syslog Server*/

syslog_server.set_db(db);
syslog_server.start(syslog_port, function() {
	return console.log('syslog server started.');
});

/*Start Rest_api server*/

rest_api_server.set_db(db);
rest_api_server.start(rest_port, function() {
	return console.log('rest api server started.');
});