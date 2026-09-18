# 查询创意组

## Trigger

用户要求查询创意组、高级样式创意组、创意组列表、创意组绑定范围时使用。

## Action

`danube-creative-group-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/DanubeCreativeGroupService/getDanubeCreativeGroup`
- 方法说明：查询创意组。

## Payload

```json
{
  "action": "danube-creative-group-get",
  "userName": "子账号用户名",
  "body": {
    "pageNo": 1,
    "pageSize": 10,
    "fields": ["materialTypes", "bindingRange"],
    "creativeGroupIds": [1]
  }
}
```

## 行为说明

- 指定 `creativeGroupIds` 查询时不支持分页；不指定时通过 `pageNo`/`pageSize` 分页（默认 1/10，最大 100）。
- 以下字段固定返回：`creativeGroupName`、`creativeGroupId`、`bindingLevel`、`device`、`status`、`pause`。
- `fields` 为空时默认查询全部信息。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `pageNo` | Integer | - | 页号 | 默认 1 |
| `pageSize` | Integer | - | 单页大小 | 默认 10，最大 100 |
| `fields` | String[] | - | 查询字段 | 取值范围见下方枚举 |
| `creativeGroupIds` | Long[] | - | 创意组ID | [0, 100]；指定时不支持分页 |

### fields 可选枚举

| 字段 | 说明 |
|------|------|
| `materialTypes` | 创意样式 |
| `bindingRange` | 投放范围 |

## 返回字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `totalCount` | Integer | 物料列表总数 | - |
| `creativeGroupId` | Long | 创意组ID | - |
| `creativeGroupName` | String | 创意组名称 | [1, 20] 字节（中文 2 字节，英文/数字 1 字节） |
| `bindingLevel` | String | 绑定层级（只读） | USER-账户层级 / PLAN-计划或单元层级 |
| `device` | Integer | 投放设备（只读） | 0-全部 / 1-移动 / 2-计算机 |
| `status` | Integer | 状态（只读） | 0-启用 / 1-暂停 / 2-删除 / 3-审核不通过 / 4-审核中 |
| `pause` | Boolean | 暂停状态 | true-暂停 / false-启用 |
| `bindingRange` | DanubeWebPlanRangeItemType[] | 绑定范围 | 最多绑定 100 个计划和 1000 个单元 |
| `materialTypes` | Integer[] | 投放样式 | 取值范围见下方枚举 |
| `category` | Long[] | 行业 | 由总体行业至细分行业依次填写，如 [2880, 2881] |
| `creativeComponents` | DanubeCreativeComponent | 样式-组件信息 | 因样式类型而异 |

### bindingRange 说明

- 绑定账户：`[{"userId": 5962578}]`
- 绑定计划：`[{"campaignId": 91100082}]`
- 绑定单元：`[{"adgroupId": 4502837792}]`
- 绑定账户时不能同时绑定计划和单元；绑定计划时不能同时绑定该计划下的单元。

### materialTypes 可选枚举

| 值 | 说明 | 设备 |
|---|---|---|
| 3011 | 导航 | 计算机 |
| 3015 | 图加导航 | 计算机 |
| 1046 | 搜索头条 | 计算机 |
| 3196 | 行行通 | 计算机 |
| 3007 | 站内直达 | 计算机 |
| 3228 | 高级图文 | 计算机 |
| 3002 | 图文 | 计算机 |
| 3003 | 商品列表 | 计算机 |
| 3148 | 全息 | 计算机 |
| 1061 | 全息摘要 | 计算机 |
| 3124 | 热点橱窗 | 计算机 |
| 3120 | 商品橱窗 | 计算机 |
| 3036 | 爆款单品橱窗 | 计算机 |
| 11051 | 多品活动大图 | 计算机 |
| 11050 | 单品活动大图 | 计算机 |
| 3051 | 站内直达高级版 | 移动 |
| 3017 | 综合导航 | 移动 |
| 3010 | 文本导航 | 移动 |
| 3008 | 站内直达 | 移动 |
| 3041 | 搜索头条 | 移动 |
| 3004 | 行行通 | 移动 |
| 3149 | 全息 | 移动 |
| 1051 | 全息摘要 | 移动 |
| 1060 | 点睛 | 移动 |
| 3198 | 热点橱窗 | 移动 |
| 3138 | 商品橱窗 | 移动 |
| 3037 | 全景橱窗 | 移动 |
| 3035 | 爆款单品橱窗 | 移动 |
| 9050 | 爆款单品橱窗 | 移动 |
| 3128 | 商品列表 | 移动 |
| 11019 | 活动大图 | 移动 |

### creativeComponents 支持的组件类型

| 类型 | 说明 |
|------|------|
| `category` | 子链组件 |
| `image` | 图片组件 |
| `selectList` | 选择列表组件 |
| `textList` | 文字组件 |
| `plas` | 橱窗组件 |
| `list` | 列表组件 |

### device 枚举值

| 值 | 说明 |
|---|---|
| 0 | 全部 |
| 1 | 移动 |
| 2 | 计算机 |

### status 枚举值

| 值 | 说明 |
|---|---|
| 0 | 启用 |
| 1 | 暂停 |
| 2 | 删除 |
| 3 | 审核不通过 |
| 4 | 审核中 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=0` 但 `rows=0` | 过滤条件在当前账号下确实没有数据 | 先用空条件或不带过滤拉一次，确认账号下有无物料 |
| `status=2 code=99912` | 查询形态用错：字段名或参数组合不符合接口要求（实测于 getWord / getCreative） | 对照本文 Payload 的字段名与 `ids` + `idType` 组合 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：错误码来自脚本校验器与百度官方错误码表（节点 166），**未经逐条实测**。
> 本接口的实测观测见对应条目；如需复现可用受控故障注入（空 body / 错字段名）。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"danube-creative-group-get","userName":"子账号用户名","body":{"pageNo":1,"pageSize":10,"fields":["materialTypes","bindingRange"],"creativeGroupIds":[1]}}'
```
