# 查询否定关键词包

## Trigger

用户要求查询否词包、否定关键词包、否词包列表、否词包绑定的计划、否词包内的否词信息时使用。

## Action

`negative-keyword-packet-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/NegativeKeywordPacketService/getNegativeKeywordPacket`
- 方法说明：查询否词包。

## Payload 

```json
{
  "action": "negative-keyword-packet-get",
  "userName": "子账号用户名",
  "body": {
    "negativeKeywordPacketTypeFields": [
      "negativeKeywordPacketId",
      "negativeKeywordPacketName",
      "totalNegativeKeywordCount",
      "bindCampaignNames",
      "bindCampaignIds",
      "bindCampaignCount"
    ],
    "orderBy": "bindCampaignCount",
    "desc": true,
    "limit": [0, 10]
  }
}
```

## 展开否词包内的否词明细

`negative-keyword-get` 只返回 `level=33` 的「计划-否词包绑定」行（`negativeKeyword` 是包名），**不展开包里的词**。
要看包里具体有哪些否词，用本接口在 `negativeKeywordPacketTypeFields` 里加上 **`negativeKeywords`**，按包 ID 查：

```json
{
  "action": "negative-keyword-packet-get",
  "userName": "子账号用户名",
  "body": {
    "negativeKeywordPacketIds": [123456],
    "negativeKeywordPacketTypeFields": [
      "negativeKeywordPacketId",
      "negativeKeywordPacketName",
      "totalNegativeKeywordCount",
      "negativeKeywords"
    ]
  }
}
```

- 包 ID 来自 `negative-keyword-get` 返回的 `level=33` 行里的 `negativeKeywordPacketId`。
- 每个包的 `negativeKeywords[]` 最多返回 5000 个词，每项含 `negativeKeyword`（字面）和 `negativeMatchType`（0 短语 / 63 精确）。
- 包多、词多时先不带 `negativeKeywords` 拉一次列表看 `totalNegativeKeywordCount`，再按 ID 分批展开，避免一次返回过大。

## 行为说明

- 不传 `negativeKeywordPacketIds` 时，可通过 `fieldFilters`、`orderBy`、`limit`、`desc` 进行筛选、排序和分页查询。
- 传入 `negativeKeywordPacketIds` 时，直接按 ID 查询指定否词包，最多 100 个。
- `limit` 支持两种形式：`[k]` 取前 k 条；`[m, n]` 从第 m+1 条开始取 n 条。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `negativeKeywordPacketIds` | Long[] | - | 否词包ID | 集合长度限制：[0, 100] |
| `negativeKeywordPacketTypeFields` | String[] | 是 | 请求字段 | 取值范围见下方枚举 |
| `orderBy` | String | - | 排序条件 | negativeKeywordPacketId / totalNegativeKeywordCount / bindCampaignCount |
| `desc` | Boolean | - | 正序/倒序 | 默认 true；true-倒序 / false-正序 |
| `limit` | Integer[] | - | 分页 | 默认 [100]；[k] 取前 k 条；[m, n] 从第 m+1 条取 n 条 |
| `fieldFilters` | RowFilter[] | - | 过滤条件 | 支持对 negativeKeywordPacketName 进行 in/like/nlike 操作 |

### fieldFilters（RowFilter）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `field` | String | 筛选字段 | `negativeKeywordPacketName` |
| `op` | String | 比较符号 | `in`-完全匹配 / `like`-模糊匹配 / `nlike`-模糊排除 |
| `values` | String[] | 筛选数据 | - |

### negativeKeywordPacketTypeFields 可选枚举

| 字段 | 说明 |
|------|------|
| `negativeKeywordPacketId` | 否词包ID |
| `negativeKeywordPacketName` | 否词包名称 |
| `totalNegativeKeywordCount` | 否词包内否词总数 |
| `normalNegativeKeywordCount` | 否词包内短语匹配否词总数 |
| `exactNegativeKeywordCount` | 否词包内精确匹配否词总数 |
| `negativeKeywords` | 否词包内的否词信息 |
| `bindCampaignIds` | 否词包绑定的计划信息 |
| `bindCampaignCount` | 否词包绑定的计划数 |
| `bindCampaignNames` | 否词包绑定的计划名称 |

## 返回字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `negativeKeywordPacketId` | Long | 否词包ID | - |
| `negativeKeywordPacketName` | String | 否词包名称 | 最大 30 字节（中文 2 字节，英文/数字 1 字节） |
| `totalNegativeKeywordCount` | Long | 否词包内否词总数 | - |
| `normalNegativeKeywordCount` | Long | 否词包内短语匹配否词总数 | - |
| `exactNegativeKeywordCount` | Long | 否词包内精确匹配否词总数 | - |
| `negativeKeywords` | NegativeKeywordType[] | 否词包内的否词信息 | 集合长度限制：[1, 5000] |
| `bindCampaignIds` | Long[] | 否词包绑定的计划ID | - |
| `bindCampaignCount` | Integer | 否词包绑定的计划数量 | - |
| `bindCampaignNames` | String[] | 否词包绑定的计划名称 | - |

### NegativeKeywordType（否词信息）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `negativeKeywordId` | Long | 否定关键词ID | level=3 时为计划独立否词ID；level=5 时为单元独立否词ID；level=33 时为计划-否词包绑定ID |
| `negativeKeyword` | String | 否定关键词 | 最大 40 字节；level=3 时为计划独立否词字面；level=5 时为单元独立否词字面；level=33 时为否词包名称 |
| `level` | Integer | 所属层级 | 3-计划层级 / 5-单元层级 / 33-否词包层级 |
| `campaignId` | Long | 计划ID | - |
| `campaignName` | String | 计划名称 | - |
| `adgroupId` | Long | 单元ID | - |
| `adgroupName` | String | 单元名称 | - |
| `negativeMatchType` | Integer | 匹配模式 | 0-短语匹配 / 63-精确匹配；仅 level=3 和 5 时有意义，level=33 时固定返回 0 |
| `negativeKeywordPacketId` | Long | 否词包ID | 仅 level=33 时有意义，level=3 和 5 时固定返回 0 |

### level 枚举值

| 值 | 说明 |
|---|---|
| 3 | 计划层级 |
| 5 | 单元层级 |
| 33 | 否词包层级 |

### negativeMatchType 枚举值

| 值 | 说明 |
|---|---|
| 0 | 短语匹配 |
| 63 | 精确匹配 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=0` 但 `rows=0` | 过滤条件在当前账号下确实没有数据 | 先用空条件或不带过滤拉一次，确认账号下有无物料 |
| `status=2 code=99912` | 查询形态用错：字段名或参数组合不符合接口要求（实测于 getWord / getCreative） | 对照本文 Payload 的字段名与 `ids` + `idType` 组合 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：错误码来自脚本校验器与百度官方错误码表（节点 166），**未经逐条实测**。
> 本接口的实测观测见对应条目；如需复现可用受控故障注入（空 body / 错字段名）。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"negative-keyword-packet-get","userName":"子账号用户名","body":{"negativeKeywordPacketTypeFields":["negativeKeywordPacketId","negativeKeywordPacketName","totalNegativeKeywordCount","bindCampaignNames","bindCampaignIds","bindCampaignCount"],"orderBy":"bindCampaignCount","desc":true,"limit":[0,10]}}'
```
