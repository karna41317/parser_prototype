"use strict";
var msg, p, parser;

parser = GLOBAL.parser;

msg = '<123>[2014-09-01 13:04:11] EFW: SYSTEM: prio=2 id=03204001 rev=1 event=accept_configuration action=using_new_config';
msg = '<134>[2014-09-01 13:04:04] EFW: NETCON: prio=1 id=02300001 rev=1 event=init_complete';
msg = '<134>[2014-09-01 13:04:09] EFW: SYSTEM: prio=2 id=03202001 rev=2 event=startup_echo delay=5 corever=10.21.00.15-24791 build="Aug 20 2014" uptime=6243 cfgfile="core.cfg" localcfgver=258 remotecfgver=0 previous_shutdown="2014-09-01 13:03:59: Activating configuration changes"';
msg = '<134>[2014-09-01 13:04:11] EFW: SYSTEM: prio=2 id=03204001 rev=1 event=accept_configuration action=using_new_config username=admin userdb=AdminUsers client_ip=172.16.10.1 config_system=HTTP';

describe('parse', function() {
	it('parses msg with all mandatory attributes', function() {
		var msg_obj;
		msg = '<123>[2014-09-01 13:04:11] EFW: SYSTEM: prio=2 id=03204001 rev=1 event=accept_configuration';
		msg_obj = parser.parse_msg(msg);
		msg_obj.pri.should.equal('<123>');
		msg_obj.event_date.toString().should.equal(new Date('2014-09-01 13:04:11').toString());
		msg_obj.efw.should.equal('EFW');
		msg_obj.category.should.equal('SYSTEM');
		msg_obj.prio.should.equal('2');
		msg_obj.id.should.equal('03204001');
		msg_obj.rev.should.equal('1');
		return msg_obj.event.should.equal('accept_configuration');
	});

	it('parses msg with action, without message', function() {
		var msg_obj;
		msg = '<123>[2014-09-01 13:04:11] EFW: SYSTEM: prio=2 id=03204001 rev=1 event=accept_configuration action=using_new_config';
		msg_obj = parser.parse_msg(msg);
		msg_obj.action.should.equal('using_new_config');
		return (msg_obj.message === void 0).should.be["true"];
	});

	it('parses msg without action, with message', function() {
		var msg_obj;
		msg = '<134>[2014-09-01 13:04:09] EFW: SYSTEM: prio=2 id=03202001 rev=2 event=startup_echo delay=5 corever=10.21.00.15-24791 build="Aug 20 2014" uptime=6243 cfgfile="core.cfg" localcfgver=258 remotecfgver=0 previous_shutdown="2014-09-01 13:03:59: Activating configuration changes"';
		msg_obj = parser.parse_msg(msg);
		(msg_obj.action === void 0).should.be["true"];
		return msg_obj.message.should.equal('delay=5 corever=10.21.00.15-24791 build="Aug 20 2014" uptime=6243 cfgfile="core.cfg" localcfgver=258 remotecfgver=0 previous_shutdown="2014-09-01 13:03:59: Activating configuration changes"');
	});

	it('parses msg with action, with message', function() {
		var msg_obj;
		msg = '<134>[2014-09-01 13:04:11] EFW: SYSTEM: prio=2 id=03204001 rev=1 event=accept_configuration action=using_new_config username=admin userdb=AdminUsers client_ip=172.16.10.1 config_system=HTTP';
		msg_obj = parser.parse_msg(msg);
		msg_obj.action.should.equal('using_new_config');
		return msg_obj.message.should.equal('username=admin userdb=AdminUsers client_ip=172.16.10.1 config_system=HTTP');
	});

});