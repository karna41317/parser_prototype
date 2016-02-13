var parsec = require('parsimmon');
var space = parsec.optWhitespace;
var string = parsec.string;
var digit = parsec.digit;
var digits = parsec.digits;
var letter = parsec.letter;
var letters = parsec.letters;
var all = parsec.all;

var seq = function(parser_list) {
	var r = parsec.seq.apply(this, parser_list);
	return r.map(function(x) {
		return x.join('');
	});
};

var action_parser, category_parser, efw_parser, event_date_parser, event_parser, id_parser, message_parser, parse_msg, pri_parser, prio_parser, rev_parser;

pri_parser = (function() {
	var format = [string('<'), digits, string('>')];
	return seq(format);
})();

event_date_parser = (function() {
	var colon, dash, day, format, hour, minute, month, second, year;
	dash = string('-');
	year = month = day = hour = minute = second = digits;
	colon = string(':');
	format = [string('['), year, dash, month, dash, day, string(' '), hour, colon, minute, colon, second, string(']')];
	return seq(format);
})();

efw_parser = (function() {
	var format = [string("EFW:")];
	return seq(format);
})();

category_parser = (function() {
	var format = [letters, string(':')];
	return seq(format);
})();

prio_parser = (function() {
	var format = [string("prio=").then(digit)];
	return seq(format);
})();

id_parser = (function() {
	var format = [string("id=").then(digits)];
	return seq(format);
})();

rev_parser = (function() {
	var format = [string("rev=").then(digit)];
	return seq(format);
})();

event_parser = (function() {
	var format = [
		string("event=").then(letter.or(string('_')).many().map(function(e) {
			return e.join('');
		}))
	];
	return seq(format);
})();

action_parser = (function() {
	var format = [
		string("action=").then(letter.or(string('_')).many().map(function(e) {
			return e.join('');
		}))
	];
	return seq(format);
})();

message_parser = all.map(function(e) {
	if (e === '') {
		return null;
	} else {
		return e;
	}
});

exports.parse_msg = function(msg) {

	var obj;
	var format = [
		pri_parser,
		event_date_parser,
		space.result(''),
		efw_parser,
		space.result(''),
		category_parser,
		space.result(''),
		prio_parser,
		space.result(''),
		id_parser,
		space.result(''),
		rev_parser,
		space.result(''),
		event_parser,
		space.result(''),
		action_parser.or(space.result(null)),
		space.result(''),
		message_parser
	];

	var parser = parsec.seq.apply(this, format);
	var ref = err = parser.parse(msg);
	var status = ref.status;
	var value = ref.value;
	var index = ref.index;
	var expected = ref.expected;

	if (status) {
		value = value.filter(function(e) {
			return e !== '';
		});

		var pri = value[0];
		var event_date = value[1];
		var efw = value[2];
		var category = value[3];
		var prio = value[4];
		var id = value[5];
		var rev = value[6];
		var event = value[7];
		var action = value[8];
		var message = value[9];

		return obj = {
			status: status,
			pri: pri,
			event_date: new Date(event_date.slice(1, +(event_date.length - 2) + 1 || 9e9)),
			efw: efw.slice(0, +(efw.length - 2) + 1 || 9e9),
			category: category.slice(0, +(category.length - 2) + 1 || 9e9),
			prio: prio,
			id: id,
			rev: rev,
			event: event,
			action: action || void 0,
			message: message || void 0
		};

	} else {
		return obj = {
			status: status,
			msg: parsec.formatError(msg, err)
		};
	}
};