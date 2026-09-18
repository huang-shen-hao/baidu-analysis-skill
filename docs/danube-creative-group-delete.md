# 删除创意组

## Trigger

用户明确要求删除创意组时使用。

## Action

`danube-creative-group-delete`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/DanubeCreativeGroupService/deleteDanubeCreativeGroup`
- 方法说明：删除创意组。

## Payload

```json
{
  "action": "danube-creative-group-delete",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "creativeGroupIds": [1]
  }
}
```

## 安全要求

- 该接口会删除真实投放对象，且删除后**不可恢复**。
- 执行前必须确认：
  - 推广账号。
  - 创意组 ID 和创意组名称。
  - 对投放、报表和审计记录的影响。
  - 回滚或补救方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `creativeGroupIds` | Long[] | 是 | 创意组ID | 集合长度限制：[1, 1000] |

## 返回字段

返回被删除的创意组完整信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| `creativeGroupId` | Long | 创意组ID |
| `creativeGroupName` | String | 创意组名称 |
| `bindingRange` | DanubeWebPlanRangeItemType[] | 绑定范围 |
| `materialTypes` | Integer[] | 投放样式 |
| `category` | Long[] | 行业 |
| `creativeComponents` | DanubeCreativeComponent | 样式-组件信息 |
| `bindingLevel` | String | 绑定层级（USER/PLAN） |
| `device` | Integer | 投放设备（0-全部/1-移动/2-计算机） |
| `status` | Integer | 状态（0-启用/1-暂停/2-删除/3-审核不通过/4-审核中） |
| `pause` | Boolean | 暂停状态 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `danube-creative-group-delete requires body.creativeGroupIds` | 漏传必填字段 creativeGroupIds | 按本文「输入字段」补齐 body.creativeGroupIds |
| `danube-creative-group-delete: creativeGroupIds max 1000 per request` | 单次提交数量超过上限 1000 | 分批提交，每批 ≤ 1000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"danube-creative-group-delete","confirmWrite":true,"userName":"子账号用户名","body":{"creativeGroupIds":[1]}}'
```
