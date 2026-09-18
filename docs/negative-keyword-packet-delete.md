# 删除否定关键词包

## Trigger

用户明确要求删除否词包、删除否定关键词包时使用。

## Action

`negative-keyword-packet-delete`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/NegativeKeywordPacketService/deleteNegativeKeywordPacket`
- 方法说明：删除否词包。

## Payload

```json
{
  "action": "negative-keyword-packet-delete",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "negativeKeywordPacketIds": [
      414212
    ]
  }
}
```

## 安全要求

- 该接口会删除真实投放对象，且删除后**不可恢复**。
- 执行前必须确认：
  - 推广账号。
  - 否词包 ID 和否词包名称。
  - 否词包内的否词将一并删除。
  - 对投放、报表和审计记录的影响。
  - 回滚或补救方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `negativeKeywordPacketIds` | Long[] | 是 | 需要删除的否词包ID列表 | 集合长度限制：[1, 100] |

## 返回字段

返回被删除的否词包完整信息。

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
| `negativeKeywordId` | Long | 否定关键词ID | level=3 为计划否词ID；level=5 为单元否词ID；level=33 为绑定ID |
| `negativeKeyword` | String | 否定关键词 | 最大 40 字节；level=3 为计划否词字面；level=5 为单元否词字面；level=33 为否词包名称 |
| `level` | Integer | 所属层级 | 3-计划层级 / 5-单元层级 / 33-否词包与计划绑定关系 |
| `campaignId` | Long | 计划ID | - |
| `campaignName` | String | 计划名称 | - |
| `adgroupId` | Long | 单元ID | - |
| `adgroupName` | String | 单元名称 | - |
| `negativeMatchType` | Integer | 匹配模式 | 0-短语匹配 / 63-精确匹配；仅 level=3 和 5 时有意义 |
| `negativeKeywordPacketId` | Long | 否词包ID | 仅 level=33 时有意义 |

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
| `negative-keyword-packet-delete requires body.negativeKeywordPacketIds` | 漏传必填字段 negativeKeywordPacketIds | 按本文「输入字段」补齐 body.negativeKeywordPacketIds |
| `negative-keyword-packet-delete: negativeKeywordPacketIds max 100 per request` | 单次提交数量超过上限 100 | 分批提交，每批 ≤ 100 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"negative-keyword-packet-delete","confirmWrite":true,"userName":"子账号用户名","body":{"negativeKeywordPacketIds":[414212]}}'
```
