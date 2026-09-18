# 查询推广账户信息

## Trigger

用户要求查询账户余额、账户预算、账户状态、推广地域、开放域名、账户基础信息时使用。

## Action

`account-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AccountService/getAccountInfo`
- 方法说明：查询指定推广账户基础信息、余额、预算、地域、排除 IP、开放域名等账户级信息。

## Payload

```json
{
  "action": "account-get",
  "userName": "子账号用户名",
  "body": {
    "accountFields": [
      "userId",
      "balance"
    ]
  }
}
```

## 字段

`accountFields` 必填 `String[]`，指定需要返回的属性。

| 字段 | 说明 |
|------|------|
| `userId` | 账户ID |
| `balance` | 账户余额 |
| `pcBalance` | 框架-基准资金包余额 |
| `budget` | 账户预算 |
| `budgetType` | 预算类型 |
| `budgetOfflineTime` | 到达预算下线时段 |
| `cost` | 账户累积消费 |
| `excludeIp` | IP排除列表 |
| `openDomains` | 账户开放域名列表 |
| `payment` | 账户投资总额 |
| `regDomain` | 账户注册域名 |
| `regionTarget` | 推广地域列表 |
| `userStat` | 用户状态 |
| `userLevel` | 客户权益-账户等级 |
| `regionPriceFactor` | 分地域出价系数 |
| `geoLocationStatus` | 推广地域地理位置选项 |
| `excludeQueryRegionStatus` | 搜索意图地域词排除 |
| `longMonitorSublink` | 创意组件-文字链监控代码 |
| `accountMonitorUrl` | 账号-通用点击监测地址 |
| `cid` | 账号主体ID |
| `liceName` | 账号主体名称 |

## 返回字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `userId` | Long | 账户ID | - |
| `balance` | Double | 账户余额，对应财务平台"推广共享资金"字段 | - |
| `pcBalance` | Double | 框架-基准资金包余额（部分直销框架客户的账户可用余额为 pcBalance + balance） | - |
| `cost` | Double | 账户累积消费（历史字段，不建议参考，以数据报告为准） | - |
| `payment` | Double | 账户投资总额（历史字段，不建议参考，以数据报告为准） | - |
| `budget` | Double | 账户预算 | 默认值：0；日预算取值范围：[50, 10000000] |
| `budgetType` | Integer | 预算类型 | 0-不设置预算 / 1-日预算；与 budget 配合使用，修改预算时必填 |
| `budgetOfflineTime` | OfflineTimeType[] | 到达预算下线时段 | 最近有过下线时段的 7 个自然日的下线和上线时段（超过 30 天的不返回）；null 表示无下线时段 |
| `budgetOfflineTime.time` | Date | 下线/上线时间点 | 格式示例：`Jul 10, 2015 11:00:00 AM` |
| `budgetOfflineTime.flag` | Integer | 下线/上线状态 | 1-上线 / 0-下线 |
| `regionTarget` | Integer[] | 推广地域列表 | 可选地域名称见地域编码 |
| `excludeIp` | String[] | IP排除列表 | 支持 IPv4 和 IPv6，例：`2001:0DB8:0000:0023:0008:0800:200C:417A` |
| `openDomains` | String[] | 账户开放域名列表（在已有注册域名基础上，添加可推广的域名，物料URL需和注册域名及开放域名的主域一致即可） | 只读，不支持更新 |
| `regDomain` | String | 账户注册域名 | - |
| `userStat` | Integer | 用户状态 | 1-开户金未到 / 2-正常生效 / 3-余额为零 / 4-未通过审核 / 6-审核中 / 7-被禁用 / 11-预算不足 |
| `userLevel` | Integer | 客户权益-账户等级 | 1-三星客户 / 2-二星客户 / 3-一星客户 / 4-未生效客户 |
| `regionPriceFactor` | RegionPriceFactor[] | 分地域出价系数 | - |
| `regionPriceFactor.regionId` | Integer | 地域ID | 可选地域ID见地域编码 |
| `regionPriceFactor.priceFactor` | Double | 出价系数 | 取值范围：[0.1, 10.0] |
| `cid` | Long | 账户主体ID | - |
| `liceName` | String | 账户主体名称 | - |
| `geoLocationStatus` | Integer | 推广地域地理位置选项 | 0-该地区内或搜索意图在该地区的所有用户 / 1-仅该地区内的所有用户（原账户层级"搜索意图地域词扩展"已升级为计划地域设置） |
| `excludeQueryRegionStatus` | Boolean | 搜索意图地域词排除 | true-启用 / false-关闭 |
| `longMonitorSublink` | String | 创意组件-文字链监控代码 | 默认值：`product=xinxizhenlie_longsublink`；可自定义，字符限制 255 |
| `accountMonitorUrl` | String | 通用点击监测地址 | 长度限制 1024 |

## 注意事项

- `header.userName` 应使用具体推广子账号用户名，不建议使用 MCC/账户管家用户名。
- 账户管家账号本身调用可能返回 `89501 / You are not authorized to access this method.`。

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
node scripts/api.ts --payload='{"action":"account-get","userName":"子账号用户名","body":{"accountFields":["userId","balance","budget"]}}'
```
