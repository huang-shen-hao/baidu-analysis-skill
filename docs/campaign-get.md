# 查询推广计划

## Trigger

用户要求查询推广计划、计划列表、计划预算、计划状态、计划地域、计划时段、计划出价或转化目标时使用。

## Action

`campaign-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/CampaignService/getCampaign`
- 方法说明：根据推广计划 ID 批量查询推广计划。

## Payload

```json
{
  "action": "campaign-get",
  "userName": "子账号用户名",
  "body": {
    "campaignFields": [
      "campaignId",
      "campaignName"
    ],
    "campaignIds": [],
    "adType": 0
  }
}
```

## 行为说明

- 实测 `campaignIds` 不传或传空数组时，会返回当前子账号下全部计划。
- `adType=0` 表示搜索推广普通计划。
- 如果指定 ID 返回 `90111 / Campaign id not exist`，先用空 `campaignIds` 拉取当前账号计划列表后核对。

## 输入字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `campaignFields` | String[] | 需要查询的计划属性（必填） | 取值范围见下方字段枚举 |
| `campaignIds` | Long[] | 查询推广计划 ID 集合 | 长度限制：[0, 100]；输入空返回整个账户的计划 |
| `adType` | Integer | 投放广告类型 | 0-普通计划 / 14-商品计划；不传默认返回全部 |

### campaignFields 可选枚举

| 字段 | 说明 |
|------|------|
| `campaignId` | 计划ID |
| `campaignName` | 计划名称 |
| `budget` | 计划每日预算 |
| `budgetOfflineTime` | 预算下线时间 |
| `exactNegativeWords` | 精确否定关键词列表 |
| `regionTarget` | 计划推广地域 |
| `negativeWords` | 短语否定关键词列表 |
| `pause` | 暂停状态 |
| `schedule` | 计划推广暂停时段 |
| `status` | 计划状态 |
| `marketingTargetId` | 营销目标类型 |
| `adType` | 计划类型 |
| `businessPointId` | 推广业务ID |
| `businessPointName` | 推广业务字面 |
| `smartRegion` | 商品计划: 智能地域开关 |
| `paDevice` | 商品计划: 计划的投放设备 |
| `os` | 商品计划: 计划投放设备平台 |
| `regionPriceFactor` | 分地域出价系数 |
| `schedulePriceFactors` | 分时段出价系数 |
| `shopType` | 电商店铺类型 |
| `createTime` | 添加时间 |
| `equipmentType` | 推广设备 |
| `campaignBidType` | 计划出价方式 |
| `campaignBid` | 计划点击出价 |
| `campaignOcpcBidType` | 计划出价模式 |
| `campaignOcpcBid` | 转化计划出价 |
| `campaignCvSources` | 数据来源 |
| `campaignTransTypes` | 计划目标转化 |
| `campaignDeepTransTypes` | 计划深度转化 |
| `transAsset` | 转化资产类型 |
| `transAssetId` | 转化资产ID |
| `geoLocationStatus` | 推广地域地理位置选项 |

## 返回字段

返回对象为 `CampaignType`。

| 字段 | 类型 | 说明 | 限制 / 枚举 |
|------|------|------|------|
| `campaignId` | Long | 计划ID | - |
| `campaignName` | String | 计划名称 | 最大 30 字节，中文按 2 字节计算，英文和数字按 1 字节计算 |
| `budget` | Double | 计划每日预算 | `[50, Min(10000000, 账户预算)]`；`null` 表示不限定预算 |
| `regionTarget` | Integer[] | 计划推广地域 | `null` 表示不限定推广地域，使用账户推广地域；地域值见地域代码 |
| `negativeWords` | String[] | 短语否定关键词列表 | `[]` 表示不设置；上限按 `userLevel`：未生效客户(4) 200 / 一星(3) 200 / 二星(2) 400 / 三星(1) 500；商品计划不支持 |
| `exactNegativeWords` | String[] | 精确否定关键词列表 | `[]` 表示不设置；上限按 `userLevel`：未生效客户(4) 200 / 一星(3) 400 / 二星(2) 700 / 三星(1) 900；商品计划不支持 |
| `schedule` | ScheduleType[] | 计划推广暂停时段 | 默认不设置，表示无暂停时段限制；每天最多 12 个，每周最多 84 个 |
| `budgetOfflineTime` | OfflineTimeType[] | 预算下线时间 | 最近有过下线时段的 7 个自然日的下线和上线时段；超过 30 天不返回；`null` 表示无预算下线时段 |
| `pause` | Boolean | 暂停状态 | `true` 暂停 / `false` 启用；默认 `false` |
| `status` | Integer | 计划状态 | 21-有效 / 22-处于暂停时段 / 23-暂停推广 / 24-计划预算不足 / 25-账户预算不足 |
| `adType` | Integer | 计划类型 | 默认 0；0-普通计划 / 14-商品计划 |
| `businessPointId` | Long | 推广业务ID | 通过查询推广业务方法获取 |
| `businessPointName` | String | 推广业务字面 | 通过查询推广业务方法获取 |
| `smartRegion` | Boolean | 商品计划: 智能地域开关 | 默认 `false`；`true` 开启 / `false` 关闭 |
| `paDevice` | Integer | 商品计划: 计划投放设备 | 默认 0；0-全部 / 1-移动 / 2-计算机；商品目录新建计划需与 `equipmentType` 保持一致，商品目录更新计划不支持修改 |
| `os` | String[] | 商品计划: 计划投放设备平台 | 默认全选；`IPHONE` 苹果手机 / `ANDROID` 安卓手机 / `OTHERS` 其他 |
| `regionPriceFactor` | RegionPriceFactor[] | 分地域出价系数 | 选填，默认账户投放地域，出价系数为 1 |
| `schedulePriceFactors` | SchedulePriceFactor[] | 分时段出价系数 | 选填，默认全时段投放，出价系数为 1；未设置的小时不投放 |
| `marketingTargetId` | Integer | 营销目标类型 | 0-网站链接 / 1-应用推广 / 2-本地推广 / 4-电商店铺推广 / 5-商品目录 |
| `shopType` | Integer | 电商店铺类型 | 1-度小店 / 3-第三方店铺 / 31-淘宝(含天猫) / 32-京东 / 33-拼多多 / 34-苏宁；营销目标为电商店铺推广时必填，其他营销目标不支持 |
| `equipmentType` | Integer | 推广设备 | 默认 3；1-计算机 / 2-移动 / 3-不限；取值受 `marketingTargetId` 和 `shopType` 约束 |
| `campaignBidType` | Integer | 计划出价方式 | 默认 0；0-点击 / 1-转化；该字段不支持修改 |
| `campaignBid` | Double | 计划点击出价 | `[0.01, 999.99]` 元/点击；不填写会使用单元出价；`campaignBidType=0` 时选填，`campaignBidType=1` 时不支持 |
| `campaignOcpcBidType` | Integer | 计划出价模式 | 0-cpc / 1-目标转化成本 / 2-增强模式 / 3-放量模式；`campaignBidType=0` 默认 0，修改仅支持 0/2；`campaignBidType=1` 默认 1，修改仅支持 1/3 |
| `campaignOcpcBid` | Double | 转化计划出价 | `[0.1, 9999]` 元/转化；`campaignOcpcBidType=1` 时必填，否则禁止填写 |
| `campaignTransTypes` | Integer[] | 计划目标转化 | `campaignBidType=1` 时必填；`campaignOcpcBidType=2` 时选填，其他情况禁止填写；长度 `[1,5]`，目标转化+深度转化数量之和 <= 5；只能选择转化追踪工具中已添加的目标转化 |
| `campaignDeepTransTypes` | Integer[] | 计划深度转化 | `campaignOcpcBidType=0` 禁止填写；需为转化追踪下同一类型目标转化；长度 `[1,5]`，目标转化+深度转化数量之和 <= 5 |
| `campaignCvSources` | Integer[] | 数据来源 | 非必填，默认不限；增强模式、目标转化成本、放量模式下可选，会按可用联调数据过滤 |
| `transAsset` | Integer | 转化资产类型 | 0-不限 / 2-指定资产 |
| `transAssetId` | Long | 转化资产ID | `transAsset=2` 时必填 |
| `geoLocationStatus` | Integer | 推广地域地理位置选项 | 0-该地区内或搜索意图在该地区的所有用户 / 1-该地区内的所有用户 |
| `storePageInfos` | StorePageInfoType[] | 本地计划设置的门店落地页信息 | 本地推广相关 |

### ScheduleType（暂停时段）

| 字段 | 类型 | 说明 | 限制 / 枚举 |
|------|------|------|------|
| `startHour` | Long | 开始时间 | 小时，取值 `[0,23]` |
| `endHour` | Long | 结束时间 | 小时，取值 `[1,24]` |
| `weekDay` | Long | 星期几 | 1-星期一 / 2-星期二 / 3-星期三 / 4-星期四 / 5-星期五 / 6-星期六 / 7-星期日 |

### OfflineTimeType（预算下线时间）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `time` | Date | 下线/上线时间点 | - |
| `flag` | Integer | 下线/上线状态 | 1-上线 / 0-下线 |

### RegionPriceFactor（分地域出价系数）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `regionId` | Integer | 地域ID | 可选地域ID见地域编码 |
| `priceFactor` | Double | 出价系数 | 取值范围：[0.1, 1.0] |

### SchedulePriceFactor（分时段出价系数）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `timeId` | Integer | 时间段编号 | 3 位整数；第一位为星期几 1-7，第二三位为小时 00-23。例如周一 0-1 点为 100，周六 22-23 点为 622 |
| `priceFactor` | Double | 出价系数 | 取值范围：[0.1, 10.0] |

### StorePageInfoType（门店落地页信息）

| 字段 | 类型 | 说明 |
|------|------|------|
| `storeId` | Long | 门店ID |
| `pageId` | Long | 落地页ID |
| `url` | String | 落地页URL |
| `pageType` | Integer | 落地页类型：0-梧桐 / 1-H5+小程序 / 2-医美 / 3-旺铺 |
| `monitorCode` | String | 监控代码 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=2 code=9011519` `Request field is invalid` | 空 body，或字段名拼错 | 对照本文「输入字段」核对字段名；`campaignFields` / `campaignIds` / `adType` 必须为接口支持的字段 |
| `status=2 code=90111` `Campaign id not exist` | 计划 ID 不属于当前账号 | 用空 `campaignIds` 拉一次当前账号的计划列表后核对 ID |
| `status=0` 但 `rows=0` | 过滤条件在当前账号下没有数据 | 先用空条件确认账号下有无计划 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> 本表错误码为 **2026-09-18 对该账号受控故障注入的实测结果**（空 body / 错字段名 / 不存在的 ID），非推断。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"campaign-get","userName":"子账号用户名","body":{"campaignFields":["campaignId","campaignName"],"campaignIds":[],"adType":0}}'
```

## Postman

可导入集合：`docs/postman/campaign-get.postman_collection.json`
