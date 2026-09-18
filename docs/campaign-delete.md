# 删除推广计划

## Trigger

用户明确要求删除推广计划时使用。

## Action

`campaign-delete`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/CampaignService/deleteCampaign`
- 方法说明：删除指定的计划（可批量）。

## Payload

```json
{
  "action": "campaign-delete",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "campaignIds": [
      149248725,
      149248783
    ]
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `campaignIds` | Long[] | 是 | 计划ID集合 | 长度限制：[1, 100] |

## 返回字段

空数组 `[]`。

## 安全要求

- 该接口会删除真实投放对象，且删除后**不可恢复**。
- 执行前必须确认：
  - 推广账号。
  - 计划 ID 和计划名称。
  - 对投放、报表、转化学习和审计记录的影响。
  - 回滚或补救方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `campaign-delete requires body.campaignIds` | 漏传必填字段 campaignIds | 按本文「输入字段」补齐 body.campaignIds |
| `campaign-delete: campaignIds max 100 per request` | 单次提交数量超过上限 100 | 分批提交，每批 ≤ 100 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |
| `status=2 code=90121` | 没有操作计划的权限 | 确认目标账户的计划操作权限 |
| `status=2 code=901301` | 无权限删除推广计划 | 账户未开放计划删除权限 |
| `status=2 code=9012` | 没有操作该用户的权限 | 换有操作权限的子账号，或申请账户权限 |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"campaign-delete","confirmWrite":true,"userName":"子账号用户名","body":{"campaignIds":[149248725]}}'
```
