# 更新推广单元

## Trigger

用户要求修改单元名称、出价、暂停状态、否词、网址、应用商店直投、自动配图、自动文案优化或自动定向时使用。

## Action

`adgroup-update`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AdgroupService/updateAdgroup`
- 方法说明：根据指定的单元 ID 更新推广单元的属性。

## Payload

```json
{
  "action": "adgroup-update",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "adgroupTypes": [
      {
        "adgroupId": 5780936386,
        "maxPrice": 6.6,
        "pause": true
      }
    ]
  }
}
```

## 安全要求

- 该接口会修改真实投放对象。
- 执行前必须确认账号、单元 ID、需要修改的字段、旧值和新值、影响范围和回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

`adgroupTypes` 必填 `AdgroupType[]`，集合长度限制：[1, 5000]。

### AdgroupType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `adgroupId` | Long | 是 | 推广单元ID | - |
| `adgroupName` | String | - | 单元名称 | 最大 30 字节（中文 2 字节，英文/数字 1 字节） |
| `maxPrice` | Double | - | 单元出价 | (0, 999.99] 且 ≤ 所属计划预算 |
| `pause` | Boolean | - | 暂停状态 | true-暂停 / false-启用 |
| `negativeWords` | String[] | - | 短语否定关键词列表 | 单个最长 40 字节（中文 2 字节，英文/数字 1 字节）；最多 200 个 |
| `exactNegativeWords` | String[] | - | 精确否定关键词列表 | 单个最长 40 字节（中文 2 字节，英文/数字 1 字节）；最多 200 个 |
| `appShopDirectStatus` | Integer | - | 应用商店直投 | 仅支持应用推广营销目标；0-关闭（默认） / 1-开启 |
| `segmentRecommendStatus` | Integer | - | 自动配图开关 | 默认 0；0-开启 / 1-关闭 |
| `creativeTextOptimizationStatus` | Boolean | - | 自动文案优化 | 默认 true；true-开启 / false-关闭 |
| `productSetId` | Long | - | 虚拟商品组ID | 计划类型为商品计划时必填；使用 DpaProductSetService 创建 |
| `paPrice` | Double | - | 推广单元商品出价 | 计划类型为商品计划时必填，优先级高于 maxPrice；(0, 999.99] |
| `monitorUrl` | String | - | 单元层级监控URL | 仅计划类型为商品计划时支持 |
| `pcFinalUrl` | String | - | 计算机最终访问网址 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `pcTrackParam` | String | - | 计算机监控后缀 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `pcTrackTemplate` | String | - | 计算机第三方追踪模板 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileFinalUrl` | String | - | 移动最终访问网址 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileTrackParam` | String | - | 移动监控后缀 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileTrackTemplate` | String | - | 移动第三方追踪模板 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `adgroupAutoTargetingStatus` | Boolean | - | 自动定向 | 默认 true；true-开启 / false-关闭 |

### pause 枚举值

| 值 | 说明 |
|---|---|
| true | 暂停 |
| false | 启用 |

### appShopDirectStatus 枚举值

| 值 | 说明 |
|---|---|
| 0 | 关闭（默认） |
| 1 | 开启 |

### segmentRecommendStatus 枚举值

| 值 | 说明 |
|---|---|
| 0 | 开启（默认） |
| 1 | 关闭 |

### creativeTextOptimizationStatus 枚举值

| 值 | 说明 |
|---|---|
| true | 开启（默认） |
| false | 关闭 |

### adgroupAutoTargetingStatus 枚举值

| 值 | 说明 |
|---|---|
| true | 开启（默认） |
| false | 关闭 |

### 与 adgroup-add 的差异

- `adgroupId` 必填，`campaignId` 不需要传。
- 不支持 `adType`（广告类型）和 `adgroupAppBinds`（App绑定信息）的修改。

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `adgroupId` | Long | 推广单元ID |
| `campaignId` | Long | 推广计划ID |
| `adgroupName` | String | 单元名称 |
| `maxPrice` | Double | 单元出价 |
| `pause` | Boolean | 推广单元启用/暂停 |
| `appShopDirectStatus` | Integer | 应用商店直投 |
| `negativeWords` | String[] | 单元短语否定关键词 |
| `exactNegativeWords` | String[] | 单元精确否定关键词 |
| `segmentRecommendStatus` | Integer | 自动配图开关 |
| `creativeTextOptimizationStatus` | Boolean | 自动文案优化 |
| `productSetId` | Long | 虚拟商品组ID |
| `paPrice` | Double | 推广单元商品出价 |
| `monitorUrl` | String | 单元层级监控URL |
| `pcFinalUrl` | String | 计算机最终访问网址（仅适用于网站链接、电商店铺推广、应用推广） |
| `pcTrackParam` | String | 计算机监控后缀（仅适用于网站链接、电商店铺推广、应用推广） |
| `pcTrackTemplate` | String | 计算机第三方追踪模板（仅适用于网站链接、电商店铺推广、应用推广） |
| `mobileFinalUrl` | String | 移动最终访问网址（仅适用于网站链接、电商店铺推广、应用推广） |
| `mobileTrackParam` | String | 移动监控后缀（仅适用于网站链接、电商店铺推广、应用推广） |
| `mobileTrackTemplate` | String | 移动第三方追踪模板（仅适用于网站链接、电商店铺推广、应用推广） |
| `adgroupAutoTargetingStatus` | Boolean | 自动定向 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `adgroup-update requires body.adgroupTypes` | 漏传必填字段 adgroupTypes | 按本文「输入字段」补齐 body.adgroupTypes |
| `adgroup-update: adgroupTypes max 5000 per request` | 单次提交数量超过上限 5000 | 分批提交，每批 ≤ 5000 |
| `adgroup-update: each adgroupType requires adgroupId` | 集合元素 adgroupType 缺少必填字段 adgroupId | 为每个 adgroupType 元素补齐 adgroupId |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |
| `status=2 code=90122` | 没有操作单元的权限 | 确认目标账户的单元操作权限 |
| `status=2 code=901431` | 没有权限暂停/启用推广单元 | 账户未开放单元启停权限 |
| `status=2 code=9012` | 没有操作该用户的权限 | 换有操作权限的子账号，或申请账户权限 |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"adgroup-update","confirmWrite":true,"userName":"子账号用户名","body":{"adgroupTypes":[{"adgroupId":5780936386,"maxPrice":6.6,"pause":true}]}}'
```
