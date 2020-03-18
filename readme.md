# 获取用户角色菜单

## redis

考虑到可多实例部署情况，需要用到redis数据库用来存储用户session

## postgres

用户数据存储到postgres数据库中，其json字段更便于存储可扩展的用户信息

## 用户表

### 表结构

#### 角色表

字段名|字段类型|字段描述
---|---|---
id|text|角色ID
name|text|角色名称

#### 菜单表

字段名|字段类型|字段描述
---|---|---
id|text|菜单ID
name|text|菜单名称
parent|text|父级菜单ID
priority|smallint|显示优先级
url|text|页面地址
authcode|smallint|用户控制码，每一位表示页面上一个功能（通常为按钮）是否可用，比如0b01表示第一个功能可用,0b11表示第一和第二个功能可用，而0b10表示第二个功能可用，第一个功能不可用

#### 角色菜单关联表

字段名|字段类型|字段描述
---|---|---
roleid|text|角色ID role.id
menuid|text|菜单ID menu.id

#### 用户角色关联表

字段名|字段类型|字段描述
---|---|---
userid|text|用户ID user.id
roleid|text|角色ID role.id

### 建表语句

```sql
DROP TABLE IF EXISTS role;
CREATE TABLE role
(
	id text NOT NULL,
	name text NOT NULL,
	PRIMARY KEY (id)
)
WITH (oids = false);

COMMENT ON TABLE role IS '角色表';
COMMENT ON COLUMN role.name IS '角色名称';

DROP TABLE IF EXISTS menu;
CREATE TABLE menu
(
	id text NOT NULL,
	name text NOT NULL,
	parent text,
	priority smallint,
	url text,
	authcode smallint,
	PRIMARY KEY (id)
)
WITH (oids = false);

COMMENT ON TABLE menu IS '菜单表';
COMMENT ON COLUMN menu.id IS '菜单ID';
COMMENT ON COLUMN menu.name IS '菜单名称';
COMMENT ON COLUMN menu.parent IS '父级菜单ID';
COMMENT ON COLUMN menu.priority IS '显示优先级';
COMMENT ON COLUMN menu.url IS '页面地址';
COMMENT ON COLUMN menu.authcode IS '用户控制码，每一位表示页面上一个功能（通常为按钮）是否可用，比如0b01表示第一个功能可用,0b11表示第一和第二个功能可用，而0b10表示第二个功能可用，第一个功能不可用';

DROP TABLE IF EXISTS rolemenu;
CREATE TABLE rolemenu
(
	roleid text NOT NULL,
	menuid text NOT NULL,
	CONSTRAINT pk_rolemenu PRIMARY KEY (roleid, menuid)
)
WITH (oids = false);

COMMENT ON TABLE rolemenu IS '角色菜单关联表';
COMMENT ON COLUMN rolemenu.roleid IS '角色ID role.id';
COMMENT ON COLUMN rolemenu.menuid IS '菜单ID menu.id';

DROP TABLE IF EXISTS userole;
CREATE TABLE userole
(
	userid text NOT NULL,
	roleid text NOT NULL,
	CONSTRAINT pk_userole PRIMARY KEY (userid, roleid)
)
WITH (oids = false);

COMMENT ON TABLE userole IS '用户角色关联表';
COMMENT ON COLUMN userole.userid IS '用户ID user.id';
COMMENT ON COLUMN userole.roleid IS '角色ID role.id';
```

## 完整的配置文件

```json
{
	"redis": {
		"url": "redis://127.0.0.1:6379",
		"expiration": 20000
	},
	"dbs": {
		"sys": {
			"type": "postgres",
			"source": "postgres://mmstudio:Mmstudio123@127.0.0.1:5432/mmstudio"
		}
	}
}
```

## docker-file

[docker-compose安置](https://download.daocloud.io/Docker_Mirror/Docker_Compose)

```yml
version: '3.7'

services:
  redis:
    image: redis
    container_name: redis
    ports:
      - 6379:6379
    # networks:
    #   - app

  postgres:
    image: postgres
    container_name: postgres
    volumes:
      - /home/taoqf/data/postgre:/var/lib/postgresql/data
    restart: always
    environment:
      POSTGRES_DB: mmstudio
      POSTGRES_USER: mmstudio
      POSTGRES_PASSWORD: Mmstudio123
    ports:
      - 5432:5432
  adminer:
    container_name: adminer
    image: adminer
    restart: always
    ports:
      - 8080:8080
```
