# 添加组件绑定

## Trigger

用户要求绑定组件到单元或计划、添加组件绑定时使用。

## Action

`segment-bind-add`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AdvancedSegmentBindService/addSegmentBind`
- 方法说明：新增绑定关系（可批量）。

## 行为说明

- 该接口仅适用于绑定到单元层级。
- 绑定到账户层级时，不需要调用此接口，仅需在新增组件（addSegment）时指定 `source=3` 即可。
- 品牌信息组件仅支持绑定到单元层级，不支持绑定到账户层级。

## Payload

```json
{
  "action": "segment-bind-add",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "items": [
      {
        "bindSource": 0,
        "bindLevel": 1,
        "segmentType": 320,
        "segmentId": 21520208704,
        "adgroupId": 5423274748
      }
    ]
  }
}
```

## 安全要求

- 该接口会创建绑定关系。
- 执行前必须确认账号、组件 ID、单元/计划 ID 和回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

`items` 必填 `SegmentBindType[]`，单次请求不超过 2000 个。

### SegmentBindType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `segmentId` | Long | 是 | 组件ID | - |
| `segmentType` | Long | 是 | 组件类型 | 取值范围见下方枚举 |
| `adgroupId` | Long | 是 | 单元ID | - |
| `bindSource` | Long | 是 | 投放范围 | 0-自定义绑定到单元层级 |
| `bindLevel` | Integer | 是 | 绑定目标层级 | 1-绑定到单元层级 / 2-绑定到计划层级 |

### segmentType 可选枚举

| 值 | 说明 |
|---|---|
| 100 | 计算机小图组件 |
| 101 | 移动小图组件 |
| 320 | 移动大图组件 |
| 321 | 计算机大图组件 |
| 510 | 品牌信息组件 |
| 10001 | 16:9视频组件 |
| 10002 | 9:16视频组件 |
| 10003 | 1:1视频组件 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `bindId` | Long | 绑定ID |
| `segmentId` | Long | 组件ID |
| `segmentType` | Long | 组件类型 |
| `adgroupId` | Long | 单元ID |
| `campaignId` | Long | 计划ID |
| `campaignName` | String | 计划名称 |
| `adgroupName` | String | 单元名称 |
| `bindSource` | Long | 投放范围 |
| `pause` | Boolean | 暂停状态 |
| `status` | Integer | 绑定状态 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `segment-bind-add requires body.items` | 漏传必填字段 items | 按本文「输入字段」补齐 body.items |
| `segment-bind-add: segmentBindTypes max 2000 per request` | 单次提交数量超过上限 2000 | 分批提交，每批 ≤ 2000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"segment-bind-add","confirmWrite":true,"userName":"子账号用户名","body":{"items":[{"bindSource":0,"bindLevel":1,"segmentType":320,"segmentId":21520208704,"adgroupId":5423274748}]}}'
```
