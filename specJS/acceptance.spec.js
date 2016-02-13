"use strict";
var async, dgram, http, msgs, request;
http = require('http');
dgram = require('dgram');
async = require('async');
request = require('request');


msgs = [
	'<123>[2010-09-01 13:04:11] EFW: SYSTEM: prio=2 id=03204001 rev=1 event=accept_configuration action=using_new_config',
	'<134>[2011-09-01 13:04:04] EFW: NETCON: prio=1 id=02300001 rev=1 event=init_complete',
	'<134>[2012-09-01 13:04:09] EFW: SYSTEM: prio=2 id=03202001 rev=2 event=startup_echo delay=5 corever=10.21.00.15-24791 build="Aug 20 2014" uptime=6243 cfgfile="core.cfg" localcfgver=258 remotecfgver=0 previous_shutdown="2014-09-01 13:03:59: Activating configuration changes"',
	'<134>[2013-09-01 13:04:11] EFW: SYSTEM: prio=2 id=03204001 rev=1 event=accept_configuration action=using_new_config username=admin userdb=AdminUsers client_ip=172.16.10.1 config_system=HTTP',
	'<134[2014-09-01 13:04:11] EFW: SYSTEM: prio=2 id=03204001 rev=1 event=accept_configuration action=using_new_config username=admin userdb=AdminUsers client_ip=172.16.10.1 config_system=HTTP'
];

describe('acceptance test', function() {
	var client, rest_port, syslog_port;
	syslog_port = 30000;
	rest_port = 30001;
	client = dgram.createSocket('udp4');
	before(function(done) {
		db.init_db();
		syslog_server.set_db(db);
		rest_api_server.set_db(db);
		return async.series([

			function(cb) {
				return syslog_server.start(syslog_port, function() {
					return cb(null, null);
				});
			},
			function(cb) {
				return rest_api_server.start(rest_port, function() {
					return cb(null, null);
				});
			},
			function(cb) {
				return async.each(msgs, function(m, _cb) {
					var msg;
					msg = new Buffer(m);
					client.send(msg, 0, msg.length, syslog_port, 'localhost');
					return _cb();
				}, function(err) {
					return setTimeout(done, 10);
				});
			}
		]);
	});


	it('returns right stats', function(done) {
		var url;
		url = "http://localhost:" + rest_port + "/stats";
		return request({
			url: url,
			json: true
		}, function(err, res, body) {
			eq(body.received, 4);
			eq(body.malformed, 1);
			eq(body.first, new Date('2010-09-01 13:04:11').toISOString());
			eq(body.last, new Date('2013-09-01 13:04:11').toISOString());
			return done();
		});
	});


	it('returns num logs', function(done) {
		return async.parallel({
			one: function(cb) {
				var url;
				url = "http://localhost:" + rest_port + "/logs?num=1";
				return request({
					url: url,
					json: true
				}, function(err, res, body) {
					return cb(null, body.length);
				});
			},
			two: function(cb) {
				var url;
				url = "http://localhost:" + rest_port + "/logs?num=2";
				return request({
					url: url,
					json: true
				}, function(err, res, body) {
					return cb(null, body.length);
				});
			}
		}, function(err, result) {
			eq(result.one, 1);
			eq(result.two, 2);
			return done();
		});
	});

	it('returns logs btw startTime and endTime', function(done) {
		var endTime, startTime, url;
		startTime = '2011-09-01T13:04:04Z';
		endTime = '2012-09-01T13:04:09Z';
		url = "http://localhost:" + rest_port + "/logs?startTime=" + startTime + "&endTime=" + endTime;
		return request({
			url: url,
			json: true
		}, function(err, res, body) {
			eq(body.length, 1);
			return done();
		});
	});

});