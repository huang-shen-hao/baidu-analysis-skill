# 新建转化追踪

## Trigger

用户要求新建转化追踪、添加转化追踪时使用。

## Action

`fc-transtrace-list-add`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/FcTransTraceApiService/addFcTransTrace`
- 方法说明：新增转化追踪。

## Payload

```json
{
  "action": "fc-transtrace-list-add",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "transMode": 8,
    "transName": "转化追踪名称",
    "transType": [4, 25, 26],
    "appType": 0,
    "monitorUrl": "https://example.com/callback?akey={{CALLBACK_URL}}",
    "appAction": 1,
    "campaignIds": [1]
  }
}
```

## 安全要求

- 该接口会创建真实转化追踪配置，直接影响投放数据采集。
- 执行前必须确认账号、追踪名称、接入方式和绑定计划。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 行为说明

- 本接口**仅支持** `transMode=8`（应用API）和 `transMode=11`（应用SDK）的接入方式。
- `transMode=8` 时，`transType` 仅可取值为 4、25、26、27、28、52。
- `transMode=11` 时，`transType` 仅可取值为 4、25、26、28。
- 每个计划对每种接入类型只能绑定一个转化追踪。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `transMode` | Integer | 是 | 接入方式 | 见下方枚举 |
| `transName` | String | 是 | 转化名称 | 长度 [1, 50]，不可重复 |
| `transType` | Integer[] | 是 | 转化类型 | 见下方枚举，受 transMode 限制 |
| `appType` | Integer | transMode=8 时必填 | 应用类型 | 0-iOS和Android / 1-仅iOS / 2-仅Android |
| `monitorUrl` | String | transMode=8 时必填 | 监测地址 | 见下方要求 |
| `downloadUrl` | String | 条件必填 | 下载地址 | transMode=8 且 appAction=2 时与 channelId 二选一，优先取 downloadUrl |
| `channelId` | Long | 条件必填 | 下载渠道ID | transMode=8 且 appAction=2 时与 downloadUrl 二选一 |
| `campaignIds` | Long[] | transMode=8/11 时必填 | 绑定的计划ID | 每个计划每种接入类型只能绑定一个转化追踪 |
| `sdkId` | Long | transMode=11 时必填 | 应用SDK ID | - |
| `appAction` | Integer | transMode=8/11 时必填 | 应用调起类型 | 1-应用调起 / 2-应用下载 |

### transMode（接入方式）枚举值

| 值 | 说明 |
|---|---|
| 4 | 线索API |
| 6 | 咨询工具授权 |
| 7 | 网站JS布码 |
| 8 | 应用API |
| 9 | 电话数据授权 |
| 10 | 百度智能小程序SDK |
| 11 | 应用SDK |
| 23 | 百度统计网站导入 |
| 24 | 百度统计小程序导入 |

### monitorUrl 要求

1. 以 `http` 或 `https` 开头
2. 通配符中的字符必须大写
3. 不可包含空格、`akey` 参数
4. 必须包含 `{{CALLBACK_URL}}` 参数，IMEI 请使用 `{{IMEI_MD5}}`，建议增加 OAID 通配符 `{{OAID}}`

### transType（转化类型）枚举值

| 值 | 说明 |
|---|---|
| 1 | 咨询按钮点击 |
| 2 | 电话按钮点击 |
| 3 | 表单提交成功 |
| 4 | APP激活 |
| 5 | 表单按钮点击 |
| 6 | 下载（预约）按钮点击 |
| 7 | 购买按钮点击 |
| 8 | 短信咨询按钮点击 |
| 9 | 电商订单 |
| 10 | 购买成功 |
| 12 | 预约按钮点击 |
| 13 | 表单有效请求 |
| 14 | 订单提交成功 |
| 15 | 加入购物车按钮点击 |
| 16 | 表单调起按钮点击 |
| 17 | 三句话咨询 |
| 18 | 留线索 |
| 19 | 一句话咨询 |
| 20 | 深度页面访问 |
| 25 | APP注册 |
| 26 | APP付费 |
| 27 | 客户自定义 |
| 28 | 次日留存 |
| 30 | 电话拨通 |
| 31 | 地图按钮点击 |
| 32 | QQ咨询按钮点击 |
| 33 | 抽奖按钮点击 |
| 34 | 投票按钮点击 |
| 35 | 微信复制按钮点击 |
| 36 | 评价按钮点击 |
| 40 | 关注按钮点击 |
| 41 | 申请小额贷款 |
| 42 | 小额贷款授信 |
| 43 | 小程序线索 |
| 46 | 加入购物车 |
| 49 | 注册激活后登录 |
| 50 | 预约 |
| 51 | 有意向客户 |
| 52 | 深度使用 |
| 57 | 调起点击 |
| 61 | 二次跳转 |
| 67 | 微信调起按钮点击 |
| 68 | 粉丝关注成功 |
| 71 | 应用调起 |
| 72 | 聊到相关业务 |
| 79 | 微信加粉成功 |
| 89 | 放款 |
| 99 | 其他 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| - | Long | 返回新增的转化追踪ID |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `fc-transtrace-list-add requires body.transTraceList` | 漏传必填字段 transTraceList | 按本文「输入字段」补齐 body.transTraceList |
| `fc-transtrace-list-add: transMode must be 8 (app API) or 11 (app SDK)` | 枚举取值非法 | 只接受文档列出的枚举值 |
| `fc-transtrace-list-add: transName is required and max 50 chars` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{\"action\":\"fc-transtrace-list-add\",\"confirmWrite\":true,\"userName\":\"子账号用户名\",\"body\":{\"transMode\":8,\"transName\":\"转化追踪名称\",\"transType\":[4,25,26],\"appType\":0,\"monitorUrl\":\"https://example.com/callback?akey={{CALLBACK_URL}}\",\"appAction\":1,\"campaignIds\":[1]}}'
```
