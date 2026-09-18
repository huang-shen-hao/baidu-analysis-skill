# 删除否定关键词

## Trigger

用户要求删除否定关键词、删除计划否词、删除单元否词、解除计划-否词包绑定时使用。

## Action

`negative-keyword-delete`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/NegativeKeywordService/deleteNegativeKeyword`
- 方法说明：删除否定关键词，支持删除计划/单元层级否定关键词、删除计划-否词包绑定。

## Payload

```json
{
  "action": "negative-keyword-delete",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "negativeKeywordIds": [1]
  }
}
```

## 安全要求

- 该接口会删除真实投放对象，且删除后**不可恢复**。
- 执行前必须确认：
  - 推广账号。
  - 否词 ID 及其所属层级（计划否词 / 单元否词 / 计划-否词包绑定）。
  - 删除后对投放和报表的影响。
  - 回滚或补救方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `negativeKeywordIds` | Long[] | 是 | 需要删除的否词ID列表 | 支持计划否词ID、单元否词ID、计划-否词包绑定ID；集合长度 [1, 5000]（与账户权益星级相关：1星-2000 / 2星-4000 / 3星-5000） |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `negativeKeywordId` | Long | 否定关键词ID |
| `negativeKeyword` | String | 否定关键词 |
| `level` | Integer | 所属层级 |
| `campaignId` | Long | 计划ID |
| `campaignName` | String | 计划名称 |
| `adgroupId` | Long | 单元ID |
| `adgroupName` | String | 单元名称 |
| `negativeMatchType` | Integer | 匹配模式 |
| `negativeKeywordPacketId` | Long | 否词包ID |

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
| `negative-keyword-delete requires body.negativeKeywordIds` | 漏传必填字段 negativeKeywordIds | 按本文「输入字段」补齐 body.negativeKeywordIds |
| `negative-keyword-delete: negativeKeywordIds max 5000 per request` | 单次提交数量超过上限 5000 | 分批提交，每批 ≤ 5000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"negative-keyword-delete","confirmWrite":true,"userName":"子账号用户名","body":{"negativeKeywordIds":[1]}}'
```
