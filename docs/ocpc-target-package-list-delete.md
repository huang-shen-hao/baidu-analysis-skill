# 删除oCPC出价策略

## Trigger

用户明确要求删除oCPC出价策略时使用。

## Action

`ocpc-target-package-list-delete`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/OcpcService/deleteTargetPackage`
- 方法说明：根据oCPC出价策略ID删除oCPC出价策略。

## Payload

```json
{
  "action": "ocpc-target-package-list-delete",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "targetPackageIds": [100]
  }
}
```

## 安全要求

- 该接口会删除真实出价策略，且删除后**不可恢复**。
- 执行前必须确认：
  - 推广账号。
  - oCPC出价策略 ID 和策略名称。
  - 删除后绑定的计划将恢复为原有出价方式。
  - 对投放、花费和报表的影响。
  - 回滚或补救方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `targetPackageIds` | Long[] | 是 | oCPC出价策略ID集合 | 集合长度限制：[1, 100] |

## 返回字段

返回被删除的策略完整信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| `targetPackageId` | Long | oCPC出价策略ID |
| `targetPackageName` | String | oCPC出价策略名称 |
| `ocpcBidType` | Integer | 出价模式（1-目标转化成本 / 2-点击出价系数控制） |
| `ocpcBid` | Double | 目标转化出价 |
| `scope` | TargetPackageBindInfo[] | 生效范围（绑定的计划） |
| `dataFlowData` | TargetPackageDataflowInfo[] | 数据来源及目标转化 |
| `assistTransTypes` | Integer[] | 深度转化类型 |
| `packageStatus` | Integer | 出价策略状态（0-未生效/1-投放中/2-学习中/3-学习失败/4-学习结束） |
| `ocpcDeepCpa` | Double | 深度转化出价 |
| `deepTypeStat` | Integer | 深度转化状态（1-未生效/2-自动优化生效/3-双出价生效/4-双出价生效） |
| `deepTransTypeMode` | Integer | 优化深度转化（0-不使用/1-优化转化行为/2-优化ROI） |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `ocpc-target-package-list-delete requires body.targetPackageIds` | 漏传必填字段 targetPackageIds | 按本文「输入字段」补齐 body.targetPackageIds |
| `ocpc-target-package-list-delete: targetPackageIds max 100 per request` | 单次提交数量超过上限 100 | 分批提交，每批 ≤ 100 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"ocpc-target-package-list-delete","confirmWrite":true,"userName":"子账号用户名","body":{"targetPackageIds":[100]}}'
```
