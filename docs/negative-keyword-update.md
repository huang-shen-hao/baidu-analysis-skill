# 修改否定关键词

## Trigger

用户要求修改否定关键词的匹配模式、更改否词匹配方式时使用。

## Action

`negative-keyword-update`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/NegativeKeywordService/updateNegativeKeyword`
- 方法说明：修改否定关键词，支持修改否定关键词的匹配模式。

## Payload

```json
{
  "action": "negative-keyword-update",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "negativeKeywordTypes": [
      {
        "negativeKeywordId": 14234,
        "negativeMatchType": 0
      }
    ]
  }
}
```

## 安全要求

- 该接口会修改真实投放对象。
- 执行前必须确认否词 ID、当前匹配模式、目标匹配模式和影响范围。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

`negativeKeywordTypes` 必填 `NegativeKeywordType[]`，集合长度限制：[1, 5000]（与账户权益星级相关：1星-2000 / 2星-4000 / 3星-5000）。

### NegativeKeywordType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `negativeKeywordId` | Long | 是 | 否定关键词ID | level=3 时为计划独立否词ID；level=5 时为单元独立否词ID；level=33 时为计划与否词包绑定ID |
| `negativeMatchType` | Integer | - | 匹配模式 | 0-短语匹配 / 63-精确匹配；level=3/5 时有意义，level=33 时固定返回 0 |

### negativeMatchType 枚举值

| 值 | 说明 |
|---|---|
| 0 | 短语匹配 |
| 63 | 精确匹配 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `negativeKeywordId` | Long | 否定关键词ID |
| `negativeKeyword` | String | 否定关键词 |
| `level` | Integer | 所属层级 |
| `campaignId` | Long | 计划ID |
| `campaignName` | String | 计划名称 |
| `negativeMatchType` | Integer | 匹配模式 |

### level 枚举值

| 值 | 说明 |
|---|---|
| 3 | 计划层级否词 |
| 5 | 单元层级否词 |
| 33 | 否词包与计划的绑定关系 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `negativeKeywordId is required` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `negativeMatchType must be 0 (短语) or 63 (精确)` | 枚举取值非法 | 只接受文档列出的枚举值 |
| `negative-keyword-update requires body.negativeKeywordTypes` | 漏传必填字段 negativeKeywordTypes | 按本文「输入字段」补齐 body.negativeKeywordTypes |
| `negative-keyword-update: negativeKeywordTypes max 5000 per request` | 单次提交数量超过上限 5000 | 分批提交，每批 ≤ 5000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"negative-keyword-update","confirmWrite":true,"userName":"子账号用户名","body":{"negativeKeywordTypes":[{"negativeKeywordId":14234,"negativeMatchType":0}]}}'
```
