# 查询否定关键词

## Trigger

用户要求查询否定关键词、否词列表、计划否词、单元否词、否词包绑定时使用。

## Action

`negative-keyword-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/NegativeKeywordService/getNegativeKeyword`
- 方法说明：查询否定关键词，支持按照账户、计划、单元、否定关键词层级查询。

## Payload

```json
{
  "action": "negative-keyword-get",
  "userName": "子账号用户名",
  "body": {
    "negativeKeywordTypeFields": [
      "negativeKeyword",
      "negativeKeywordId",
      "campaignId",
      "adgroupId",
      "campaignName",
      "adgroupName",
      "negativeMatchType",
      "negativeKeywordPacketId",
      "level",
      "addTime",
      "modTime"
    ],
    "orderBy": "negativeKeyword",
    "fieldFilters": [
      {
        "field": "campaignId",
        "op": "in",
        "values": [291681626]
      }
    ],
    "limit": [0, 1000],
    "desc": true
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `negativeKeywordTypeFields` | String[] | 是 | 请求字段 | 取值范围见下方枚举 |
| `orderBy` | String | - | 排序字段 | `negativeKeyword` / `negativeKeywordId` / `negativeMatchType` / `level` |
| `fieldFilters` | RowFilter[] | - | 过滤条件 | - |
| `limit` | Integer[] | - | 分页 | 默认 `[5000]`；`[k]` 取前 k 条；`[m, n]` 从 m+1 条取 n 条 |
| `desc` | Boolean | - | 正序/倒序 | 默认 true；true-倒序 / false-正序 |

### negativeKeywordTypeFields 可选枚举

| 字段 | 说明 |
|------|------|
| `negativeKeyword` | 否定关键词 |
| `negativeKeywordId` | 否定关键词ID |
| `campaignId` | 计划ID |
| `adgroupId` | 单元ID |
| `campaignName` | 计划名称 |
| `adgroupName` | 单元名称 |
| `negativeMatchType` | 匹配模式 |
| `negativeKeywordPacketId` | 否词包ID |
| `level` | 所属层级 |
| `addTime` | 添加时间 |
| `modTime` | 修改时间 |

### RowFilter 字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `field` | String | 筛选字段 | `negativeKeyword` / `campaignId` / `adgroupId` / `negativeKeywordPacketId` / `level` / `negativeMatchType` |
| `op` | String | 比较符号 | `in`-完全匹配 |
| `values` | String[] | 筛选数据 | - |

## 返回字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `negativeKeywordId` | Long | 否定关键词ID | level=3 时为计划独立否词ID；level=5 时为单元独立否词ID；level=33 时为计划与否词包绑定ID |
| `negativeKeyword` | String | 否定关键词 | 最大 40 字节（中文 2 字节，英文/数字 1 字节）；level=3 时为计划否词字面；level=5 时为单元否词字面；level=33 时为否词包名称 |
| `level` | Integer | 所属层级 | 3-计划层级否词 / 5-单元层级否词 / 33-否词包与计划绑定关系 |
| `campaignId` | Long | 计划ID | 添加计划否词、计划-否词包绑定时必填 |
| `campaignName` | String | 计划名称 | - |
| `adgroupId` | Long | 单元ID | 添加单元否词时必填；单元不支持绑定否词包 |
| `adgroupName` | String | 单元名称 | - |
| `negativeMatchType` | Integer | 匹配模式 | 0-短语匹配 / 63-精确匹配；level=33 时固定返回 0 |
| `negativeKeywordPacketId` | Long | 否词包ID | 添加计划-否词包绑定时必填；level=3/5 时固定返回 0 |

### level 枚举值

| 值 | 说明 |
|---|---|
| 3 | 计划层级否词 |
| 5 | 单元层级否词 |
| 33 | 否词包与计划的绑定关系 |

### negativeMatchType 枚举值

| 值 | 说明 |
|---|---|
| 0 | 短语匹配 |
| 63 | 精确匹配 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| 空 body 返回 **5000 行**（默认全量） | 实测：不传筛选条件时接口默认返回全量否词 | **必须显式传筛选条件**，否则会一次性拉回数千行撑爆上下文 |
| `status=0` 但 `rows=0`（传了错误的字段名） | **实测：拼错字段名不会报错，而是静默返回 0 行** | 不要被 0 行误导为"没有否词"；核对字段名后重试 |
| `status=0` 但 `rows=0` | 该条件下确实没有数据 | 换条件或先确认账号下有无否词 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> 本表错误码为 **2026-09-18 对该账号受控故障注入的实测结果**（空 body / 错字段名 / 不存在的 ID），非推断。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"negative-keyword-get","userName":"子账号用户名","body":{"negativeKeywordTypeFields":["negativeKeyword","negativeKeywordId","campaignId","adgroupId","negativeKeywordPacketId","negativeMatchType","level"],"orderBy":"negativeKeyword","fieldFilters":[{"field":"campaignId","op":"in","values":[291681626]}],"limit":[0,1000],"desc":true}}'
```
