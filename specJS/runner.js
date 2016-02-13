"use strict";
var Mocha, eq, m, opts, should;
Mocha = require('mocha');
should = require('should');

eq = function(a, b) {
	if (a) {
		return a.should.equal(b);
	} else if (a === null) {
		return (b === null).should.equal(true);
	} else {
		return (b === void 0).should.equal(true);
	}
};

GLOBAL.eq = eq;
GLOBAL.parser = require('../lib/parser');
GLOBAL.db = require('../lib/db');
GLOBAL.rest_api_server = require('../lib/rest_api_server');
GLOBAL.syslog_server = require('../lib/syslog_server');
GLOBAL.async = require('async');
GLOBAL.http = require('http');

opts = {
	ui: 'bdd',
	reporter: process.env.REPORTER || 'spec',
	grep: process.env.GREP,
	/*	compilers: 'coffee:coffee-script',
	 */
	require: 'should'
};

if (process.env.TRAVIS) {
	opts.reporter = 'dot';
}

m = new Mocha(opts);
if (process.env.INVERT) {
	m.invert();
}

m.addFile('specJS/parser.spec.js');
m.addFile('specJS/db.spec.js');
m.addFile('specJS/rest_api_server.spec.js');
m.addFile('specJS/syslog_server.spec.js');
m.addFile('specJS/acceptance.spec.js');

m.run(function(err) {
	var exitCode;
	exitCode = typeof err === "function" ? err({
		1: 0
	}) : void 0;
	return process.exit(exitCode);
});