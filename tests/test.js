const test = require('ava');
const { configure } = require('log4js');

const { default: a } = require('../dist/index');

configure('./log4js.json');

/**
INSERT INTO "user_auths" ("id", "user_id", "identity_type", "identifier", "credential", "last_active", "ip") VALUES
('14d075a2-ebfc-473a-8ebf-3d8cd81e53eb',	'da6e8226-2356-4b61-ae8c-0455430def0b',	'usercode',	'taoqiufeng',	'0da381d779a7507eae3e9bd2a02b675a', 1580443997832, '127.0.0.1');

INSERT INTO "users" ("id", "info") VALUES
('da6e8226-2356-4b61-ae8c-0455430def0b',	'{"nickname":"taoqf","email":"taoqiufeng@ifeidao.com","phone":"18937139411"}');

insert into role (id, name) values ('r01', 'guest'), ('r02', 'admin');
insert into menu (id, name, parent, priority, url, authcode) values ('m01', '菜单1', null, 0, 'p001.html', 0),('m02', '菜单2', null, 0, 'p002.html', 0),('m03', '菜单3', 'm01', 0, 'p003.html', 0),('m04', '菜单4', 'm01', 1, 'p004.html', 0),('m05', '菜单5', 'm04', 0, 'p005.html', 0),('m06', '菜单6', 'm04', 0, 'p006.html', 0);
insert into userole (userid, roleid) values ('da6e8226-2356-4b61-ae8c-0455430def0b','r01'), ('da6e8226-2356-4b61-ae8c-0455430def0b','r02');
insert into rolemenu (roleid, menuid) values ('r02', 'm03'), ('r02', 'm06');
 */
const sessionid = '01639a1d-50bf-4cdf-b398-add9eb8ddf9e';

const info = {
	"id": "da6e8226-2356-4b61-ae8c-0455430def0b",
	"userid": "taoqiufeng",
	"info": {
		"nickname": "taoqf",
		"email": "taoqiufeng@ifeidao.com",
		"phone": "18937139411"
	},
	"sessionid": sessionid,
	"roles": [{
		"id": "r01",
		"name": "guest"
	},
	{
		"id": "r02",
		"name": "admin"
	}],
	"menus": [{
		"id": "m01",
		"name": "菜单1",
		"parent": null,
		"priority": 0,
		"url": "p001.html",
		"authcode": 0,
		"submenus": [{
			"id": "m04",
			"name": "菜单4",
			"parent": "m01",
			"priority": 1,
			"url": "p004.html",
			"authcode": 0,
			"submenus": [{
				"id": "m06",
				"name": "菜单6",
				"parent": "m04",
				"priority": 0,
				"url": "p006.html",
				"authcode": 0,
				"submenus": []
			}]
		},
		{
			"id": "m03",
			"name": "菜单3",
			"parent": "m01",
			"priority": 0,
			"url": "p003.html",
			"authcode": 0,
			"submenus": []
		}]
	}]
};

test('get user role and menus', async (t) => {
	const ran94 = await a(sessionid);
	t.deepEqual(ran94, info);
});
