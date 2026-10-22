# 百度推广助手 (baidu-analysis)

在对话中查询和操作百度推广账户：消耗、余额、计划、单元、创意、关键词、否词、oCPC 出价策略、创意组件与图片素材、数据报表、转化追踪。

**面向**：投放运营 / 市场部（直接在 Agent 对话里操作投放），以及需要把百度投放能力接进 Agent 平台的开发者。

**仓库**：<https://github.com/huang-shen-hao/baidu-analysis-skill>

> 个人项目，**与百度无隶属、合作或背书关系**；接口能力来自百度公开文档与实测，百度可能随时调整或下线接口。详见 [NOTICE](./NOTICE)。

## 安装

```bash
skillhub install baidu-analysis
```

手动安装：把本目录放到 Agent 的 skill 路径下，例如

```bash
cp -R baidu-analysis ~/.codex/skills/
```

安装后 Agent 会按 `description` 自动识别"百度投放相关需求"并加载本 skill。

## 依赖环境

- **Node.js** >= 18（脚本直接通过 `node` 运行，无需编译）
- 百度商业开发者中心应用（需具备 `appId` 和 `secretKey`）
- 百度推广账号授权

## 快速开始

**装好 skill、配好环境变量后，所有操作都在对话里完成，不需要手敲命令。**

### 第一步：配置环境变量（一次性）

推荐全部通过环境变量提供，token store 只保存会变化的登录态：

```bash
BAIDU_APP_ID=你的应用ID
BAIDU_SECRET_KEY=你的应用密钥
BAIDU_PLATFORM_ID=你的平台ID                 # 生成授权链接必需
BAIDU_USER_NAME=子账号用户名
BAIDU_TOKEN_STORE=/绝对路径/.baidu-auth.env   # 可选；未设置时默认 ~/.baidu-analysis/.baidu-auth.env
```

写入位置任选其一（Agent 启动时会继承到进程环境）：

| 运行环境 | 写入位置 |
|---|---|
| Codex | `~/.codex/config.toml` 的 `[shell_environment_policy.set]` |
| 其他 Agent / 终端 | `~/.zshrc`、`~/.bashrc` 等启动文件 |
| 自建 / 内部 Agent 平台 | 由平台启动时注入环境变量 |

> **不要**把 `accessToken` / `secretKey` 写进 `--payload`：命令行参数会出现在进程列表与 shell history 中。
> 需要传长参数或多个凭据时，用 `--payload-file=<path>` 从文件读取。
>
> token store 默认落在 `~/.baidu-analysis/.baidu-auth.env`（不再跟随当前工作目录），仓库内也已提供 `.gitignore`。
> 脚本写入时使用临时文件 + 原子替换，并以 `0600` 权限保存。

### 第二步：在对话里触发登录

**不需要执行任何命令**——直接在对话里说一句，例如：

> 登录百度推广 / 授权百度账号

随后是这样一个来回：

1. Agent 调用 `oauth-auth-url`，把**授权链接**发给你；
2. 你打开链接，用百度账号完成授权；
3. 浏览器会跳到 callback URL（默认 `https://www.baidu.com`）——**把那个完整 URL 原样贴回对话**（里面带 `authCode` 和 `userId`）；
4. Agent 调用 `oauth-token-get`，用回调里的 `authCode` / `userId` 换取 token；
5. 登录完成，token 写入 `~/.baidu-analysis/.baidu-auth.env`（权限 `0600`，不会明文出现在对话里）。

如果授权的是 MCC / 账户管家账号，Agent 会列出下辖子账号让你指定一个，之后的业务查询都用那个子账号。

登录一次即可：token 过期脚本会自动刷新，只有 refresh token 也失效时才需要重新走一遍上面的流程。

---

## 命令行用法（不使用 Agent 时）

以下命令用于自动化脚本、CI 或手工排障。**在 Agent 里这些都会由对话自动完成，不需要手动执行。**

### OAuth 授权

```bash
# 1) 生成授权链接，打开并完成授权
node scripts/api.ts --payload='{"action":"oauth-auth-url"}'

# 2) 用回调 URL 里的 authCode、userId 换取 token
node scripts/api.ts --payload='{"action":"oauth-token-get","authCode":"回调码","userId":123456}'
```

成功后 token 自动写入 `BAIDU_TOKEN_STORE`（默认 `~/.baidu-analysis/.baidu-auth.env`），后续调用无需重复授权。token 过期时脚本会自动刷新。

> 参数较长（如大段 base64、完整回调 URL）时用 `--payload-file=<path>` 传入，避免 shell 转义与命令长度限制。

### 验证授权

```bash
node scripts/api.ts --payload='{"action":"oauth-user-info-get"}'
```

### 调用业务接口

所有接口统一通过 `scripts/api.ts` 执行，`action` 字段必填：

```bash
# 查询推广计划
node scripts/api.ts --payload='{"action":"campaign-get","userName":"子账号用户名","body":{"campaignFields":["campaignId","campaignName"],"campaignIds":[],"adType":0}}'

# 拉取数据报表（timeUnit 与 columns 为必填）
node scripts/api.ts --payload='{"action":"report-data-get","userName":"子账号用户名","body":{"reportType":170026,"startDate":"2025-01-01","endDate":"2025-01-07","timeUnit":"DAY","columns":["date","cost","impression","click"],"startRow":0,"rowCount":200}}'
```

## 覆盖的接口功能

共覆盖 **17 个业务模块、60+ 个 API 接口**。

### 账户管理

| action | 能力 | 类型 |
| --- | --- | --- |
| `oauth-auth-url` | 生成 OAuth2.0 授权链接 | READ |
| `oauth-token-get` | 使用授权码获取 token | READ |
| `oauth-token-refresh` | 刷新 access token | READ |
| `oauth-user-info-get` | 查询授权用户信息和子账号 | READ |
| `mcc-account-get` | 查询账户管家下辖子账号 | READ |
| `account-get` | 查询推广账户信息 | READ |
| `account-update` | 更新推广账户信息 | WRITE |

### 推广计划 CRUD

| action | 能力 | 类型 |
| --- | --- | --- |
| `campaign-get` | 查询推广计划 | READ |
| `campaign-add` | 新增推广计划 | WRITE |
| `campaign-update` | 更新推广计划 | WRITE |
| `campaign-delete` | 删除推广计划 | WRITE |

### 推广单元 CRUD

| action | 能力 | 类型 |
| --- | --- | --- |
| `adgroup-get` | 查询推广单元 | READ |
| `adgroup-add` | 新增推广单元 | WRITE |
| `adgroup-update` | 更新推广单元 | WRITE |
| `adgroup-delete` | 删除推广单元 | WRITE |

### 单元图片素材绑定（⚠️ 官方已标注下线，实测仍可用）

| action | 能力 | 类型 |
| --- | --- | --- |
| `adgroup-image-segment-bind-get` | 查询绑定关系 | READ |
| `adgroup-image-segment-bind-add` | 新增绑定 | WRITE |
| `adgroup-image-segment-bind-delete` | 删除绑定 | WRITE |

### 创意 CRUD

| action | 能力 | 类型 |
| --- | --- | --- |
| `creative-get` | 查询创意 | READ |
| `creative-add` | 新增创意 | WRITE |
| `creative-update` | 更新创意 | WRITE |
| `creative-delete` | 删除创意 | WRITE |

### 业务类目

| action | 能力 | 类型 |
| --- | --- | --- |
| `all-business-point-get` | 获取全量推广业务类目 | READ |
| `bind-business-point-list-get` | 查询计划已使用的推广业务 | READ |

### 互动创意 (Danube)

| action | 能力 | 类型 |
| --- | --- | --- |
| `danube-constants-get` | 获取常量 (行业/分类/标签) | READ |
| `danube-creative-group-get` | 查询互动创意组 | READ |
| `danube-creative-group-add` | 新增互动创意组 | WRITE |
| `danube-creative-group-copy` | 复制互动创意组 | WRITE |
| `danube-creative-group-update` | 更新互动创意组 | WRITE |
| `danube-creative-group-delete` | 删除互动创意组 | WRITE |

### 关键词 CRUD

| action | 能力 | 类型 |
| --- | --- | --- |
| `keyword-get` | 查询关键词 | READ |
| `keyword-add` | 新增关键词 | WRITE |
| `keyword-update` | 更新关键词 | WRITE |
| `keyword-delete` | 删除关键词 | WRITE |

### 关键词规划师

| action | 能力 | 类型 |
| --- | --- | --- |
| `keyword-planner-recommend-get` | 种子词拓词（返回推荐词 + 月均搜索量 + 指导价） | READ |
| `keyword-planner-custom-get` | 账户主动推荐词（按计划/单元 id） | READ |
| `keyword-planner-pv-get` | 关键词流量预估（批量 1–1000 词） | READ |

### 否定关键词 CRUD

| action | 能力 | 类型 |
| --- | --- | --- |
| `negative-keyword-get` | 查询否定关键词 | READ |
| `negative-keyword-add` | 添加否定关键词 | WRITE |
| `negative-keyword-update` | 修改否定关键词 | WRITE |
| `negative-keyword-delete` | 删除否定关键词 | WRITE |

### 否词包 CRUD

| action | 能力 | 类型 |
| --- | --- | --- |
| `negative-keyword-packet-get` | 查询否词包 | READ |
| `negative-keyword-packet-add` | 新增否词包 | WRITE |
| `negative-keyword-packet-update` | 更新否词包 | WRITE |
| `negative-keyword-packet-delete` | 删除否词包 | WRITE |

### oCPC 出价策略

| action | 能力 | 类型 |
| --- | --- | --- |
| `ocpc-target-package-list-get` | 查询出价策略列表 | READ |
| `ocpc-target-package-list-add` | 新增出价策略 | WRITE |
| `ocpc-target-package-list-update` | 更新出价策略 | WRITE |
| `ocpc-target-package-list-delete` | 删除出价策略 | WRITE |
| `ocpc-project-bid-reference-get` | 查询建议出价 | READ |
| `ocpc-suggest-cpas-get` | 查询建议 CPA | READ |

### 转化追踪 CRUD

| action | 能力 | 类型 |
| --- | --- | --- |
| `fc-transtrace-list-get` | 查询转化追踪 | READ |
| `fc-transtrace-list-add` | 新增转化追踪 | WRITE |
| `fc-transtrace-list-update` | 更新转化追踪 | WRITE |
| `fc-transtrace-list-delete` | 删除转化追踪 | WRITE |

### 资产管理 · 图片管理

替代已下线的「创意配图管理」（ImageSegmentService，2023-04-19 下线）。

| action | 能力 | 类型 |
| --- | --- | --- |
| `image-upload` | 上传图片（搜索推广与信息流共用） | WRITE |
| `image-get` | 查询图片 | READ |
| `image-update` | 编辑图片（改名、收藏） | WRITE |
| `image-delete` | 删除图片 | WRITE |

### 创意配图素材（⚠️ 官方已标注下线，实测仍可用）

| action | 能力 | 类型 |
| --- | --- | --- |
| `image-segment-get` | 查询图片素材（含审核状态） | READ |
| `image-segment-add` | 新增图片素材 | WRITE |
| `image-segment-update` | 更新图片素材（主题/启停） | WRITE |
| `image-segment-delete` | 删除图片素材 | WRITE |

### 创意组件 Segment

| action | 能力 | 类型 |
| --- | --- | --- |
| `segment-get` | 查询创意组件 | READ |
| `segment-add` | 新增创意组件 | WRITE |
| `segment-update` | 更新创意组件 | WRITE |
| `segment-delete` | 删除创意组件 | WRITE |
| `segment-bind-get` | 查询组件绑定 | READ |
| `segment-bind-add` | 新增组件绑定（含图片类组件绑定到单元） | WRITE |
| `segment-bind-update` | 更新人群 Segment 绑定 | WRITE |
| `segment-bind-delete` | 删除人群 Segment 绑定 | WRITE |
| `segment-upload-img` | 上传图片素材 | WRITE |

### 数据报表

| action | 能力 | 类型 |
| --- | --- | --- |
| `report-data-get` | 拉取数据报表 | READ |

## 环境变量一览

| 变量名 | 说明 | 是否必填 |
| --- | --- | --- |
| `BAIDU_APP_ID` | 百度商业开发者中心应用 appId | 首次授权必填 |
| `BAIDU_SECRET_KEY` | 百度商业开发者中心应用 secretKey | 首次授权必填 |
| `BAIDU_ACCESS_TOKEN` | 百度营销 API access token | 自动管理 |
| `BAIDU_REFRESH_TOKEN` | 百度营销 API refresh token | 自动管理 |
| `BAIDU_USER_NAME` | 默认推广账号用户名 | 可选 |
| `BAIDU_API_BASE_URL` | API 基地址 | 可选，默认 `https://api.baidu.com` |
| `BAIDU_TOKEN_STORE` | token 存储文件路径 | 可选，默认 `.baidu-auth.env` |

## 项目结构

```
baidu-analysis/
├── .baidu-auth.env          # Token 存储（已 gitignore）
├── .gitignore
├── LICENSE                  # Apache License 2.0
├── NOTICE                   # 第三方内容与商标声明（Apache-2.0 §4(b) 要求保留）
├── SKILL.md                 # Skill 定义与 action 索引
├── scripts/
│   └── api.ts               # 统一 API 入口（唯一发布的脚本）
└── docs/                    # 各接口参数文档（72 个文件）
    ├── _TEMPLATE.md              # action 文档模板（含必填章节清单）
    ├── oauth-token-flow.md       # OAuth 授权与 Token 管理
    ├── execution-standard.md     # 执行标准
    ├── troubleshooting-guide.md  # 故障排查手册
    ├── deprecated-actions.md     # 已下线但仍可用的接口与迁移对照
    ├── verification-log.md       # 平台比对与实测记录（哪些验过、哪些没验）
    ├── official-sources.md       # 官方资料索引
    ├── <action 名>.md            # 每个 action 一份，命名与 action 一一对应
    └── ...
```

> 文档命名约定：`docs/<action 名>.md`。因此 SKILL.md 的 action 索引不再重复列出链接；OAuth 系列统一指向 `oauth-token-flow.md`。

## 内容约定

仓库只包含运行时脚本 `scripts/api.ts`；回归测试与文档校验脚本不随仓库发布（`.gitignore` 按 `*-test.cjs` / `check-*.cjs` / `probe-*.cjs` 命名约定排除）。

发布内容遵循以下约定：

- 每个 action 都有 `docs/<action>.md`，且命名与 action 名一致（OAuth 系列统一指向 `oauth-token-flow.md`）
- 所有写操作都有校验器与 `## 安全要求` 章节
- 文档内 JSON 代码块均可解析
- 接口地址与官方文档一致，比对记录见 [docs/verification-log.md](./docs/verification-log.md)

## 在对话里怎么用

本目录是一个标准 Agent Skill（`SKILL.md` + frontmatter），可在支持该格式的 Agent 中使用（已在 Codex 验证，Claude Code 同构）。安装后直接描述需求即可：

```
看下昨天百度投放的消耗
帮我查一下 xxx 账户的计划
把那个日预算 100 的计划暂停
新增一个搜索推广计划，日预算 100 元
拉取上个月的消费报表
```

Agent 侧的加载顺序为：`description`（选型）→ `SKILL.md`（路由与规则）→ `docs/<action>.md`（参数细节），符合渐进式披露约定。

### 写操作是两段式

查询类接口直接执行；**写操作（新增/更新/删除/暂停）必须显式声明 `confirmWrite`**：

```
第一步  预演  confirmWrite:false   → 只做校验、返回将要发送的请求体，不发送请求（不需要凭据）
第二步  执行  confirmWrite:true    → 用户确认后再执行
```

在对话里表现为：Agent 先把预演结果（目标接口、将变更的字段、账号）呈现给你，你确认后才真正下发。预演输出的字段由脚本生成，不是模型复述。

> 边界说明：`confirmWrite` 由调用方填写，**不构成"用户已同意"的证明**。执行前的真实人工审批由 Agent 平台负责；本 skill 保证的是"预演输出的内容 == 实际发送的内容"。

## License

本项目以 **Apache License 2.0** 发布，许可全文见 [LICENSE](./LICENSE)。

```
Copyright 2026 huang-shen-hao

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

### 第三方内容与商标声明

完整声明见 [NOTICE](./NOTICE)，要点：

- `docs/` 下的**接口字段说明、必填约束与请求/返回示例摘录自百度官方文档**（`dev2.baidu.com` 商业开发者中心），版权归百度所有，仅作使用参考，**不在本项目 Apache-2.0 许可范围内**。
- 本项目为个人项目，**与百度无隶属、合作或背书关系**；「百度」「百度推广」等为百度公司商标，本项目仅作描述性使用。
- 接口地址、错误码与行为记录均标注了来源与验证状态（见 [docs/verification-log.md](./docs/verification-log.md)）；百度可能随时调整接口，本项目不承诺长期可用。
- 使用本 skill 调用百度营销 API，需自行遵守百度的开发者协议与平台规则。
