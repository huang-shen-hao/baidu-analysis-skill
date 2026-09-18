# 删除转化追踪

## Trigger

用户明确要求删除转化追踪时使用。

## Action

`fc-transtrace-list-delete`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/FcTransTraceApiService/deleteFcTransTrace`
- 方法说明：删除转化追踪。

## Payload

```json
{
  "action": "fc-transtrace-list-delete",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "trans": [
      {
        "transId": 1,
        "transMode": 8
      }
    ]
  }
}
```

## 安全要求

- 该接口会删除真实转化追踪配置，且删除后**不可恢复**。
- 执行前必须确认：
  - 推广账号。
  - 转化追踪 ID 和名称。
  - 删除后对投放数据采集和 oCPC 出价策略的影响。
  - 回滚或补救方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 行为说明

- 单次最多删除 100 个转化追踪，集合长度 [1, 100]。
- 删除成功时响应 data 为空数组，且 header 内无 failures 即表示删除成功。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `trans` | FcTransIdAndTransMode[] | 是 | 要删除的转化追踪 | 集合长度 [1, 100] |
| `trans[].transId` | Long | 是 | 转化追踪ID | - |
| `trans[].transMode` | Integer | 是 | 接入方式 | 见下方枚举 |

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

## 返回字段

响应内 data 为空数组，且 header 内无 failures 即表示删除成功。

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `fc-transtrace-list-delete requires body.transTraceList` | 漏传必填字段 transTraceList | 按本文「输入字段」补齐 body.transTraceList |
| `fc-transtrace-list-delete: transTraceList max 100 per request` | 单次提交数量超过上限 100 | 分批提交，每批 ≤ 100 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{\"action\":\"fc-transtrace-list-delete\",\"confirmWrite\":true,\"userName\":\"子账号用户名\",\"body\":{\"trans\":[{\"transId\":1,\"transMode\":8}]}}'
```
