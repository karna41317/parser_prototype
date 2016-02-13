"use strict";
describe('rest api server', function() {
	var port = 30001;
	it('starts and closes rest api server', function(done) {
		return async.waterfall([

			function(cb) {
				return rest_api_server.start(port, function(server) {
					return cb(null, server);
				});
			},
			function(server, cb) {
				rest_api_server.stop(server);
				return cb();
			},
			function(cb) {
				return rest_api_server.start(port, function(server) {
					return cb(null, server);
				});
			},
			function(server, cb) {
				rest_api_server.stop(server);
				return done();
			}
		]);
	});

	describe('/logs url params validation', function(done) {
		var server;
		port = port;
		server = null;
		before(function(done) {
			return rest_api_server.start(port, function(_server) {
				server = _server;
				return done();
			});
		});

		it('returns NaN when num is passed with non-number', function(done) {
			var url;
			url = {
				port: port,
				path: '/logs?num=r'
			};
			return http.get(url, function(res) {
				var body;
				eq(res.statusCode, 400);
				body = '';
				res.on('data', function(d) {
					return body += d;
				});
				return res.on('end', function(d) {
					eq(body, rest_api_server.num_error_msg + '\n');
					return done();
				});
			});
		});

		it('returns NaD when startTime is passed with non-date', function(done) {
			var url;
			url = {
				port: port,
				path: '/logs?startTime=r'
			};
			return http.get(url, function(res) {
				var body;
				eq(res.statusCode, 400);
				body = '';
				res.on('data', function(d) {
					return body += d;
				});
				return res.on('end', function(d) {
					eq(body, rest_api_server.startTime_error_msg + '\n');
					return done();
				});
			});
		});

		it('returns NaD when endTime is passed with non-date', function(done) {
			var url;
			url = {
				port: port,
				path: '/logs?endTime=r'
			};
			return http.get(url, function(res) {
				var body;
				eq(res.statusCode, 400);
				body = '';
				res.on('data', function(d) {
					return body += d;
				});
				return res.on('end', function(d) {
					eq(body, rest_api_server.endTime_error_msg + '\n');
					return done();
				});
			});
		});
		return after(function(done) {
			rest_api_server.stop(server);
			return done();
		});
	});
});