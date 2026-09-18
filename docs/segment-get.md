# 查询组件

## Trigger

用户要求查询组件、组件物料列表、大图组件、小图组件、视频组件、品牌信息组件时使用。

## Action

`segment-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AdvancedSegmentService/getSegment`
- 方法说明：根据指定的查询层级，获取组件物料列表。

## Payload

```json
{
  "action": "segment-get",
  "userName": "子账号用户名",
  "body": {
    "ids": [21520075699],
    "idType": 24
  }
}
```

## 行为说明

- `idType=2`（默认）时按账户层级查询，`idType=24` 时按物料层级查询。
- 一次查询最多支持 2000 个 ID。
- 返回全部属性，无需指定查询字段。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `ids` | Long[] | 是 | 查询ID集合 | 最多 2000 个 |
| `idType` | Integer | - | 查询ID的层级 | 默认 2；2-账户层级 / 24-物料层级 |
| `segmentTypes` | Long[] | - | 查询组件类型集合 | 取值范围见下方枚举 |
| `orderBy` | String | - | 排序列名 | SegmentType 中的属性名称 |
| `limit` | Integer[] | - | 分页 | 一个参数指定最大返回行数；两个参数 `[offset, count]` 指定偏移量和最大行数 |

### segmentTypes 可选枚举

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

返回全部属性。

| 字段 | 类型 | 说明 |
|------|------|------|
| `segmentId` | Long | 组件ID |
| `source` | Integer | 来源 |
| `segmentType` | Long | 组件类型（见上方枚举） |
| `auditContent` | Object | 审核内容 |
| `auditContent.picUrl` | String | 图片URL |
| `auditContent.imageId` | String | 图片ID |
| `auditContent.rawPicUrl` | String | 原图URL |
| `auditContent.desc` | String | 描述 |
| `pause` | Boolean | 暂停状态 |
| `modTime` | String | 修改时间 |
| `status` | Integer | 组件状态 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=0` 但筛选条件似乎没生效 | **实测：空 body 与拼错字段名都会返回 status=0，未知字段被静默忽略** | 务必核对字段名拼写；先看返回条数是否符合预期，必要时用 `VERBOSE` 对照「输入字段」 |
| `status=0` 但 `rows=0` | 该条件下没有组件 | 先用空条件确认账号下有无组件 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> 本表错误码为 **2026-09-18 对该账号受控故障注入的实测结果**（空 body / 错字段名 / 不存在的 ID），非推断。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"segment-get","userName":"子账号用户名","body":{"ids":[21520075699],"idType":24}}'
```
