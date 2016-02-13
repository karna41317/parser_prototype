var db, endTime_error_msg, express, num_error_msg, parse_date, parse_num, start, startTime_error_msg;

express = require('express');
exports.num_error_msg = num_error_msg = 'num is not a valid number';
exports.startTime_error_msg = startTime_error_msg = 'startTime is not a valid date';
exports.endTime_error_msg = endTime_error_msg = 'endTime is not a valid date';


parse_num = function(num_str) {
	var status = true;
	var num = parseInt(num_str, 10);
	if (isNaN(num)) {
		status = false;
	} else if (num <= 0) {
		var error_msg = 'Should be +ve number';
		status = false;
	}
	return {
		status: status,
		num: num
	};
};

parse_date = function(date_string) {
	var status = true;
	var date = Date.parse(date_string);
	if (isNaN(date)) {
		status = false;
	} else {
		date = new Date(date_string);
	}
	return {
		status: status,
		date: date
	};
};

db = null;

exports.set_db = function(_db) {
	return db = _db;
};


exports.start = start = function(port, cb) {
	var rest = express();
	rest.get('/stats', function(req, res) {
		db.stats(function(obj) {
			return res.send(JSON.stringify(obj) + "\n");
		});
	});
	rest.get('/logs', function(req, res) {
		var action, cat, date, endTime, endTime_str, error_msgs, event, ip, num, num_str, ref, ref1, ref2, startTime, startTime_str, status;
		error_msgs = [];

		/* Parsing "num" string from URL */

		num_str = req.query.num || '20';
		ref = parse_num(num_str),
		status = ref.status,
		num = ref.num;
		if (!status) {
			error_msgs.push(num_error_msg);
		}

		/* Parsing "StartDate and Enddate" string from URL */

		startTime_str = req.query.startTime;
		if (startTime_str) {
			ref1 = parse_date(startTime_str), status = ref1.status, date = ref1.date;
			startTime = date;
			if (!status) {
				error_msgs.push(startTime_error_msg);
			}
		} else {
			startTime = void 0;
		}

		endTime_str = req.query.endTime;
		if (endTime_str) {
			ref2 = parse_date(endTime_str), status = ref2.status, date = ref2.date;
			endTime = date;
			if (!status) {
				error_msgs.push(endTime_error_msg);
			}
		} else {
			endTime = void 0;
		}

		ip = req.query.ip;
		cat = req.query.cat;
		event = req.query.event;
		action = req.query.action;

		if (error_msgs.length > 0) {
			res.status(400);
			res.send(error_msgs.join('\n') + '\n');
			return;
		}

		db.logs(num, startTime, endTime, ip, cat, event, action, function(obj) {
			return res.json(obj);
		});

	});
	return cb(rest.listen(port));
};

exports.stop = function(server) {
	return server.close();
};