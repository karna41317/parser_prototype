var nedb = require('nedb');
var async = require('async');
var db = null;

exports.init_db = function(in_mem) {
	if (in_mem == null) {
		in_mem = true;
	}
	if (in_mem) {
		return db = new nedb;
	} else {
		return db = new nedb({
			filename: 'db/logdb.json',
			autoload: true
		});
	}
};

exports.docs = function(cb) {
	return db.find({}, function(err, docs) {
		return cb(docs);
	});
};

exports.create = function(msg_obj, cb) {
	if (msg_obj.status) {
		db.insert(msg_obj);
		db.update({
			_id: 'received_id',
			name: 'received'
		}, {
			$inc: {
				counter: 1
			}
		}, {
			upsert: true
		});
	} else {
		db.update({
			_id: 'malformed_id',
			name: 'malformed'
		}, {
			$inc: {
				counter: 1
			}
		}, {
			upsert: true
		});
	}
	return typeof cb === "function" ? cb() : void 0;
};

exports.stats = function(cb) {
	return async.parallel({
		received: function(cb) {
			return db.findOne({
				name: 'received'
			}, function(err, doc) {
				if (doc) {
					return cb(null, doc.counter);
				} else {
					return cb(null, 0);
				}
			});
		},
		malformed: function(cb) {
			return db.findOne({
				name: 'malformed'
			}, function(err, doc) {
				if (doc) {
					return cb(null, doc.counter);
				} else {
					return cb(null, 0);
				}
			});
		},
		first: function(cb) {
			return db.find({
				status: true
			}).sort({
				event_date: 1
			}).limit(1).exec(function(err, docs) {
				if (docs.length === 0) {
					return cb(null, null);
				} else {
					return cb(null, docs[0].event_date);
				}
			});
		},
		last: function(cb) {
			return db.find({
				status: true
			}).sort({
				event_date: -1
			}).limit(1).exec(function(err, docs) {
				if (docs.length === 0) {
					return cb(null, null);
				} else {
					return cb(null, docs[0].event_date);
				}
			});
		}
	}, function(err, results) {
		return cb(results);
	});
};

exports.logs = function(num, startTime, endTime, ip, cat, event, action, cb) {
	var query, range;
	query = {
		status: true
	};
	range = {};
	if (startTime) {
		range['$gt'] = startTime;
	}
	if (endTime) {
		range['$lt'] = endTime;
	}
	if (startTime || endTime) {
		query.event_date = range;
	}
	if (ip) {
		query.ip = ip;
	}
	if (cat) {
		query.category = {
			$regex: new RegExp(cat, 'i')
		};
	}
	if (event) {
		query.event = {
			$regex: new RegExp(event, 'i')
		};
	}
	if (action) {
		query.action = {
			$regex: new RegExp(action, 'i')
		};
	}
	return db.find(query).sort({
		event_date: -1
	}).limit(num).exec(function(err, docs) {
		var doc, i, len, obj;
		logs = [];
		for (i = 0, len = docs.length; i < len; i++) {
			doc = docs[i];
			obj = {
				time: doc.event_date,
				ip: doc.ip,
				cat: doc.category,
				event: doc.event,
				action: doc.action,
				message: doc.message
			};
			logs.push(obj);
		}
		return cb(logs);
	});
};