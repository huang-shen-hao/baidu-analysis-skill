# 百度营销 Skill 故障排查手册

## 优先排查顺序

1. 检查 Payload 是否是合法 JSON，且包含 `action`。
2. 检查 action 是否在 `SKILL.md` 的 action 表中。
3. 检查 `userName` 是否是具体推广子账号用户名。
4. 检查 `accessToken` 是否存在、未过期，并具备目标账号权限。
5. 如果 token 缺失或过期，先按 [OAuth2.0 授权与 Token 管理](./oauth-token-flow.md) 获取或刷新 token。
6. 检查 `body` 字段是否符合对应 `docs/*.md` 的 DTO 要求。
7. 写接口检查是否已传 `confirmWrite:true`，新增计划是否设置 `pause=true`。

## 常见错误

| 现象 | 可能原因 | 建议 |
| --- | --- | --- |
| `Missing required parameter: --payload` | 未传入 Payload | 使用 `node scripts/api.ts --payload='{...}'`。 |
| `Unsupported action` | action 不在支持列表 | 查看 `SKILL.md` 的 action 表。 |
| `Action is not enabled` | 接口尚未官方确认 | 先补官方资料和 DTO 文档，再启用脚本 action。 |
| `Missing userName` | 未传账号 | 传 `payload.userName` 或设置 `BAIDU_USER_NAME`。 |
| `Missing accessToken` | token store 不存在或不可读 | 检查 `BAIDU_TOKEN_STORE`（默认 `~/.baidu-analysis/.baidu-auth.env`）；不要把 token 写进 `--payload`。 |
| `Missing appId` / `Missing secretKey` | 执行 OAuth token 获取或刷新时未提供应用凭证 | 设置环境变量 `BAIDU_APP_ID` / `BAIDU_SECRET_KEY`（不要走命令行参数）。 |
| token 过期或无效 | access token 已失效，或 refresh token 已失效 | 脚本会自动刷新一次；若仍失败，重新打开授权链接获取授权码后执行 `oauth-token-get`。 |
| `You are not authorized` | 账号、token 或权限不匹配 | 用同一账号先调用 `account-get` 验证授权。 |
| `Campaign id not exist` | 计划 ID 不属于当前账号 | 用 `campaign-get` 空 `campaignIds` 拉取当前账号计划列表后核对。 |
| `status=1` 且 `oprs` 小于 `quota` | 批量操作部分失败 | **禁止整批重试**，只重试 `failures[].position` 指向的条目。 |
| `deprecated: true` 告警 | 调用了 2023-04-19 已标注下线的 7 个 action | 可继续使用，但请按 [已下线接口说明](./deprecated-actions.md) 规划迁移。 |

> 错误码（81020 / 87091 / 9015 / 90127 等）与处置动作的完整对照见 [SKILL.md](../SKILL.md) 的「常见错误码与处置」。

## 写接口失败

- 先确认是否误用了 MCC/账户管家用户名。
- 再确认字段组合是否符合官方限制，例如预算、地域、时段、转化目标和出价模式。
- 如果是新增计划，先用最小字段创建暂停计划，再逐步加入复杂字段。
- 如果接口返回字段非法，记录“官方描述”“实测结果”“待确认项”，不要直接写死猜测字段。

## 相关文档

- [百度营销 Skill 执行标准](./execution-standard.md)
- [OAuth2.0 授权与 Token 管理](./oauth-token-flow.md)
- [已下线但仍可用的接口](./deprecated-actions.md)
