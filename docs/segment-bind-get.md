# 查询组件绑定

## Trigger

用户要求查询组件绑定、物料绑定关系、单元/计划绑定的组件时使用。

## Action

`segment-bind-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AdvancedSegmentBindService/getSegmentBind`
- 方法说明：根据指定的层级，获取物料绑定信息。不支持账户层级查询。

## Payload

```json
{
  "action": "segment-bind-get",
  "userName": "子账号用户名",
  "body": {
    "ids": [144921185],
    "idType": 3,
    "segmentTypes": [320],
    "limit": [0, 100]
  }
}
```

## 行为说明

- `idType=3` 按计划层级查询，`idType=5` 按单元层级查询，`idType=24` 按物料层级查询，`idType=27` 按物料绑定层级查询。
- 601/602/603（应用下载按钮组件）为系统自动生成绑定，仅支持查询绑定和编辑绑定状态，不支持新建绑定。
- 返回全部属性，无需指定查询字段。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `ids` | Long[] | 是 | 查询ID集合 | - |
| `idType` | Integer | 是 | 查询ID的层级 | 见下方枚举 |
| `segmentTypes` | Long[] | - | 查询组件类型集合 | 取值范围见下方枚举 |
| `limit` | Integer[] | - | 分页 | 一个参数指定最大返回行数；两个参数 `[offset, count]` 指定偏移量和最大行数 |

### idType 可选枚举

| 值 | 说明 |
|---|---|
| 3 | 计划层级 |
| 5 | 单元层级 |
| 24 | 物料层级 |
| 27 | 物料绑定层级 |

### segmentTypes 可选枚举

| 值 | 说明 |
|---|---|
| 100 | 计算机小图组件 |
| 101 | 移动小图组件 |
| 310 | 移动图集组件 |
| 311 | 计算机图集组件 |
| 312 | 移动图文组件 |
| 313 | 计算机图文组件 |
| 320 | 移动大图组件 |
| 321 | 计算机大图组件 |
| 510 | 品牌信息组件 |
| 601 | 应用下载按钮组件-安卓（系统自动生成，不支持新建） |
| 602 | 应用下载按钮组件-IOS（系统自动生成，不支持新建） |
| 603 | 应用下载按钮组件-百度游戏（系统自动生成，不支持新建） |
| 10001 | 16:9视频组件 |
| 10002 | 9:16视频组件 |
| 10003 | 1:1视频组件 |

## 返回字段

返回全部属性。

| 字段 | 类型 | 说明 |
|------|------|------|
| `bindId` | Long | 绑定ID |
| `campaignId` | Long | 计划ID |
| `campaignName` | String | 计划名称 |
| `adgroupId` | Long | 单元ID |
| `adgroupName` | String | 单元名称 |
| `segmentId` | Long | 组件ID |
| `segmentType` | Long | 组件类型 |
| `bindSource` | Integer | 绑定来源 |
| `isDelete` | Boolean | 是否已删除 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=2 code=90180009000`（无 message） | 缺少必填参数（`ids` / `idType` / `segmentTypes`） | 按本文 Payload 补齐三个参数；该接口缺参时不给友好提示，只返回长码 |
| `status=0` 但 `rows=0` | 该层级下没有绑定关系 | 先用 `idType=5`（单元层级）确认 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> 本表错误码为 **2026-09-18 对该账号受控故障注入的实测结果**（空 body / 错字段名 / 不存在的 ID），非推断。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"segment-bind-get","userName":"子账号用户名","body":{"ids":[144921185],"idType":3,"segmentTypes":[320],"limit":[0,100]}}'
```
