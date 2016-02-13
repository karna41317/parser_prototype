"use strict";
var async, dgram;

dgram = require('dgram');

async = require('async');



describe('syslog server', function() {
	var port;
	port = 30000;
	it('starts and closes syslog server', function(done) {
		return async.waterfall([

			function(cb) {
				return syslog_server.start(port, function(server) {
					return cb(null, server);
				});
			},
			function(server, cb) {
				syslog_server.stop(server);
				return cb();
			},
			function(cb) {
				return syslog_server.start(port, function(server) {
					return cb(null, server);
				});
			},
			function(server, cb) {
				syslog_server.stop(server);
				return done();
			}
		]);
	});
	return describe('send msg to syslog server', function() {
		var client, server;
		client = dgram.createSocket('udp4');
		server = null;
		beforeEach(function(done) {
			db.init_db();
			syslog_server.set_db(db);
			return syslog_server.start(port, function(_server) {
				server = _server;
				return done();
			});
		});
		it('saves msg into db', function(done) {
			var msg;
			msg = new Buffer('<123>[2014-09-01 13:04:11] EFW: SYSTEM: prio=2 id=03204001 rev=1 event=accept_configuration action=using_new_config');
			client.send(msg, 0, msg.length, port, 'localhost');
			return setTimeout(function() {
				return db.docs(function(docs) {
					eq(docs.length, 2);
					return done();
				});
			}, 10);
		});
		it('rejects invalid msg into db', function(done) {
			var msg;
			msg = new Buffer('<123[2014-09-01 13:04:11] EFW: SYSTEM: prio=2 id=03204001 rev=1 event=accept_configuration action=using_new_config');
			client.send(msg, 0, msg.length, port, 'localhost');
			return setTimeout(function() {
				return db.docs(function(docs) {
					eq(docs.length, 1);
					return done();
				});
			}, 10);
		});
		return afterEach(function(done) {
			syslog_server.stop(server);
			return done();
		});
	});
});