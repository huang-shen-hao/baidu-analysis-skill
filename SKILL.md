---
name: baidu-analysis
slug: baidu-analysis
version: 0.9.8
displayName: 百度推广助手
description: "通过百度营销 API 查询和操作百度推广账户的投放数据与结构：账户消耗/余额、MCC 子账号、计划/单元/创意/关键词、关键词规划师（种子词拓词、账户推荐词、流量预估）、否定关键词与否词包、oCPC 出价策略、创意组件与图片素材、数据报表、转化追踪。适用于「看消耗/余额/报表」「改预算/暂停计划」「加否词」「查搜索词」「拓词/估词量」「查/绑图片素材」等百度投放需求，需要已完成 OAuth 授权并指定推广账号（MCC 账户需先选择子账号），写操作必须先获得用户确认。"
summary: 在对话中查询和操作百度推广账户：消耗、报表、计划、否词、图片素材
homepage: https://github.com/huang-shen-hao/baidu-analysis-skill
license: Apache-2.0
tags: ["百度推广", "百度营销", "广告投放", "marketing", "sem", "oCPC", "数据报表"]
metadata:
  category: productivity
  updated: 2026-10-22
  actions: 73
  deprecated_actions: 7
  entrypoint: scripts/api.ts
  requires:
    bins: ["node"]
---

# 百度推广助手

版本：0.9.7

本项目采用 **DTO 驱动 (Interface-Driven)** 的架构模式。所有可自动化功能均通过 `scripts/api.ts` 配合标准化 DTO Payload 进行调用。

## 核心原则

1. **接口即标准**：所有功能调用严格基于百度营销 API 的 Request DTO、官方文档和已验证字段。
2. **文档即指引**：`docs/` 下的 Markdown 文档解释对应 action 的参数规则、必填项、字段限制和安全要求。
3. **统一入口**：所有 API 功能统一通过 `node scripts/api.ts --payload='{...}'` 执行，`action` 字段必填。
4. **轻映射透传**：Payload 中的 `body` 尽量透传百度 API 业务参数；脚本只补标准请求信封、鉴权、action 分发和必要预检。
5. **对话驱动**：助手将自然语言转换为明确的 action、账号、对象 ID、字段和值；写接口必须先确认风险和回滚方案。
6. **Token 自动化**：首次授权、token 获取、过期刷新统一遵循 [OAuth2.0 授权与 Token 管理](./docs/oauth-token-flow.md)，不得把密钥或 token 写入文档和回复。

> [!IMPORTANT]
> **严格执行标准**：
> 1. 所有调用行为、错误处理和输出格式必须遵循 [百度营销 Skill 执行标准](./docs/execution-standard.md)。
> 2. 遇到脚本报错、鉴权失败、字段错误或接口返回异常时，优先查阅 [故障排查手册](./docs/troubleshooting-guide.md)。
> 3. 写接口如新增、更新、删除、暂停/启用计划，必须先确认账号、对象、字段、影响范围和回滚方案。
> 4. 不得把 token、密钥、客户线索、消费明细或账号映射写入 skill 文档、日志或最终回复。

## 禁止事项（反模式）

以下都是实际踩过的坑，比正向清单更容易出错：

1. **不要用 MCC / 账户管家 / 超管账号名直接调业务接口**——先 `mcc-account-get` 取子账号，再用子账号 `username`。
2. **不要在大时间区间上直查报表**——一次拉数月全账户会撑爆上下文；先缩小时间范围与列，必要时分批。
3. **不要对写操作盲目重试**——`status=1`（部分失败）时已成功的条目会被重复创建，只重试 `failures[].position` 指向的条目；`image-delete` 这类接口官方明确**无部分成功语义**，重试前先查证。
4. **不要靠关键词猜 token 是否失效**——按错误码判定（8401/8402/8403/8408/8410/8412）。
5. **不要把凭据放进 `--payload` 或命令行**——会进进程列表与 shell history；用环境变量或 `--payload-file`。
6. **不要把 `{{...}}` 模板占位符当真实值传入**——脚本会拒绝；原样发出会静默查询错误账号并跳过自动刷新。
7. **不要为了"看起来完整"全量拉取**——按需指定返回字段，只取用得上的列。
8. **不要在文档、日志或回复里留 token、密钥、客户线索、消费明细或账号映射。**
9. **不要传未在文档中列出的顶层字段**——脚本会直接报错。历史上 `dry_run`（下划线拼错）会被静默忽略，导致"以为在预演、实际已执行"。
10. **不要把写操作一次性执行**——先 `confirmWrite:false` 预演并把 `preview` 呈现给用户，用户明确回复同意后再改 `true` 执行。

## 统一执行指令

所有 API 功能统一通过 [scripts/api.ts](./scripts/api.ts) 脚本执行。调用时通过 `--payload` 传入 JSON，且 `action` 字段为必填项。

## 凭据读取与判定规则

调用业务接口前，按 `scripts/api.ts` 的实际读取逻辑判断凭据是否可用，不要用全盘搜索结果替代运行环境判断：

1. 先检查**当前进程环境变量**，不要用全盘搜索文件代替。Agent 平台或 shell 启动文件都会把变量注入进程环境，因此即使 `~/.zshrc`、`~/.zprofile`、skill 目录里找不到相关项，也不能据此判定凭据缺失。
2. 固定应用凭据读取自环境变量：`BAIDU_APP_ID`、`BAIDU_SECRET_KEY`。这两个值可以由宿主环境、平台注入或 shell 启动文件提供，不要求保存在 token store。
3. 动态登录态读取自 token store。优先使用环境变量 `BAIDU_TOKEN_STORE` 指向的文件；未设置时读取默认路径 `~/.baidu-analysis/.baidu-auth.env`（不再读取当前工作目录，避免把 refresh token 落在代码仓库里）。
3.1 不要把 `userName`、`accessToken` 写成 `{{BAIDU_XXX}}` 之类的模板占位符塞进 `--payload`：脚本会直接拒绝未替换的占位符（`BAIDU_USAGE_ERR`），因为占位符一旦原样发出会静默查询一个错误的账号，并跳过 token 自动刷新。
4. Token store 应保存 `BAIDU_ACCESS_TOKEN`、`BAIDU_REFRESH_TOKEN`、`BAIDU_TOKEN_EXPIRES_AT`、`BAIDU_REFRESH_TOKEN_EXPIRES_AT`、`BAIDU_AUTH_USER_ID`、`BAIDU_OPEN_ID` 等会变化的登录态。`BAIDU_ACCESS_TOKEN` 和 `BAIDU_REFRESH_TOKEN` 不需要出现在 shell 环境里；只要 token store 可读，脚本会自动加载。
5. 检查配置时只输出 `set`、`missing`、`readable`、`unreadable` 等状态，不要打印 token、secret、客户账号映射或完整授权凭据。
6. 不要在整个用户目录里搜索 token 或 secret 来证明“没有配置”。正确判定方式是：检查当前进程环境中的 `BAIDU_TOKEN_STORE` / `BAIDU_APP_ID` / `BAIDU_SECRET_KEY`，再检查 token store 文件是否存在且可读。

## 标准会话启动流程

后续使用本 skill 调用任何百度营销业务接口前，必须先完成账号上下文建立：

1. 按上节「凭据读取与判定规则」确认凭据状态：`BAIDU_APP_ID`、`BAIDU_SECRET_KEY` 在进程环境中可用，token store 可读（`BAIDU_ACCESS_TOKEN` 等只存在 token store，不要复制到 skill 目录）。
2. 生成授权链接时必须确认 `platformId` 可用：要么环境变量 `BAIDU_PLATFORM_ID` 已设置，要么 `BAIDU_OAUTH_AUTH_LINK` 的查询参数中包含 `platformId`。缺失时不要给用户授权链接，先提示补充注册平台 ID。
3. 若缺少 `BAIDU_APP_ID`、`BAIDU_SECRET_KEY`、`BAIDU_OAUTH_AUTH_LINK` 或 token store，不要直接调用业务接口；先提示用户提供 appId、secretKey 和授权链接，或让用户打开授权链接并返回 callback URL 中的 `authCode`、`userId`。
4. 如果已配置授权链接但未换 token，先执行 `oauth-auth-url` 展示授权链接，再用用户返回的 `authCode`、`userId` 执行 `oauth-token-get`。
5. 如果已有 token store，先执行 `oauth-user-info-get` 验证授权账户；token 过期时脚本会自动刷新并写回 `BAIDU_TOKEN_STORE`。
6. 授权账户是超管账户、客户中心或账户管家时，先执行 `mcc-account-get`，展示全部下辖子账号的 `userid`、`username`、`mccid`、`fatname`，让用户指定具体 `username`。
7. 后续 `account-get`、计划、单元、创意、关键词、报表等业务接口默认使用用户指定的子账号 `username`，不要用超管账号名直接查询账户级业务接口，除非对应接口文档明确支持。

## action 索引

下表只用于把用户意图路由到 `action`，**不含参数细节**。每个 action 的完整参数、必填约束、示例与限制见 `docs/<action 名>.md`；OAuth 相关见 `docs/oauth-token-flow.md`；已下线的 7 个 action 见 `docs/deprecated-actions.md`。

### 账户管理

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `oauth-auth-url` | 生成 OAuth2.0 授权链接 | READ |
| `oauth-token-get` | 使用授权码获取 access token / refresh token | READ |
| `oauth-token-refresh` | 使用 refresh token 刷新 access token | READ |
| `oauth-user-info-get` | 查询授权用户信息和子账号列表 | READ |
| `mcc-account-get` | 查询账户管家下辖子账号 | READ |
| `account-get` | 查询推广账户信息 | READ |
| `account-update` | 更新推广账户信息 | WRITE |

### 推广计划

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `campaign-get` | 查询推广计划 | READ |
| `campaign-add` | 新增推广计划 | WRITE |
| `campaign-update` | 更新推广计划 | WRITE |
| `campaign-delete` | 删除推广计划 | WRITE |

### 推广单元

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `adgroup-get` | 查询推广单元 | READ |
| `adgroup-add` | 新增推广单元 | WRITE |
| `adgroup-update` | 更新推广单元 | WRITE |
| `adgroup-delete` | 删除推广单元 | WRITE |

### 单元图片素材绑定（⚠️ 官方已标注下线，实测仍可用）

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `adgroup-image-segment-bind-get` | 查询单元图片素材绑定 | READ |
| `adgroup-image-segment-bind-add` | 新增单元图片素材绑定 | WRITE |
| `adgroup-image-segment-bind-delete` | 删除单元图片素材绑定 | WRITE |

> 官方标注 2023-04-19 下线，但实测仍可用（返回真实数据）。新流程优先使用 `segment-bind-*`。

### 创意

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `creative-get` | 查询创意 | READ |
| `creative-add` | 新增创意 | WRITE |
| `creative-update` | 更新创意 | WRITE |
| `creative-delete` | 删除创意 | WRITE |

### 业务类目

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `all-business-point-get` | 获取全量推广业务类目 | READ |
| `bind-business-point-list-get` | 查询计划已使用的推广业务 | READ |

### 互动创意 (Danube)

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `danube-constants-get` | 获取互动创意常量 (行业/分类/标签) | READ |
| `danube-creative-group-get` | 查询互动创意组 | READ |
| `danube-creative-group-copy` | 复制互动创意组 | WRITE |
| `danube-creative-group-add` | 新增互动创意组 | WRITE |
| `danube-creative-group-update` | 更新互动创意组 | WRITE |
| `danube-creative-group-delete` | 删除互动创意组 | WRITE |

### 关键词

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `keyword-get` | 查询关键词 | READ |
| `keyword-add` | 新增关键词 | WRITE |
| `keyword-update` | 更新关键词 | WRITE |
| `keyword-delete` | 删除关键词 | WRITE |

### 关键词规划师

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `keyword-planner-recommend-get` | 种子词拓词（一次一个种子词，返回推荐词 + 月均搜索量 + 指导价） | READ |
| `keyword-planner-custom-get` | 账户主动推荐词（按计划/单元 id 推荐） | READ |
| `keyword-planner-pv-get` | 关键词流量预估（批量 1–1000 词：月均 pv/展现/点击/指导价） | READ |

> ⚠️ `competition` 竞争度方向**两个接口相反**：`recommend` 是 1 低 / 2 中 / 3 高，`custom` 是 1 高 / 2 中 / 3 低，跨接口套阈值会判反。

### 否定关键词

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `negative-keyword-get` | 查询否定关键词 | READ |
| `negative-keyword-add` | 添加否定关键词 | WRITE |
| `negative-keyword-update` | 修改否定关键词 | WRITE |
| `negative-keyword-delete` | 删除否定关键词 | WRITE |

### 否词包

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `negative-keyword-packet-get` | 查询否词包 | READ |
| `negative-keyword-packet-add` | 新增否词包 | WRITE |
| `negative-keyword-packet-update` | 更新否词包 | WRITE |
| `negative-keyword-packet-delete` | 删除否词包 | WRITE |

### oCPC 出价策略

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `ocpc-target-package-list-get` | 查询 oCPC 出价策略列表 | READ |
| `ocpc-target-package-list-add` | 新增 oCPC 出价策略 | WRITE |
| `ocpc-target-package-list-update` | 更新 oCPC 出价策略 | WRITE |
| `ocpc-target-package-list-delete` | 删除 oCPC 出价策略 | WRITE |
| `ocpc-project-bid-reference-get` | 查询 oCPC 建议出价 | READ |
| `ocpc-suggest-cpas-get` | 查询 oCPC 建议 CPA | READ |

### 转化追踪

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `fc-transtrace-list-get` | 查询转化追踪列表 | READ |
| `fc-transtrace-list-add` | 新增转化追踪 | WRITE |
| `fc-transtrace-list-update` | 更新转化追踪 | WRITE |
| `fc-transtrace-list-delete` | 删除转化追踪 | WRITE |

### 资产管理 · 图片管理

替代已下线的「创意配图管理」（ImageSegmentService，2023-04-19 下线）。

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `image-upload` | 上传图片（搜索推广与信息流共用） | WRITE |
| `image-get` | 查询图片（按 ID/尺寸/大小/格式/时间筛选） | READ |
| `image-update` | 编辑图片（改名、收藏） | WRITE |
| `image-delete` | 删除图片 | WRITE |

### 创意配图素材（⚠️ 官方已标注下线，实测仍可用）

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `image-segment-get` | 查询图片素材（含审核状态与拒绝理由） | READ |
| `image-segment-add` | 新增图片素材（base64 转链） | WRITE |
| `image-segment-update` | 更新图片素材（主题 desc / 启停 status） | WRITE |
| `image-segment-delete` | 删除图片素材 | WRITE |

> 官方标注 2023-04-19 下线，但实测仍可用（返回真实数据）。新流程优先使用 `image-*`；
> 注意新接口在「审核状态 / 图片主题 / 素材启停」三处不具备等价字段，见下方能力对照。

### 创意组件 Segment

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `segment-get` | 查询创意组件 | READ |
| `segment-add` | 新增创意组件 | WRITE |
| `segment-update` | 更新创意组件 | WRITE |
| `segment-delete` | 删除创意组件 | WRITE |
| `segment-bind-get` | 查询组件绑定（创意组件绑定服务） | READ |
| `segment-bind-add` | 新增组件绑定（绑定组件到单元，含图片类组件） | WRITE |
| `segment-bind-update` | 更新组件绑定状态 | WRITE |
| `segment-bind-delete` | 删除组件绑定 | WRITE |
| `segment-upload-img` | 创意组件图片上传转链 | WRITE |

### 数据报表

| action 值 | 能力 | 类型 |
| --- | --- | --- |
| `report-data-get` | 拉取数据报表 | READ |

示例：

```bash
node scripts/api.ts --payload='{"action":"campaign-get","userName":"子账号用户名","body":{"campaignFields":["campaignId","campaignName"],"campaignIds":[],"adType":0}}'
```

敏感信息通过环境变量或运行时参数注入：

- `BAIDU_APP_ID`：百度商业开发者中心应用 appId。
- `BAIDU_SECRET_KEY`：百度商业开发者中心应用 secretKey。
- `BAIDU_ACCESS_TOKEN`：百度营销 API access token。
- `BAIDU_REFRESH_TOKEN`：百度营销 API refresh token。
- `BAIDU_USER_NAME`：默认推广账号用户名。
- `BAIDU_API_BASE_URL`：可选，默认 `https://api.baidu.com`。
- `BAIDU_TOKEN_STORE`：可选，token store 文件路径，默认 `~/.baidu-analysis/.baidu-auth.env`。
- `BAIDU_HTTP_TIMEOUT_MS`：可选，单次 HTTP 请求超时（毫秒），默认 30000；超时返回 `BAIDU_TIMEOUT_ERR`。
- `BAIDU_OAUTH_ACCESS_TOKEN_URL`：可选，换取授权令牌接口地址，默认 `https://u.baidu.com/oauth/accessToken`。
- `BAIDU_OAUTH_REFRESH_TOKEN_URL`：可选，更新授权令牌接口地址，默认 `https://u.baidu.com/oauth/refreshToken`。
- `BAIDU_OAUTH_USER_INFO_URL`：可选，查询授权用户信息接口地址，默认 `https://u.baidu.com/oauth/getUserInfo`。

推荐保存方式：

- 自建 / 内部 Agent 平台：由平台在启动时把 `BAIDU_TOKEN_STORE`、`BAIDU_APP_ID`、`BAIDU_SECRET_KEY` 注入运行环境。
- Codex：在 `~/.codex/config.toml` 的 `[shell_environment_policy.set]` 中保存 `BAIDU_TOKEN_STORE`，或从 shell 启动文件继承 `BAIDU_APP_ID`、`BAIDU_SECRET_KEY`。
- Token store：在 `BAIDU_TOKEN_STORE` 指向的文件中保存会变化的 `BAIDU_ACCESS_TOKEN`、`BAIDU_REFRESH_TOKEN` 和 token 元数据。脚本以临时文件 + 原子替换写入，权限 `0600`。不要把 token store 放进 skill 目录或代码仓库，不要把 token 明文写进回复、文档或日志。
- 凭据不要走命令行：`--payload` 的内容会出现在进程列表与 shell history；长 payload 或含凭据的 payload 用 `--payload-file=<path>`。

Token 获取和刷新：

```bash
# appId / secretKey 从环境变量读取，不写进命令行
node scripts/api.ts --payload='{"action":"oauth-token-get","authCode":"回调URL里的authCode","userId":123456}'
```

成功后脚本会把 token 写入本地 token store；后续业务接口会自动加载。若接口返回 token 过期或无效，脚本会自动使用 refresh token 刷新并重试一次。

## 输出结构

所有调用统一输出 JSON，`stdout` 为结果、`stderr` 为错误。重点字段：

```json
{
  "success": true,
  "partial": false,
  "action": "campaign-get",
  "version": "0.9.7",
  "request": { "traceId": "ff3d9072-...", "httpStatus": 200, "qps": 100, "timeoutMs": 30000 },
  "warnings": [],
  "data": {}
}
```

- `request.traceId` 取自响应头 `X-B3-Traceid`，是向百度提工单时唯一定位请求的凭据，排障时务必带上。
- `request.qps` 是该接口的官方 QPS 上限（未列出的接口统一为 10）。调用方自行做并发背压，不要等百度返回限流错误。
- `warnings` 包含废弃接口提示、凭据来源提示等。

### 部分失败（重要）

官方返回 `header.status`：`0` 成功、`1` 部分失败、`2` 全部失败、`3` 系统错误。
`status=1` 时脚本**不报错**，而是输出 `partial: true` 以及 `quota`（提交条数）、`oprs`（成功条数）、`failures[]`（含 `position` 指出具体是哪一条失败）。

> 批量接口（关键词、否词、创意等数组入参）出现部分失败时，**禁止整批重试**——已成功的条目会被重复创建。只允许对 `failures[].position` 指向的条目重试。

### 错误结构

失败时 `stderr` 输出结构化信息，便于判断是否可重试：

```json
{
  "success": false,
  "errorCode": "BAIDU_REMOTE_ERR",
  "baiduCode": 901231,
  "baiduClass": "business",
  "retryable": false,
  "ticket": null,
  "suggestion": "..."
}
```

`baiduCode` 为官方错误码；`baiduClass` 取值 `auth` / `permission` / `system` / `business` / `usage` / `unknown`；`status=3` 的系统错误会额外带 `ticket`。

### 常见错误码与处置

官方错误码共 832 条，这里是实际高频的一段（8 开头为系统错误、901 开头为搜索推广业务错误、925 开头为图文广告错误）：

| baiduCode | 含义 | 处置 |
|---|---|---|
| `81020` | 用户名不正确 | 账号选错，常见于误用 MCC 主账号调业务接口 |
| `8101` / `8102` / `8103` | 用户名缺失 / 不合法 | 补 `userName`，或检查 `BAIDU_USER_NAME` |
| `8401` / `8402` / `8403` | token 缺失 / 不合法 / 已删除 | 重新走 OAuth；脚本已按码自动刷新一次 |
| `8408` / `8410` / `8412` | 无权使用该 token | 权限问题，刷新无效，检查应用授权范围 |
| `87091` | URL 无效 | 该服务/方法不存在：核对 `scripts/api.ts` 里该 action 的 `endpoint` 是否拼错；已下线接口见 `docs/deprecated-actions.md` |
| `9012` / `90121`–`90124` | 无权限操作账户/计划/单元/关键词/创意 | 当前账号无该对象权限，换子账号或申请权限 |
| `9011519` | `Request field is invalid`：请求字段不合法 | 字段名拼错或必填缺失，对照 `docs/<action>.md` 的输入字段表 |
| `901897` | `Id is null`：缺少查询 ID | 补 `ids` + `idType`（3 计划 / 5 单元 / 24 物料） |
| `9015` | 请求的对象中包含空元素（官方原文；实测也覆盖"参数为空/产品线参数异常"等） | 按 `docs/<action>.md` 的输入字段表补齐必填项 |
| `90111` / `90112` | 计划 / 单元 ID 不存在 | ID 不在当前账号下，先用查询接口核对 |
| `90180009000` | 组件绑定缺参（官方未给 message） | 补 `ids` + `idType` + `segmentTypes` |
| `90127` 或 `status=1` | 操作部分失败 | 见上节「部分失败」：禁止整批重试 |
| `9013` | 系统错误 | ⚠️ **实测中常见于"缺参数"被服务端当系统错误抛出**（如 `ocpc-target-package-list-get` 空 body）——先查参数，再考虑重试 |
| `8001` / `9013004` | 系统错误，建议重试 | 可重试；写操作重试前先确认上次是否已生效 |
| `99912` | Json message 不合法 | 字段名或形态错误（如 `getWord` 需 `wordFields` + `ids` + `idType`） |
| `901177` | `Type 输入值不合法`（官方原文）；实测于 `idType` 与实际层级不匹配 | `idType` 传 3 计划 / 5 单元 / 24 物料 |

> 标注「实测」的条目来自 2026-09-18 对该账号的受控故障注入；其余来自百度官方错误码表（节点 166）。

### 参数校验宽松的接口（静默失败风险）

实测发现部分接口**不会拒绝未知字段**，而是静默返回 `status=0`：

| 接口 | 行为 |
|---|---|
| `segment-get` | 空 body 与拼错字段名都返回 `status=0`，筛选条件可能被静默忽略 |
| `fc-transtrace-list-get` | 同上，参数校验宽松 |
| `negative-keyword-get` | 空 body 返回**全量 5000 行**；拼错字段名则静默返回 **0 行**（容易被误读为"没有否词"） |
| `ocpc-target-package-list-get` | 缺参数时返回 `9013 system error.`，而非参数错误提示 |

**处理原则**：这类接口调用后必须检查返回条数是否符合预期；不要因为 `status=0` 就认为筛选生效了。

## 已下线但仍可用的接口

`image-segment-*` 与 `adgroup-image-segment-bind-*` 共 7 个 action 被官方标注 2023-04-19 下线，但实测仍可正常返回数据，因此保留可用（每次调用输出 `deprecated: true` 与迁移提示）。

只在需要处理这 7 个 action 时读取 [已下线接口说明](./docs/deprecated-actions.md)（含迁移对照与新旧能力差异）。

## 写操作审批

写操作**必须显式传 `confirmWrite`**，且只接受布尔值（缺失、字符串 `"true"`、数字 `1` 都会报错）：

```
第一步  预演：confirmWrite:false   （等价写法 dryRun:true）
        → 完成全部校验与信封构造，返回将发送的请求体，不发送任何请求

第二步  执行：confirmWrite:true
        → 仅在用户明确确认后使用
```

**预演不需要凭据**，可以在没有 token 的情况下先看要发什么。返回的 `preview.changedFields` 列出将变更的字段，`preview.endpoint` 是目标接口，`accessToken` 一律脱敏。

> **边界说明**：`confirmWrite` 由调用方填写，**不构成"用户已同意"的证明**，本 skill 也不提供任何外部审批闸门。真实的人工审批必须由调用方（Agent 平台）实现；本 skill 保证的是"预演输出的内容就是实际要发送的内容"。

## 文档检索顺序

1. 先读取本文件，确定用户意图对应的 `action`。
2. 读取对应 `docs/*.md`，确认 DTO 结构、必填字段、字段限制和示例。
3. 如果缺少 token、token 过期或用户要求授权，读取 [oauth-token-flow.md](./docs/oauth-token-flow.md)。
4. 写接口还必须读取 [execution-standard.md](./docs/execution-standard.md) 中的写操作确认规则。
5. 如果官方文档、实测结果和用户资料不一致，以当前官方页面或用户提供的最新材料为准，并记录待确认项。

## 对话式操作规则

当用户提出"查账户""查计划""新增计划""删除计划""暂停计划""修改预算"等需求时：

- 先识别操作类型：查询类、创建类、更新类、删除类或诊断类。
- 查询类操作需要确认账号范围、对象类型、字段、分页和时间范围。
- 写入类操作需要确认推广账号、对象 ID 或对象名称、计划类型、预算、地域、投放时段、出价、转化目标、是否暂停和回滚方案。
- 删除、启用、预算调整、出价调整等高影响操作必须先展示将调用的 action、关键参数、预期影响和风险，再等待用户明确授权。
- 用户只给业务参数时，实际请求体仍需补齐百度 API 标准结构：`{"header":{"userName":"...","accessToken":"..."},"body":{...}}`。
- 接口执行后输出调用结果、关键返回字段、失败原因、下一步排查建议和必要审计记录。

### 写操作变更确认单（固定格式）

写操作执行前**必须**按此格式展示并等待用户明确确认，不要用自由文本代替，否则每次输出结构不一致、无法逐条比对：

```text
【变更确认单】
操作：        <一句话说明这次要做什么>
action：      <action 名>
推广账号：    <子账号 username>
对象：        <对象类型 + ID + 名称>
字段变更：    <字段>：<旧值> → <新值>（逐项列出）
影响范围：    是否影响线上投放 / 预算消耗 / 已有数据
回滚方式：    <具体动作，或"不可回滚">
```

执行后按固定顺序回报：结果（成功 / 部分失败及条数）→ 关键返回字段 → 失败原因（附 `baiduCode` 与处置建议）→ 审计信息（`traceId`、账号、对象）。

## 官方资料

需要核验百度营销 API、商业开发者中心、oCPC 或报表口径时，读取 [official-sources.md](./docs/official-sources.md)。
