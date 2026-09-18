# 查询转化追踪

## Trigger

用户要求查询转化追踪、获取转化追踪列表时使用。

## Action

`fc-transtrace-list-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/FcTransTraceApiService/getFcTransTraceList`
- 方法说明：查询转化追踪。

## Payload

```json
{
  "action": "fc-transtrace-list-get",
  "userName": "子账号用户名",
  "body": {
    "transName": "转化追踪名称",
    "traceTargetList": [1, 2, 3],
    "transModeList": [4, 6, 7, 8, 9, 10, 11, 23, 24],
    "transStatusList": [0, 1, 2, 3],
    "limit": [0, 100]
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `transName` | String | 否 | 转化追踪名称 | - |
| `traceTargetList` | Integer[] | 否 | 追踪目标 | 见下方枚举 |
| `transModeList` | Integer[] | 否 | 接入方式 | 见下方枚举 |
| `transStatusList` | Integer[] | 否 | 转化配置状态 | 见下方枚举 |
| `limit` | Integer[] | 否 | 分页查询 | 第一个参数为偏移量，第二个参数为返回记录数 |

### traceTargetList（追踪目标）枚举值

| 值 | 说明 |
|---|---|
| 1 | 网站 |
| 2 | APP |
| 3 | 小程序 |

### transModeList（接入方式）枚举值

| 值 | 说明 |
|---|---|
| 4 | 线索API |
| 6 | 咨询工具授权 |
| 7 | 网站JS布码 |
| 8 | 应用API |
| 9 | 电话数据授权 |
| 10 | 百度智能小程序SDK |
| 11 | 应用SDK |
| 23 | 百度统计网站导入 |
| 24 | 百度统计小程序导入 |

### transStatusList（转化配置状态）枚举值

| 值 | 说明 |
|---|---|
| 0 | 联调成功 |
| 1 | 联调失败 |
| 2 | 联调等待 |
| 3 | 无需联调 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `fields` | FcTransTraceType[] | 返回查询的转化追踪列表 |
| `totalCount` | Integer | 总条数 |

### FcTransTraceType（转化追踪详情）

| 字段 | 类型 | 说明 |
|------|------|------|
| `transId` | Long | 转化追踪ID |
| `transName` | String | 转化追踪名称 |
| `transType` | Integer[] | 转化类型 |
| `transMode` | Integer | 接入方式 |
| `transStatus` | Integer | 转化追踪状态 |
| `monitorUrl` | String | 监测地址（transMode=8 时生效） |
| `downloadUrl` | String | 下载地址（transMode=8 且 appAction=2 时生效） |
| `campaignIds` | Long[] | 转化追踪绑定的计划ID（transMode=8/11 时生效） |
| `appType` | Integer | 应用类型 |
| `targetPackages` | String[] | 使用该转化追踪的投放包名称 |
| `sdkId` | Long | 应用SDK的sdkId |
| `traceTarget` | Integer | 追踪目标 |
| `addTime` | Date | 添加时间 |
| `appAction` | Integer | 应用调起类型（transMode=8/11 时生效） |

### transType（转化类型）枚举值

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
| 20 | 深度页面访问 |
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
| 49 | 注册激活后登录 |
| 50 | 预约 |
| 51 | 有意向客户 |
| 52 | 深度使用 |
| 57 | 调起点击 |
| 61 | 二次跳转 |
| 67 | 微信调起按钮点击 |
| 68 | 粉丝关注成功 |
| 71 | 应用调起 |
| 72 | 聊到相关业务 |
| 79 | 微信加粉成功 |
| 89 | 放款 |
| 99 | 其他 |

### appType（应用类型）枚举值

| 值 | 说明 |
|---|---|
| 0 | iOS和Android |
| 1 | 仅iOS |
| 2 | 仅Android |

### appAction（应用调起类型）枚举值

| 值 | 说明 |
|---|---|
| 1 | 应用调起 |
| 2 | 应用下载 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=0` 但筛选条件似乎没生效 | 实测：空 body 与拼错字段名都返回 status=0，参数校验宽松 | 核对字段名拼写，并检查返回条数是否符合预期 |
| `status=0` 但 `rows=0` | 该条件下没有转化追踪配置 | 先用空条件确认 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> 本表错误码为 **2026-09-18 对该账号受控故障注入的实测结果**（空 body / 错字段名 / 不存在的 ID），非推断。

## 调用示例

```bash
node scripts/api.ts --payload='{\"action\":\"fc-transtrace-list-get\",\"userName\":\"子账号用户名\",\"body\":{\"transName\":\"转化追踪名称\",\"traceTargetList\":[1,2,3],\"transModeList\":[4,6,7,8,9,10,11,23,24],\"transStatusList\":[0,1,2,3],\"limit\":[0,100]}}'
```
