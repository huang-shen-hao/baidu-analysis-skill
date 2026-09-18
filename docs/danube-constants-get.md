# 获取高级样式所需常量

## Trigger

用户要求获取高级样式常量、样式列表、创意组行业树、导航样式行业树时使用。

## Action

`danube-constants-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/DanubeCreativeGroupService/getDanubeConstants`
- 方法说明：获取高级样式所需常量。

## Payload

```json
{
  "action": "danube-constants-get",
  "userName": "子账号用户名",
  "body": {
    "fields": [
      "materialTypes",
      "categoryList",
      "tradeList",
      "navLabelMapByTrade"
    ]
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `fields` | String[] | 是 | 常量字段 | 取值范围见下方枚举 |

### fields 可选枚举

| 字段 | 说明 |
|------|------|
| `materialTypes` | 样式列表 |
| `categoryList` | 创意组行业树 |
| `tradeList` | 导航样式行业树 |
| `navLabelMapByTrade` | 导航样式行业-标签映射 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `materialTypes` | DanubeMaterialType[] | 样式列表 |
| `categoryList` | TradeVo[] | 创意组行业树 |
| `tradeList` | TradeVo[] | 导航样式行业树 |
| `navLabelMapByTrade` | Map<String, List> | 导航样式行业-标签映射 |
| `slogans` | Map<String, Map<String, Collection>> | 固定列列表（计算机端选 PC，移动端选 WISE） |

### DanubeMaterialType（样式）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `mtId` | Integer | 样式ID | 添加或修改样式组件内容时必填 |
| `cnName` | String | 样式中文名 | 只读 |
| `enName` | String | 样式英文名 | 只读 |
| `style` | String | 样式系列 | 只读；见下方枚举 |

### style 枚举值

| 值 | 说明 |
|---|---|
| `NAVIGATION` | 导航 |
| `IMAGE_TEXT` | 图文 |
| `HOLOGRAPHY` | 全息 |
| `PLA` | 橱窗 |
| `LIST` | 列表 |

### TradeVo（行业树节点）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 标签ID |
| `text` | String | 标签值 |
| `children` | TradeVo[] | 子节点 |

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
node scripts/api.ts --payload='{"action":"danube-constants-get","userName":"子账号用户名","body":{"fields":["materialTypes","categoryList","tradeList","navLabelMapByTrade"]}}'
```
