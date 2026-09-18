# 添加否定关键词

## Trigger

用户要求添加否定关键词、新增否词、添加计划否词、添加单元否词、绑定否词包时使用。

## Action

`negative-keyword-add`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/NegativeKeywordService/addNegativeKeyword`
- 方法说明：添加否定关键词，支持添加计划/单元层级否定关键词、添加计划-否词包绑定。

## Payload

### 添加计划否词

```json
{
  "action": "negative-keyword-add",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "negativeKeywordTypes": [
      {
        "negativeKeyword": "示例否词",
        "campaignId": 1,
        "negativeMatchType": 0
      }
    ]
  }
}
```

### 添加计划-否词包绑定

```json
{
  "action": "negative-keyword-add",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "negativeKeywordTypes": [
      {
        "negativeKeywordPacketId": 42432124,
        "campaignId": 32235
      }
    ]
  }
}
```

## 安全要求

- 该接口会创建真实投放对象。
- 执行前必须确认账号、计划/单元 ID、否词内容、匹配模式和影响范围。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

`negativeKeywordTypes` 必填 `NegativeKeywordType[]`，集合长度限制：[1, 5000]（与账户权益星级相关：1星-2000 / 2星-4000 / 3星-5000）。

### NegativeKeywordType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `negativeKeyword` | String | - | 否定关键词 | 添加计划/单元否词时必填；最大 40 字节（中文 2 字节，英文/数字 1 字节）；添加计划-否词包绑定时禁止填写 |
| `campaignId` | Long | - | 计划ID | 添加计划否词、计划-否词包绑定时必填 |
| `adgroupId` | Long | - | 单元ID | 添加单元否词时必填；单元不支持绑定否词包 |
| `negativeMatchType` | Integer | - | 匹配模式 | 添加计划/单元否词时必填；0-短语匹配 / 63-精确匹配 |
| `negativeKeywordPacketId` | Long | - | 否词包ID | 添加计划-否词包绑定时必填 |

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
| `negativeKeywordPacketId` | Long | 否词包ID |

### level 枚举值

| 值 | 说明 |
|---|---|
| 3 | 计划层级否词 |
| 5 | 单元层级否词 |
| 33 | 否词包与计划的绑定关系 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `.negativeMatchType must be 0 (短语) or 63 (精确)` | 匹配模式传了其它值 | 仅接受 0 或 63 |
| `must not be set when binding a packet` | 否词包绑定的同时传了 `negativeKeyword` | 绑定时只传 `campaignId` + `negativeKeywordPacketId` |
| `negativeKeyword max 40 bytes` | 否词超长（中文按 2 字节计） | 截断或拆分后重试 |
| `campaignId is required when binding a packet` | 绑定否词包漏传计划 ID | 补 `campaignId` |
| `status=1 code=90127` | 批量操作部分失败 | **禁止整批重试**，只重试 `failures[].position` 指向的条目 |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

### 添加计划否词

```bash
node scripts/api.ts --payload='{"action":"negative-keyword-add","confirmWrite":true,"userName":"子账号用户名","body":{"negativeKeywordTypes":[{"negativeKeyword":"示例否词","campaignId":1,"negativeMatchType":0}]}}'
```

### 添加计划-否词包绑定

```bash
node scripts/api.ts --payload='{"action":"negative-keyword-add","confirmWrite":true,"userName":"子账号用户名","body":{"negativeKeywordTypes":[{"negativeKeywordPacketId":42432124,"campaignId":32235}]}}'
```
