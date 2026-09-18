# 添加否定关键词包

## Trigger

用户要求添加否词包、创建否定关键词包时使用。

## Action

`negative-keyword-packet-add`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/NegativeKeywordPacketService/addNegativeKeywordPacket`
- 方法说明：添加否词包。

## Payload

```json
{
  "action": "negative-keyword-packet-add",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "negativeKeywordPacketTypes": [
      {
        "negativeKeywordPacketName": "packet1",
        "negativeKeywords": [
          {
            "negativeKeyword": "word1",
            "negativeMatchType": 63
          }
        ]
      }
    ]
  }
}
```

## 安全要求

- 该接口会创建真实投放对象。
- 执行前必须确认账号、否词包名称、否词内容及回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

`negativeKeywordPacketTypes` 必填 `NegativeKeywordPacketType[]`，集合长度限制：[1, 100]。

### NegativeKeywordPacketType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `negativeKeywordPacketName` | String | 是 | 否词包名称 | 最大 30 字节（中文 2 字节，英文/数字 1 字节） |
| `negativeKeywords` | NegativeKeywordType[] | 是 | 否词包内的否词信息 | 集合长度限制：[1, 5000]；与账户权益星级相关：1星 2000 / 2星 4000 / 3星 5000 |

### NegativeKeywordType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `negativeKeyword` | String | 是 | 否定关键词字面 | 最大 40 字节（中文 2 字节，英文/数字 1 字节） |
| `negativeMatchType` | Integer | 是 | 匹配模式 | 0-短语匹配 / 63-精确匹配 |

### negativeMatchType 枚举值

| 值 | 说明 |
|---|---|
| 0 | 短语匹配 |
| 63 | 精确匹配 |

## 返回字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `negativeKeywordPacketId` | Long | 新创建的否词包ID | - |
| `negativeKeywordPacketName` | String | 否词包名称 | 最大 30 字节（中文 2 字节，英文/数字 1 字节） |
| `totalNegativeKeywordCount` | Long | 否词包内否词总数 | - |
| `normalNegativeKeywordCount` | Long | 否词包内短语匹配否词总数 | - |
| `exactNegativeKeywordCount` | Long | 否词包内精确匹配否词总数 | - |
| `negativeKeywords` | NegativeKeywordType[] | 否词包内的否词信息 | 集合长度限制：[1, 5000] |
| `bindCampaignIds` | Long[] | 否词包绑定的计划ID | - |
| `bindCampaignCount` | Integer | 否词包绑定的计划数量 | - |

### NegativeKeywordType（返回）

| 字段 | 类型 | 说明 |
|------|------|------|
| `negativeKeywordId` | Long | 否定关键词ID |
| `negativeKeyword` | String | 否定关键词字面 |
| `negativeMatchType` | Integer | 匹配模式（0-短语匹配 / 63-精确匹配） |
| `negativeKeywordPacketId` | Long | 所属否词包ID |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `negative-keyword-packet-add requires body.negativeKeywordPacketTypes` | 漏传必填字段 negativeKeywordPacketTypes | 按本文「输入字段」补齐 body.negativeKeywordPacketTypes |
| `negative-keyword-packet-add: negativeKeywordPacketTypes max 100 per request` | 单次提交数量超过上限 100 | 分批提交，每批 ≤ 100 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"negative-keyword-packet-add","confirmWrite":true,"userName":"子账号用户名","body":{"negativeKeywordPacketTypes":[{"negativeKeywordPacketName":"packet1","negativeKeywords":[{"negativeKeyword":"word1","negativeMatchType":63}]}]}}'
```
