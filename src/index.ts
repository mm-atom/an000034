import an14 from '@mmstudio/an000014';
import an16 from '@mmstudio/an000016';
import an17 from '@mmstudio/an000017';

interface IRole {
	id: string;
	name: string;
}

interface IMenu {
	id: string;
	name: string;
	parent: string;
	icon: string;
	priority: number;
	url: string;
	authcode: number;
	submenus: IMenu[];
}

interface IRolemenu {
	// roleid: string;
	menuid: string;
}

export interface IUserInfo {
	id: string;
	userid: string;
	info: { [key: string]: string };
	sessionid: string;
	roles: IRole[];
	menus: IMenu[];
}

const db = 'sys';

/**
 * 获取用户信息
 * @param client 端点名称 web, h5, xcx
 * @param productid 项目id
 * @param clienttype 端点类型，web：3,h5：2,xcx:9
 * @param role_no? 角色编号
 */
export default async function get_use_info(sessionid: string) {
	if (!sessionid) {
		return null;
	}
	const userinfo = await an17<IUserInfo>(sessionid);
	if (!userinfo) {
		return null;
	}
	// todo
	// if (userinfo.menus && userinfo.roles) {
	// 	return userinfo;
	// }
	const [roles] = await an14<IRole>(db, ['select t2.id as id, t2.name as name from role as t2 where t2.id in (select t1.roleid from userole as t1 where t1.userid=$1)', [userinfo.id]]);
	if (!roles) {
		throw new Error(`Could not find role for user:${userinfo.userid}`);
	}
	userinfo.roles = roles;
	if (roles.length === 0) {
		userinfo.menus = [];
	} else {
		const rs = roles.map((role) => {
			return `'${role.id}'`;
		});
		const [rolemenu] = await an14<IRolemenu>(db, [`select t.menuid from rolemenu as t where t.roleid in (${rs.join(',')});`, []]);
		// const [rolemenu] = await an14<IRolemenu>(db, ['select t.menuid from rolemenu as t where t.roleid in ($1);', [rs.join(',')]]);
		if (rolemenu.length === 0) {
			userinfo.menus = [];
		} else {
			const [allmenus] = await an14<IMenu>(db, ['select t.id,t.name,t.parent,t.priority,t.url,t.authcode from menu as t order by t.priority', []]);
			// map all menus
			const map_all = allmenus.reduce((pre, cur) => {
				return pre.set(cur.id, cur);
			}, new Map<string, IMenu>());
			// filt menus
			const map_menus = rolemenu.reduce((pre, cur) => {
				find(map_all, cur.menuid, pre);
				return pre;
			}, new Map<string, IMenu>());
			// tree menus
			const menus = get_roots(map_menus);
			const visible_menus = Array.from(map_menus.values());
			menus.forEach((m) => {
				get_sub(visible_menus, m);
			});
			// sort menus
			userinfo.menus = sort(menus);
		}
	}
	await an16(sessionid, userinfo);
	return userinfo;
}

function sort(menus: IMenu[]) {
	return menus.sort((a, b) => {
		return b.priority - a.priority;
	});
}

function get_sub(all: IMenu[], parent: IMenu) {
	parent.submenus = sort(all.filter((m) => {
		if (m.parent === parent.id) {
			get_sub(all, m);
			return true;
		}
		return false;

	}));
}

function get_roots(all: Map<string, IMenu>) {
	return Array.from(all.keys()).filter((it) => {
		const item = all.get(it)!;
		return !all.has(item.parent);
	}).reduce((pre, cur) => {
		pre.push(all.get(cur)!);
		return pre;
	}, [] as IMenu[]);
}

function find(all: Map<string, IMenu>, menuid: string, result: Map<string, IMenu>) {
	const menu = all.get(menuid);
	if (!menu) {
		return;
	}
	result.set(menuid, menu);
	find(all, menu.parent, result);
}
