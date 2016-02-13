"use strict";
var async = require('async');

describe('database', function() {
	beforeEach(function() {
		return db.init_db(true);
	});

	it('starts with empty db', function() {
		return db.docs(function(docs) {
			return docs.length.should.equal(0);
		});
	});

	it('counts the number of successfully logged message', function(done) {
		var msg_obj;
		msg_obj = {
			status: true,
			pri: '<123>',
			event_date: new Date('2014-09-01 13:04:11'),
			efw: 'EFW',
			category: 'SYSTEM',
			prio: '2',
			id: '03204001',
			rev: '1',
			event: 'accept_configuration'
		};
		return async.series([

			function(cb) {
				return db.create(msg_obj, function() {
					return cb(null, null);
				});
			},
			function(cb) {
				return db.docs(function(docs) {
					var counter_obj, d, i, len;
					docs.length.should.equal(2);
					for (i = 0, len = docs.length; i < len; i++) {
						d = docs[i];
						if (d.status === void 0) {
							counter_obj = d;
						}
					}
					counter_obj.counter.should.equal(1);
					return done();
				});
			}
		]);
	});


	it('counts the number of malformed logged message', function(done) {
		var msg_obj;
		msg_obj = {
			status: false
		};
		return async.series([

			function(cb) {
				return db.create(msg_obj, function() {
					return cb(null, null);
				});
			},
			function(cb) {
				return db.docs(function(docs) {
					var counter_obj, d, i, len;
					docs.length.should.equal(1);
					for (i = 0, len = docs.length; i < len; i++) {
						d = docs[i];
						if (d.status === void 0) {
							counter_obj = d;
						}
					}
					counter_obj.name.should.equal('malformed');
					counter_obj.counter.should.equal(1);
					return done();
				});
			}
		]);
	});


	it('provides stats info', function(done) {
		var bad_msg_obj, good_msg_obj;
		good_msg_obj = {
			status: true,
			pri: '<123>',
			event_date: new Date('2014-09-01 13:04:11'),
			efw: 'EFW',
			category: 'SYSTEM',
			prio: '2',
			id: '03204001',
			rev: '1',
			event: 'accept_configuration'
		};
		bad_msg_obj = {
			status: false
		};
		return async.series([

			function(cb) {
				return db.create(good_msg_obj, function() {
					return cb(null, null);
				});
			},
			function(cb) {
				return db.create(bad_msg_obj, function() {
					return cb(null, null);
				});
			},
			function(cb) {
				return db.stats(function(info) {
					info.received.should.equal(1);
					info.malformed.should.equal(1);
					info.first.toString().should.equal(new Date('2014-09-01 13:04:11').toString());
					info.last.toString().should.equal(new Date('2014-09-01 13:04:11').toString());
					return done();
				});
			}
		]);
	});

	describe('logs query', function() {
		beforeEach(function(done) {
			return async.series([

				function(cb) {
					var msg_obj;
					msg_obj = {
						status: true,
						pri: '<123>',
						event_date: new Date('2013-09-01 13:04:11'),
						efw: 'EFW',
						category: 'FIRST',
						prio: '2',
						id: '03204001',
						rev: '1',
						event: 'accept_configuration'
					};
					return db.create(msg_obj, function() {
						return cb(null, null);
					});
				},
				function(cb) {
					var msg_obj;
					msg_obj = {
						status: true,
						pri: '<123>',
						event_date: new Date('2014-09-01 13:04:11'),
						efw: 'EFW',
						category: 'SYSTEM',
						prio: '2',
						id: '03204001',
						rev: '1',
						event: 'accept_configuration'
					};
					return db.create(msg_obj, function() {
						return cb(null, null);
					});
				},
				function(cb) {
					var msg_obj;
					msg_obj = {
						status: true,
						pri: '<123>',
						event_date: new Date('2015-09-01 13:04:11'),
						efw: 'EFW',
						category: 'THIRD',
						prio: '2',
						id: '03204001',
						rev: '1',
						event: 'accept_configuration'
					};
					return db.create(msg_obj, function() {
						return done();
					});
				}
			]);
		});


		it('returns all logs when num is nul', function(done) {
			return db.logs(null, null, null, null, null, null, null, function(logs) {
				logs.length.should.equal(3);
				return done();
			});
		});


		it('returns all logs after startTime', function(done) {
			return db.logs(null, new Date('2013-09-01 13:04:11'), null, null, null, null, null, function(logs) {
				logs.length.should.equal(2);
				return done();
			});
		});


		it('returns all logs before endTime', function(done) {
			return db.logs(null, null, new Date('2015-09-01 13:04:11'), null, null, null, null, function(logs) {
				logs.length.should.equal(2);
				return done();
			});
		});


		it('returns all logs btw startTime and endTime', function(done) {
			var endTime, startTime;
			startTime = new Date('2013-09-01 13:04:11');
			endTime = new Date('2015-09-01 13:04:11');
			return db.logs(null, startTime, endTime, null, null, null, null, function(logs) {
				logs.length.should.equal(1);
				return done();
			});
		});
	});
});