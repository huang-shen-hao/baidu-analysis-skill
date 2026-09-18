# 查询推广单元

## Trigger

用户要求查询推广单元、单元列表、单元出价、单元状态、单元否词、单元网址或单元名称时使用。

## Action

`adgroup-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AdgroupService/getAdgroup`
- 方法说明：根据推广计划 ID 或单元 ID 批量查询推广单元。

## Payload

```json
{
  "action": "adgroup-get",
  "userName": "子账号用户名",
  "body": {
    "ids": [149248725],
    "idType": 3,
    "adgroupFields": [
      "adgroupId",
      "campaignId",
      "adgroupName",
      "pause",
      "maxPrice",
      "status",
      "pcFinalUrl",
      "pcTrackParam"
    ],
    "getTemp": 0
  }
}
```

## 行为说明

- `idType=3` 时，`ids` 为计划 ID，可查询该计划下所有单元（不超过 100 个计划 ID）。
- `idType=5` 时，`ids` 为单元 ID，直接查询单元（不超过 5000 个单元 ID）。
- `getTemp` 默认为 0（查询单元本身）。设为 1 可查询单元影子。想要获得单元全集，需分别以 `getTemp=0` 和 `getTemp=1` 调用两次。
- 影子说明：单元 A 审核通过后，若修改影响审核状态的字段（pcFinalUrl、pcTrackParam、pcTrackTemplate、mobileFinalUrl、mobileTrackParam、mobileTrackTemplate），修改后的单元为 A'（影子），A' 审核通过生效前线上仍为 A。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `ids` | Long[] | 是 | 查询 ID 集合 | idType=5 时为单元 ID，不超过 5000 个；idType=3 时为计划 ID，不超过 100 个 |
| `idType` | Integer | 是 | 查询层级 | 3-计划ID / 5-单元ID |
| `adgroupFields` | String[] | 是 | 需要查询的单元属性 | 取值范围见下方字段枚举 |
| `getTemp` | Integer | - | 是否查询单元影子 | 默认 0；0-查询单元本身 / 1-查询单元影子 |

### adgroupFields 可选枚举

| 字段 | 说明 |
|------|------|
| `adgroupId` | 推广单元ID |
| `campaignId` | 推广计划ID |
| `adgroupName` | 单元名称（最大30字节） |
| `pause` | 推广单元启用/暂停 |
| `appShopDirectStatus` | 应用商店直投 |
| `maxPrice` | 单元出价 |
| `negativeWords` | 单元短语否定关键词（单个最长40字节，最多200个） |
| `exactNegativeWords` | 单元精确否定关键词（单个最长40字节，最多200个） |
| `status` | 单元状态 |
| `segmentRecommendStatus` | 自动配图开关 |
| `creativeTextOptimizationStatus` | 自动文案优化 |
| `offlineReasons` | 下线理由 |
| `paPrice` | 推广单元商品出价 |
| `adType` | 广告类型 | 0-普通单元 / 14-商品单元 |
| `monitorUrl` | 单元层级监控 |
| `pcFinalUrl` | 计算机最终访问网址 |
| `pcTrackParam` | 计算机监控后缀 |
| `pcTrackTemplate` | 计算机第三方追踪模板 |
| `mobileFinalUrl` | 移动最终访问网址 |
| `mobileTrackParam` | 移动监控后缀 |
| `mobileTrackTemplate` | 移动第三方追踪模板url |
| `productSetId` | 虚拟商品组ID |
| `createTime` | 添加时间 |
| `adgroupAutoTargetingStatus` | 自动定向 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `adgroupId` | Long | 推广单元ID |
| `campaignId` | Long | 推广计划ID |
| `adgroupName` | String | 单元名称 |
| `maxPrice` | Double | 单元出价 |
| `pause` | Boolean | 推广单元启用/暂停 |
| `negativeWords` | String[] | 单元短语否定关键词 |
| `exactNegativeWords` | String[] | 单元精确否定关键词 |
| `status` | Integer | 单元状态 |
| `appShopDirectStatus` | Integer | 应用商店直投 |
| `adType` | Integer | 广告类型 |
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

### status 枚举值

| 值 | 说明 |
|---|---|
| 31 | 有效 |
| 32 | 暂停推广 |
| 33 | 推广计划暂停推广 |
| 43 | 未审核 |

### pause 枚举值

| 值 | 说明 |
|---|---|
| true | 暂停 |
| false | 启用 |

### adType 枚举值

| 值 | 说明 |
|---|---|
| 0 | 普通单元 |
| 14 | 商品单元 |

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

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=2 code=901897` `Id is null;` | 未传 `ids` + `idType`（空 body 即触发） | 必须传 `ids` 与 `idType`（3 计划 / 5 单元 / 24 物料） |
| `status=2 code=90111` `Campaign id not exist` | `ids` 里的计划 ID 不属于当前账号 | 先用 `campaign-get` 核对计划 ID |
| `status=2 code=9011519` `Request field is invalid` | 字段名拼错（实测：改名后的字段导致的仍是 Id is null） | 对照本文「输入字段」核对字段名 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> 本表错误码为 **2026-09-18 对该账号受控故障注入的实测结果**（空 body / 错字段名 / 不存在的 ID），非推断。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"adgroup-get","userName":"子账号用户名","body":{"ids":[149248725],"idType":3,"adgroupFields":["adgroupId","campaignId","adgroupName","pause","maxPrice","status","pcFinalUrl","pcTrackParam"],"getTemp":0}}'
```
