var db, dgram, exports, p, parser, set_db;

dgram = require('dgram');
parser = require('./parser');

db = null;

exports.set_db = set_db = function(_db) {
	return db = _db;
};

/*Starting syslog server*/

exports.start = function(syslog_port, cb) {
	var syslog = dgram.createSocket('udp4');
	syslog.on('message', function(message, remote) {
		var msg_obj;
		msg_obj = parser.parse_msg(message.toString());
		msg_obj.ip = remote.address;
		db.create(msg_obj);
	});

	syslog.bind(syslog_port, function() {
		return cb(syslog);
	});
};

/*Stopping syslog server*/

exports.stop = function(syslog) {
	return syslog.close();
};