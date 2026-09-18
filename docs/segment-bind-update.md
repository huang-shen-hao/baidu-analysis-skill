# 更新组件绑定

## Trigger

用户要求更新组件绑定状态、暂停/启用组件绑定时使用。

## Action

`segment-bind-update`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AdvancedSegmentBindService/updateSegmentBind`
- 方法说明：更新物料绑定状态（可批量）。仅支持绑定关系状态修改，物料绑定关系修改请先删除后添加。

## Payload

```json
{
  "action": "segment-bind-update",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "items": [
      {
        "bindId": 123123,
        "pause": true
      }
    ]
  }
}
```

## 安全要求

- 该接口会修改绑定状态。
- 执行前必须确认账号、绑定 ID 和回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 行为说明

- 仅支持修改绑定关系的启停状态，不支持修改绑定关系本身。
- 如需修改物料绑定关系，请先删除再添加。

## 输入字段

`items` 必填 `SegmentBindType[]`，单次请求不超过 2000 个。

### SegmentBindType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `bindId` | Long | 是 | 绑定ID | - |
| `pause` | Boolean | 是 | 启停状态 | false-启用 / true-暂停 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `bindId` | Long | 绑定ID |
| `pause` | Boolean | 启停状态 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `segment-bind-update requires body.segmentBindTypes` | 漏传必填字段 segmentBindTypes | 按本文「输入字段」补齐 body.segmentBindTypes |
| `segment-bind-update: segmentBindTypes max 2000 per request` | 单次提交数量超过上限 2000 | 分批提交，每批 ≤ 2000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"segment-bind-update","confirmWrite":true,"userName":"子账号用户名","body":{"items":[{"bindId":123123,"pause":true}]}}'
```
