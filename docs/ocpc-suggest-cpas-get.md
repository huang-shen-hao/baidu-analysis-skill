# 获取目标转化建议出价

## Trigger

用户要求获取oCPC建议出价、目标转化建议CPA、行业CPA推荐值时使用。

## Action

`ocpc-suggest-cpas-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/FcOcpcService/getSuggestCPAs`
- 方法说明：获取建议CPA，包括行业CPA推荐值、历史生效范围CPA推荐值。

## Payload

```json
{
  "action": "ocpc-suggest-cpas-get",
  "userName": "子账号用户名",
  "body": {
    "fields": ["tradeSuggestCpa", "noThresholdSuggestCpa"],
    "dataFlow": [1],
    "transTypes": [3, 18],
    "campaignIds": [1]
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `fields` | String[] | 是 | 请求字段 | 见下方枚举 |
| `dataFlow` | Integer[] | 是 | 数据来源 | 见下方枚举 |
| `transTypes` | Integer[] | 是 | 转化类型 | 见下方枚举 |
| `campaignIds` | Long[] | 是 | 计划ID集合 | 通过 campaign-get 接口获取 |

### fields 可选枚举

| 字段 | 说明 |
|------|------|
| `tradeSuggestCpa` | 基于客户所在行业投放效果数据推荐CPA |
| `noThresholdSuggestCpa` | 基于计划过去一周效果数据推荐CPA |

### dataFlow（数据来源）枚举值

| 值 | 说明 |
|---|---|
| 1 | 网页JS布码 |
| 2 | 线索API |
| 3 | 咨询工具授权 |
| 4 | 基木鱼/度小店 |
| 5 | 应用API |
| 6 | 电话数据授权 |
| 7 | 百度智能小程序SDK |
| 8 | 应用SDK |

### transTypes（转化类型）枚举值

| 值 | 说明 |
|---|---|
| 1 | 咨询按钮点击 |
| 2 | 电话按钮点击 |
| 3 | 表单提交成功 |
| 4 | APP激活 |
| 5 | 表单按钮点击 |
| 6 | 下载（预约）按钮点击 |
| 7 | 购买按钮点击 |
| 8 | 短信咨询按钮点击 |
| 9 | 电商订单 |
| 10 | 购买成功 |
| 12 | 预约按钮点击 |
| 13 | 表单有效请求 |
| 14 | 订单提交成功 |
| 15 | 加入购物车按钮点击 |
| 16 | 表单调起按钮点击 |
| 17 | 三句话咨询 |
| 18 | 留线索 |
| 19 | 一句话咨询 |
| 20 | 关键页面浏览 |
| 25 | APP注册 |
| 26 | APP付费 |
| 27 | 客户自定义 |
| 28 | 次日留存 |
| 30 | 电话拨通 |
| 31 | 地图按钮点击 |
| 32 | QQ咨询按钮点击 |
| 33 | 抽奖按钮点击 |
| 34 | 投票按钮点击 |
| 35 | 微信复制按钮点击 |
| 36 | 评价按钮点击 |
| 40 | 关注按钮点击 |
| 41 | 申请小额贷款 |
| 42 | 小额贷款授信 |
| 43 | 小程序线索 |
| 46 | 加入购物车 |
| 49 | 登录 |
| 50 | 预约 |
| 51 | 有意向客户 |
| 52 | 深度使用 |
| 56 | 到店 |
| 57 | 调起点击 |
| 61 | 二次跳转 |
| 67 | 微信调起按钮点击 |
| 68 | 粉丝关注成功 |
| 72 | 聊到相关业务 |
| 99 | 其他 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `tradeSuggestCpa` | Double | 基于客户所在行业投放效果数据推荐CPA |
| `noThresholdSuggestCpa` | Double | 基于计划过去一周效果数据推荐CPA |

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
node scripts/api.ts --payload='{"action":"ocpc-suggest-cpas-get","userName":"子账号用户名","body":{"fields":["tradeSuggestCpa","noThresholdSuggestCpa"],"dataFlow":[1],"transTypes":[3,18],"campaignIds":[1]}}'
```
