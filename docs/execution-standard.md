# 百度营销 Skill 执行标准

## 1. DTO 驱动

- 所有可执行能力统一通过 `scripts/api.ts` 调用。
- Payload 必须包含 `action`。
- Payload 中 `body` 尽量保持百度 API 原始业务 DTO，不做无依据字段映射。
- 用户只给业务参数时，脚本会补齐外层请求信封：`header` 和 `body`。

标准 Payload：

```json
{
  "action": "campaign-get",
  "userName": "子账号用户名",
  "body": {}
}
```

## 2. 鉴权与账号

- `userName` 优先来自 Payload，其次来自 `BAIDU_USER_NAME`。
- `accessToken` 优先来自 Payload，其次来自 `BAIDU_ACCESS_TOKEN`。
- 如果 `BAIDU_ACCESS_TOKEN` 不存在，脚本会尝试从 `BAIDU_TOKEN_STORE` 指向的 token store 加载。
- 如果本地记录显示 token 即将过期，或远端返回 token 过期/无效，脚本会使用 refresh token 自动刷新并重试一次。
- 首次授权和刷新规则见 [OAuth2.0 授权与 Token 管理](./oauth-token-flow.md)。
- MCC/账户管家场景下，查询或操作具体推广资源时通常应使用具体推广子账号用户名。
- 不得在 skill 文档、日志或最终回复中保存 token、密钥和客户账号映射。

## 3. 写接口安全

以下操作属于写接口或高影响操作：

- 新增、更新、删除推广计划。
- 更新推广账户信息。
- 暂停/启用计划。
- 调整预算、出价、地域、时段、否词或转化目标。

执行前必须确认：

- 推广账号。
- 操作对象和对象 ID。
- 旧值、新值和字段限制。
- 影响范围，包括是否影响真实投放和预算消耗。
- 回滚方案。

默认策略：

- 新增推广计划必须优先创建为暂停状态：`pause=true`。
- 写接口必须显式传 `confirmWrite`：`false` = 仅预演（不发送请求），`true` = 正式执行。
- 推荐流程：先 `confirmWrite:false` 预演 → 把返回的 `preview` 呈现给用户 → 用户确认后改 `true` 执行。
- 删除、启用、预算上调、出价上调必须等待用户明确授权。

## 4. 标准输出

成功输出：

```json
{
  "success": true,
  "partial": false,
  "action": "campaign-get",
  "version": "0.9.7",
  "request": {
    "traceId": "ff3d9072-87e4-11eb-b918-65622ff0d653",
    "httpStatus": 200,
    "qps": 100,
    "timeoutMs": 30000
  },
  "warnings": [],
  "data": {}
}
```

部分失败输出（官方 `header.status = 1`，脚本不报错）：

```json
{
  "success": true,
  "partial": true,
  "action": "keyword-add",
  "version": "0.9.7",
  "warnings": ["部分失败：提交 100 条，成功 97 条。请勿整批重试……"],
  "quota": 100,
  "oprs": 97,
  "failures": [
    { "code": 901231, "message": "Not authorized to set campaign budget", "position": "keywordTypes[3]", "class": "business", "retryable": false }
  ],
  "data": {}
}
```

失败输出：

```json
{
  "success": false,
  "errorCode": "BAIDU_USAGE_ERR",
  "message": "Failed to execute api action",
  "details": "Missing required field: action",
  "suggestion": "检查 Payload JSON、action、userName/accessToken、接口字段和写接口确认项。"
}
```

## 5. 错误码

| errorCode | 分类 | 触发场景 |
| --- | --- | --- |
| `BAIDU_USAGE_ERR` | Agent 使用错误 | Payload 缺失、JSON 格式错误、action 不支持、必填字段缺失、取值越界、写接口未确认、未替换的 `{{...}}` 占位符。 |
| `BAIDU_AUTH_ERR` | 鉴权错误 | 缺少 `userName`、缺少 `accessToken`、账号授权不可用。 |
| `BAIDU_REMOTE_ERR` | 远端错误 | 百度接口返回 4xx/5xx、业务失败、响应非 JSON 或缺少 `header`。 |
| `BAIDU_TIMEOUT_ERR` | 超时 | 超过 `BAIDU_HTTP_TIMEOUT_MS`（默认 30s）未返回，标记 `retryable: true`。 |
| `BAIDU_INTERNAL_ERR` | 脚本内部 | 注册表与校验器不一致（写操作缺校验器）等结构性错误。 |
| `BAIDU_ENV_ERR` | 环境错误 | Node 版本、网络或运行环境异常。 |

### 5.1 结构化错误字段

远端失败时附带：

- `baiduCode`：官方错误码（节点 166：8xxx 系统错误 / 901xxx 搜索推广业务错误 / 925xxx 图文广告错误）
- `baiduClass`：`auth` / `permission` / `system` / `business` / `usage` / `unknown`
- `retryable`：是否建议重试（写操作即使标记可重试，也需先确认上次调用是否已生效）
- `ticket`：`status=3` 系统错误时官方提供的定位串，向百度提工单必须提供
- `traceId`：响应头 `X-B3-Traceid`，唯一标识本次请求

### 5.2 部分失败处理（强制）

`status=1` 表示部分失败。批量写入出现部分失败时**禁止整批重试**，只重试 `failures[].position` 指向的条目，否则已成功的条目会被重复创建。

### 5.3 QPS

官方 QPS 表见 SKILL.md；未列出的接口统一为 10。输出中的 `request.qps` 即该接口上限，调用方据此做并发背压。

## 6. 相关文档

- [故障排查手册](./troubleshooting-guide.md)（含错误码处置与接口存活探针）
- [OAuth2.0 授权与 Token 管理](./oauth-token-flow.md)
- [已下线但仍可用的接口](./deprecated-actions.md)
