# 更新否定关键词包

## Trigger

用户要求更新否词包、修改否词包名称、向否词包添加/删除/修改否词时使用。

## Action

`negative-keyword-packet-update`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/NegativeKeywordPacketService/updateNegativeKeywordPacket`
- 方法说明：更新否词包，支持在单次请求中同时新增、修改、删除否词包内的否词。

## Payload

```json
{
  "action": "negative-keyword-packet-update",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "updateNegativeKeywordPacketTypes": [
      {
        "negativeKeywordPacketId": 414212,
        "negativeKeywordPacketName": "mod-name",
        "addNegativeKeywordTypes": [
          {
            "negativeKeyword": "新否词1",
            "negativeMatchType": 0
          }
        ],
        "updateNegativeKeywordTypes": [
          {
            "negativeKeywordId": 5811289,
            "negativeMatchType": 63
          }
        ],
        "deleteNegativeKeywordIds": [5811290]
      }
    ]
  }
}
```

## 安全要求

- 该接口会修改真实投放对象。
- 执行前必须确认账号、否词包 ID、修改内容及回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 行为说明

- 单次请求可同时进行三种操作：新增否词（`addNegativeKeywordTypes`）、修改否词（`updateNegativeKeywordTypes`）、删除否词（`deleteNegativeKeywordIds`）。
- 否词数量上限与账户权益星级相关：1星 2000 / 2星 4000 / 3星 5000。

## 输入字段

`updateNegativeKeywordPacketTypes` 必填 `UpdateNegativeKeywordPacketType[]`，集合长度限制：[1, 100]。

### UpdateNegativeKeywordPacketType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `negativeKeywordPacketId` | Long | 是 | 否词包ID | - |
| `negativeKeywordPacketName` | String | - | 否词包名称 | 最大 30 字节（中文 2 字节，英文/数字 1 字节） |
| `addNegativeKeywordTypes` | NegativeKeywordType[] | - | 本次新增的否词 | 集合长度限制：[1, 5000]；与账户权益星级相关 |
| `updateNegativeKeywordTypes` | NegativeKeywordType[] | - | 本次修改的否词 | 集合长度限制：[1, 5000]；与账户权益星级相关；需传入 `negativeKeywordId` |
| `deleteNegativeKeywordIds` | Long[] | - | 本次删除的否词ID | 集合长度限制：[1, 5000]；与账户权益星级相关 |

### NegativeKeywordType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `negativeKeywordId` | Long | 修改时必填 | 否定关键词ID | - |
| `negativeKeyword` | String | 新增时必填 | 否定关键词字面 | 最大 40 字节（中文 2 字节，英文/数字 1 字节） |
| `negativeMatchType` | Integer | 是 | 匹配模式 | 0-短语匹配 / 63-精确匹配 |

### negativeMatchType 枚举值

| 值 | 说明 |
|---|---|
| 0 | 短语匹配 |
| 63 | 精确匹配 |

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
| `negativeKeywordPacketId is required` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `negativeKeywordPacketName max 30 bytes` | 字段超过 30 字节（中文按 2 字节计） | 截断或拆分后重试 |
| `该字段必须是非空数组` | 集合为空或类型不对 | 至少传一个元素，且必须是数组 |
| `该集合单次上限 5000 条` | 单次提交数量超过上限 5000 | 分批提交，每批 ≤ 5000 |
| `addNegativeKeywordTypes[i].negativeKeyword is required` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `addNegativeKeywordTypes[i].negativeMatchType must be 0 (短语) or 63 (精确)` | 枚举取值非法 | 只接受文档列出的枚举值 |
| `updateNegativeKeywordTypes[i].negativeKeywordId is required` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `updateNegativeKeywordTypes[i].negativeMatchType must be 0 (短语) or 63 (精确)` | 枚举取值非法 | 只接受文档列出的枚举值 |
| `negative-keyword-packet-update requires body.updateNegativeKeywordPacketTypes` | 漏传必填字段 updateNegativeKeywordPacketTypes | 按本文「输入字段」补齐 body.updateNegativeKeywordPacketTypes |
| `negative-keyword-packet-update: updateNegativeKeywordPacketTypes max 100 per request` | 单次提交数量超过上限 100 | 分批提交，每批 ≤ 100 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"negative-keyword-packet-update","confirmWrite":true,"userName":"子账号用户名","body":{"updateNegativeKeywordPacketTypes":[{"negativeKeywordPacketId":414212,"negativeKeywordPacketName":"mod-name","addNegativeKeywordTypes":[{"negativeKeyword":"新否词1","negativeMatchType":0}],"updateNegativeKeywordTypes":[{"negativeKeywordId":5811289,"negativeMatchType":63}],"deleteNegativeKeywordIds":[5811290]}]}}'
```
