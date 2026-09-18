# 删除组件

## Trigger

用户明确要求删除组件时使用。

## Action

`segment-delete`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AdvancedSegmentService/deleteSegment`
- 方法说明：删除指定的物料（可批量）。

## Payload

```json
{
  "action": "segment-delete",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "items": [9000678668, 9000678669]
  }
}
```

## 安全要求

- 该接口会删除真实投放对象，且删除后**不可恢复**。
- 执行前必须确认：
  - 推广账号。
  - 组件 ID。
  - 对投放和创意的影响。
  - 回滚或补救方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `items` | Long[] | 是 | 删除的物料ID集合 | 单次请求不超过 2000 个 |

## 返回字段

仅返回物料 ID。

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `segment-delete requires body.segmentTypes` | 漏传必填字段 segmentTypes | 按本文「输入字段」补齐 body.segmentTypes |
| `segment-delete: segmentTypes max 2000 per request` | 单次提交数量超过上限 2000 | 分批提交，每批 ≤ 2000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"segment-delete","confirmWrite":true,"userName":"子账号用户名","body":{"items":[9000678668,9000678669]}}'
```
