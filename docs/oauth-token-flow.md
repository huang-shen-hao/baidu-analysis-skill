# OAuth2.0 授权与 Token 管理

## Trigger

首次调用百度营销 API、`BAIDU_ACCESS_TOKEN` 缺失、接口提示 token 过期或无效时使用。

## Action

- `oauth-auth-url`：生成授权链接。
- `oauth-token-get`：使用回调 URL 中的授权码换取 access token 和 refresh token。
- `oauth-token-refresh`：使用 refresh token 换取新的 access token。
- `oauth-user-info-get`：查询授权用户信息和可选子账号列表。

## 环境变量

敏感信息只允许通过运行时环境变量或 payload 传入，不得写入文档、日志或最终回复。

| 变量 | 说明 |
| --- | --- |
| `BAIDU_APP_ID` | 百度商业开发者中心应用 appId |
| `BAIDU_SECRET_KEY` | 百度商业开发者中心应用 secretKey |
| `BAIDU_OAUTH_AUTH_LINK` | 开发者中心生成的完整授权链接；配置后 `oauth-auth-url` 会优先返回该链接 |
| `BAIDU_PLATFORM_ID` | 授权链接中的 platformId；生成授权链接时必需，除非 `BAIDU_OAUTH_AUTH_LINK` 已经包含 `platformId` |
| `BAIDU_OAUTH_SCOPE` | 授权 scope，可选 |
| `BAIDU_OAUTH_CALLBACK` | 应用回调地址，默认 `https://www.baidu.com` |
| `BAIDU_OAUTH_ACCESS_TOKEN_URL` | 换取授权令牌接口地址，默认 `https://u.baidu.com/oauth/accessToken` |
| `BAIDU_OAUTH_REFRESH_TOKEN_URL` | 更新授权令牌接口地址，默认 `https://u.baidu.com/oauth/refreshToken` |
| `BAIDU_OAUTH_USER_INFO_URL` | 查询授权用户信息接口地址，默认 `https://u.baidu.com/oauth/getUserInfo` |
| `BAIDU_TOKEN_STORE` | token 存储文件，默认当前目录 `.baidu-auth.env` |

## 流程

1. 生成或使用开发者中心提供的授权链接，让推广用户登录并确认授权。
2. 授权成功后，浏览器会跳转到 callback，URL 查询参数里会带临时授权码 `authCode` 和同意授权的推广账户 `userId`。
3. 调用 `oauth-token-get` 换取 token。脚本会把 `BAIDU_ACCESS_TOKEN`、`BAIDU_REFRESH_TOKEN`、`BAIDU_TOKEN_EXPIRES_AT` 写入 token store。
4. 之后调用业务接口时，`scripts/api.ts` 会自动加载 token store；如果本地记录显示 access token 即将过期，会先使用 refresh token 刷新。
5. 如果业务接口返回 token 过期或无效，脚本会自动刷新一次并重试原请求。
6. 授权完成后先执行 `oauth-user-info-get` 确认授权账户类型；如果是超管账户、客户中心或账户管家，再执行 `mcc-account-get` 展示全部子账号列表，让用户指定具体 `username` 后再查询账户、计划、单元、创意、关键词或报表。

## 会话前置检查

当用户要求查询账户、计划、单元、创意、关键词、报表或其他业务接口时，先检查：

- 是否已有 `BAIDU_APP_ID`、`BAIDU_SECRET_KEY`、`BAIDU_OAUTH_AUTH_LINK`。
- 是否已有 token store，且能通过 `oauth-user-info-get` 验证授权账户。
- 如果缺 token，先让用户打开授权链接并返回 callback URL 中的 `authCode`、`userId`，再执行 `oauth-token-get`。
- 如果是账户管家授权，先执行 `mcc-account-get` 展示所有子账号，等待用户选择 `username`。

## 换取授权令牌接口

- 接口地址：`POST https://u.baidu.com/oauth/accessToken`
- `Content-Type`：`application/json;charset:utf-8;`
- 请求体字段：`appId`、`authCode`、`secretKey`、`grantType`、`userId`
- `grantType` 固定为 `auth_code`
- 成功响应：`code=0`，`data.accessToken`、`data.refreshToken`、`data.openId`、`data.expiresTime`、`data.refreshExpiresTime`、`data.expiresIn`、`data.refreshExpiresIn`、`data.userId`

## 更新授权令牌接口

- 接口地址：`POST https://u.baidu.com/oauth/refreshToken`
- `Content-Type`：`application/json;charset:utf-8;`
- 请求体字段：`appId`、`secretKey`、`userId`、`refreshToken`
- 成功响应：`code=0`，`data.accessToken`、`data.refreshToken`、`data.openId`、`data.expiresTime`、`data.refreshExpiresTime`、`data.expiresIn`、`data.refreshExpiresIn`

## 查询授权用户信息接口

- 接口地址：`POST https://u.baidu.com/oauth/getUserInfo`
- `Content-Type`：`application/json;charset:utf-8;`
- 必填字段：`openId`、`accessToken`、`userId`
- 可选字段：`needSubList`、`pageSize`、`lastPageMaxUcId`
- `pageSize` 默认 100，最大不超过 500。
- 查询子账号列表时 `needSubList=true`，`lastPageMaxUcId` 必填；第一次获取子账号列表时设置为 `1`。
- 成功响应：`code=0`，`data.masterUid`、`data.masterName`、`data.userAcctType`、`data.hasNext`、`data.subUserList`

`userAcctType`：`1` 普通账户，`2` 超管账户（客户中心和账户管家），`4` 代理商账户。

## 生成授权链接

```bash
node scripts/api.ts --payload='{"action":"oauth-auth-url","platformId":"平台ID","appId":"应用ID","scope":"授权范围","callback":"https://www.baidu.com"}'
```

如果已经把完整授权链接保存为 `BAIDU_OAUTH_AUTH_LINK`，可以直接执行：

```bash
node scripts/api.ts --payload='{"action":"oauth-auth-url"}'
```

推广用户打开授权链接并确认后，callback URL 会带回 `authCode` 和 `userId`，再用 `oauth-token-get` 换取授权令牌。

## 使用授权码换 token

```bash
node scripts/api.ts --payload='{"action":"oauth-token-get","authCode":"回调URL里的authCode","userId":123456,"appId":"应用ID","secretKey":"应用密钥"}'
```

成功后输出不会包含 token 明文，只会返回 token 已存储、过期时间和 token store 路径。

## 刷新 token

```bash
node scripts/api.ts --payload='{"action":"oauth-token-refresh"}'
```

刷新时脚本优先从 token store 读取 `BAIDU_REFRESH_TOKEN` 和 `BAIDU_AUTH_USER_ID`。如果 `BAIDU_APP_ID` / `BAIDU_SECRET_KEY` 没有配置为环境变量，也可以在 payload 中临时传入 `appId` / `secretKey`。

## 查询授权用户信息

```bash
node scripts/api.ts --payload='{"action":"oauth-user-info-get"}'
```

查询子账号第一页：

```bash
node scripts/api.ts --payload='{"action":"oauth-user-info-get","needSubList":true,"pageSize":100,"lastPageMaxUcId":1}'
```

脚本优先从 token store 读取 `BAIDU_OPEN_ID`、`BAIDU_ACCESS_TOKEN` 和 `BAIDU_AUTH_USER_ID`。如果 access token 即将过期或远端提示过期，会先刷新再查询。

## 安全要求

- `.baidu-auth.env` 必须加入 `.gitignore`，不得提交。
- 不要把 appId、secretKey、access token、refresh token 写入 skill 文档、测试记录或最终回复。
- 如果 refresh token 也失效，必须重新走推广用户授权流程获取新的授权码。
