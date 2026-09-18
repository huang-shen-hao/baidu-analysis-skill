# 更新推广账户信息

## Trigger

用户明确要求更新账户信息、修改账户预算、修改账户推广地域、排除 IP、账户预算类型、分地域出价系数、地域意图设置、搜索意图地域词排除、账户监控链接或文字链监控代码时使用。

## Action

`account-update`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AccountService/updateAccountInfo`
- 方法说明：更新 `userName` 对应的账户信息；如果是来自 MCC Token 的请求，则更新 `target` 对应的账户信息。

## Payload

```json
{
  "action": "account-update",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "accountInfo": {
      "budget": 0.0,
      "regionTarget": [
        1
      ],
      "excludeIp": [
        "example string"
      ],
      "budgetType": 0,
      "regionPriceFactor": [
        {
          "regionId": 1,
          "priceFactor": 10.0
        }
      ],
      "geoLocationStatus": 0,
      "excludeQueryRegionStatus": true,
      "longMonitorSublink": "example string",
      "accountMonitorUrl": "example string"
    }
  }
}
```

## 输入字段

`accountInfo` 必填 `AccountType`，更新账户信息。

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `budget` | Double | 账户预算 | 默认值：0；日预算取值范围：[50, 10000000] |
| `budgetType` | Integer | 预算类型 | 0-不设置预算 / 1-日预算；与 budget 配合使用，修改预算时必填 |
| `regionTarget` | Integer[] | 推广地域列表 | 可选地域名称见地域编码 |
| `excludeIp` | String[] | IP排除列表 | 支持 IPv4 和 IPv6，例：`2001:0DB8:0000:0023:0008:0800:200C:417A` |
| `regionPriceFactor` | RegionPriceFactor[] | 分地域出价系数 | - |
| `regionPriceFactor.regionId` | Integer | 地域ID | 可选地域ID见地域编码 |
| `regionPriceFactor.priceFactor` | Double | 出价系数 | 取值范围：[0.1, 10.0] |
| `geoLocationStatus` | Integer | 推广地域地理位置选项 | 0-该地区内或搜索意图在该地区的所有用户 / 1-仅该地区内的所有用户（原账户层级"搜索意图地域词扩展"已升级为计划地域设置） |
| `excludeQueryRegionStatus` | Boolean | 搜索意图地域词排除 | true-启用 / false-关闭 |
| `longMonitorSublink` | String | 创意组件-文字链监控代码 | 默认值：`product=xinxizhenlie_longsublink`；可自定义，字符限制 255 |
| `accountMonitorUrl` | String | 通用点击监测地址 | 长度限制 1024 |

### OfflineTimeType（输入子类型）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `time` | Date | 下线/上线时间点 | - |
| `flag` | Integer | 下线/上线状态 | 1-上线 / 0-下线 |

## 返回字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `budget` | Double | 账户预算 | 默认值：0；日预算取值范围：[50, 10000000] |
| `budgetType` | Integer | 预算类型 | 0-不设置预算 / 1-日预算；与 budget 配合使用，修改预算时必填 |
| `regionTarget` | Integer[] | 推广地域列表 | 可选地域名称见地域编码 |
| `excludeIp` | String[] | IP排除列表 | 支持 IPv4 和 IPv6，例：`2001:0DB8:0000:0023:0008:0800:200C:417A` |
| `regionPriceFactor` | RegionPriceFactor[] | 分地域出价系数 | - |
| `regionPriceFactor.regionId` | Integer | 地域ID | 可选地域ID见地域编码 |
| `regionPriceFactor.priceFactor` | Double | 出价系数 | 取值范围：[0.1, 10.0] |
| `geoLocationStatus` | Integer | 推广地域地理位置选项 | 0-该地区内或搜索意图在该地区的所有用户 / 1-仅该地区内的所有用户 |
| `excludeQueryRegionStatus` | Boolean | 搜索意图地域词排除 | true-启用 / false-关闭 |
| `longMonitorSublink` | String | 创意组件-文字链监控代码 | 默认值：`product=xinxizhenlie_longsublink`；字符限制 255 |
| `accountMonitorUrl` | String | 通用点击监测地址 | 长度限制 1024 |

### OfflineTimeType（返回子类型）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `time` | Date | 下线/上线时间点 | - |
| `flag` | Integer | 下线/上线状态 | 1-上线 / 0-下线 |

## 安全要求

- 该接口会修改真实推广账户配置。
- 执行前必须确认账号、字段旧值、新值、影响范围和回滚方案。
- 来自 MCC Token 的请求如涉及 `target`，必须确认 `target` 对应的具体账户，避免误改其他账户。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `account-update contains unsupported accountInfo fields: <字段>` | 传了接口不支持的 accountInfo 字段 | 只传本文「输入字段」列出的字段 |
| `account-update requires body.accountInfo` | 漏传必填字段 accountInfo | 按本文「输入字段」补齐 body.accountInfo |
| `account-update: budget must be in [50, 10000000]` | 取值超出允许范围 | 取值范围 50, 10000000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"account-update","confirmWrite":true,"userName":"子账号用户名","body":{"accountInfo":{"budget":0,"budgetType":0}}}'
```
