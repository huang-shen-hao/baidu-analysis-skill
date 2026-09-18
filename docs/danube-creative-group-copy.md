# 复制创意组

## Trigger

用户要求复制创意组、克隆高级样式创意组时使用。

## Action

`danube-creative-group-copy`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/DanubeCreativeGroupService/copyDanubeCreativeGroup`
- 方法说明：复制创意组。

## Payload

```json
{
  "action": "danube-creative-group-copy",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "creativeGroupTypes": [
      {
        "creativeGroupId": 12345,
        "creativeGroupName": "复制后的创意组名称",
        "bindingRange": [{ "campaignId": 91100082 }]
      }
    ]
  }
}
```

## 安全要求

- 该接口会创建真实投放对象。
- 执行前必须确认原创意组 ID、新名称、绑定范围和回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 行为说明

- 复制创意组时最多支持 10 个。
- 复制后的创意组为独立的新创意组，修改不影响原创意组。

## 输入字段

`creativeGroupTypes` 必填 `DanubeCreativeGroupType[]`，最多 10 个。

### DanubeCreativeGroupType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `creativeGroupId` | Long | 是 | 原创意组ID | - |
| `creativeGroupName` | String | - | 新创意组名称（不传则使用原名称） | [1, 20] 字节（中文 2 字节，英文/数字 1 字节） |
| `bindingRange` | DanubeWebPlanRangeItemType[] | 是 | 新绑定范围 | 最多 100 个计划和 1000 个单元 |
| `creativeComponents` | DanubeCreativeComponent | - | 样式-组件信息（覆盖原组件） | 因样式类型而异 |

### bindingRange 说明

- 绑定账户：`[{"userId": 5962578}]`
- 绑定计划：`[{"campaignId": 91100082}]`
- 绑定单元：`[{"adgroupId": 4502837792}]`
- 绑定账户时不能同时绑定计划和单元；绑定计划时不能同时绑定该计划下的单元。

### creativeComponents 支持的组件类型

| 类型 | 说明 |
|------|------|
| `category` | 子链组件 |
| `image` | 图片组件 |
| `selectList` | 选择列表组件 |
| `textList` | 文字组件 |
| `plas` | 橱窗组件 |
| `list` | 列表组件 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `creativeGroupName` | String | 创意组名称 |
| `bindingRange` | DanubeWebPlanRangeItemType[] | 绑定范围 |
| `materialTypes` | Integer[] | 投放样式 |
| `category` | Long[] | 行业 |
| `creativeComponents` | DanubeCreativeComponent | 样式-组件信息 |
| `bindingLevel` | String | 绑定层级（USER/PLAN） |
| `device` | Integer | 投放设备 |
| `status` | Integer | 状态 |
| `pause` | Boolean | 暂停状态 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `danube-creative-group-copy: creativeGroupTypes[i].creativeGroupId is required` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `danube-creative-group-copy: creativeGroupTypes[i].creativeGroupName max 20 bytes` | 字段超过 20 字节（中文按 2 字节计） | 截断或拆分后重试 |
| `danube-creative-group-copy: creativeGroupTypes[i].bindingRange is required` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `danube-creative-group-copy: creativeGroupTypes[i].bindingRange cannot mix account level with campaign/adgroup level` | 绑定的层级互斥（account level with campaign/adgroup level） | 按本文「行为说明」只保留一种绑定层级 |
| `danube-creative-group-copy: creativeGroupTypes[i].bindingRange cannot mix campaign level with adgroup level` | 绑定的层级互斥（campaign level with adgroup level） | 按本文「行为说明」只保留一种绑定层级 |
| `danube-creative-group-copy requires body.creativeGroupTypes` | 漏传必填字段 creativeGroupTypes | 按本文「输入字段」补齐 body.creativeGroupTypes |
| `danube-creative-group-copy: creativeGroupTypes max 10 per request` | 单次提交数量超过上限 10 | 分批提交，每批 ≤ 10 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"danube-creative-group-copy","confirmWrite":true,"userName":"子账号用户名","body":{"creativeGroupTypes":[{"creativeGroupId":12345,"creativeGroupName":"复制后的创意组名称","bindingRange":[{"campaignId":91100082}]}}]}}'
```
