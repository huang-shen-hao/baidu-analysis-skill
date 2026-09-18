# 删除基础创意

## Trigger

用户明确要求删除创意时使用。

## Action

`creative-delete`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/CreativeService/deleteCreative`
- 方法说明：删除推广创意。

## Payload

```json
{
  "action": "creative-delete",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "creativeIds": [
      49306215638
    ]
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `creativeIds` | Long[] | 是 | 创意ID集合 | 长度限制：[1, 3000] |

## 返回字段

空数组 `[]`。

## 安全要求

- 该接口会删除真实投放对象，且删除后**不可恢复**。
- 执行前必须确认：
  - 推广账号。
  - 创意 ID 和创意标题。
  - 对投放、报表和审计记录的影响。
  - 回滚或补救方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `creative-delete requires body.creativeIds` | 漏传必填字段 creativeIds | 按本文「输入字段」补齐 body.creativeIds |
| `creative-delete: creativeIds max 3000 per request` | 单次提交数量超过上限 3000 | 分批提交，每批 ≤ 3000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |
| `status=2 code=90124` | 没有操作创意的权限 | 确认目标账户的创意操作权限 |
| `status=2 code=9012` | 没有操作该用户的权限 | 换有操作权限的子账号，或申请账户权限 |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"creative-delete","confirmWrite":true,"userName":"子账号用户名","body":{"creativeIds":[49306215638]}}'
```
