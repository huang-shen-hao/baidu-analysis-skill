# 更新推广计划

## Trigger

用户要求修改计划名称、预算、地域、投放时段、暂停状态、出价、否词或转化目标时使用。

## Action

`campaign-update`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/CampaignService/updateCampaign`
- 方法说明：根据指定的计划 ID 更新推广计划的属性。

## Payload

```json
{
  "action": "campaign-update",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "campaignTypes": [
      {
        "campaignId": 87654321,
        "budget": 100,
        "pause": false
      }
    ]
  }
}
```

## 输入字段

`campaignTypes` 必填 `CampaignType[]`，集合长度限制：[1, 100]。

### CampaignType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `campaignId` | Long | 是 | 计划ID | - |
| `campaignName` | String | - | 计划名称 | 最大 30 字节（中文 2 字节，英文/数字 1 字节） |
| `budget` | Double | - | 计划每日预算 | [50, Min(10000000, 账户预算)]；null 表示不限定 |
| `regionTarget` | Integer[] | - | 计划推广地域 | null 使用账户推广地域；可选地域见地域编码 |
| `negativeWords` | String[] | - | 短语否定关键词列表 | 空数组表示不设置；上限按用户等级：未生效(4):200 / 一星(3):200 / 二星(2):400 / 三星(1):500；商品计划不支持 |
| `exactNegativeWords` | String[] | - | 精确否定关键词列表 | 空数组表示不设置；上限按用户等级：未生效(4):200 / 一星(3):400 / 二星(2):700 / 三星(1):900；商品计划不支持 |
| `schedule` | ScheduleType[] | - | 计划推广暂停时段 | 默认无限制；每天最多 12 个，每周最多 84 个；**空数组表示清空原有暂停时段** |
| `pause` | Boolean | - | 暂停状态 | true-暂停 / false-启用 |
| `businessPointId` | Long | - | 推广业务ID | - |
| `regionPriceFactor` | RegionPriceFactor[] | - | 分地域出价系数 | 默认账户投放地域，系数为 1 |
| `schedulePriceFactors` | SchedulePriceFactor[] | - | 分时段出价系数 | 默认全时段，系数为 1 |
| `shopType` | Integer | - | 电商店铺类型 | 1-度小店 / 3-第三方店铺 / 31-淘宝(含天猫) / 32-京东 / 33-拼多多 / 34-苏宁；营销目标为电商店铺推广时必填 |
| `equipmentType` | Integer | - | 推广设备 | 1-计算机 / 2-移动 / 3-不限；**商品目录更新计划不支持修改** |
| `campaignBid` | Double | - | 计划点击出价 | [0.01, 999.99] 元/点击；campaignBidType=0 时选填，=1 时不支持 |
| `campaignOcpcBidType` | Integer | - | 计划出价模式 | 0-cpc / 1-目标转化成本 / 2-增强模式 / 3-放量模式；受 campaignBidType 约束 |
| `campaignOcpcBid` | Double | - | 转化计划出价 | [0.1, 9999] 元/转化；campaignOcpcBidType=1 时必填，否则禁止填写 |
| `campaignTransTypes` | Integer[] | - | 计划目标转化 | campaignBidType=1 时必填；数组 [1,5]，目标+深度转化之和 <= 5；枚举值见下方 |
| `campaignDeepTransTypes` | Integer[] | - | 计划深度转化 | campaignOcpcBidType=0 禁止填写；数组 [1,5]，目标+深度转化之和 <= 5；枚举值见下方 |
| `campaignCvSources` | Integer[] | - | 数据来源 | 默认不限(1000)；枚举值见下方 |
| `storePageInfos` | StorePageInfoType[] | - | 本地计划门店落地页信息 | 营销目标为本地推广时必填且不能为空 |
| `transAsset` | Integer | - | 转化资产类型 | 0-不限 / 2-指定资产 |
| `transAssetId` | Integer | - | 转化资产ID | transAsset=2 时必填 |
| `geoLocationStatus` | Integer | - | 推广地域地理位置选项 | 0-该地区内或搜索意图在该地区的所有用户（正在该地区、长期居住/工作在该地区、搜索词中表现出明确地区兴趣的用户）/ 1-该地区内的所有用户（正在该地区、长期居住/工作在该地区的用户） |

### status 枚举值（计划状态）

| 值 | 说明 |
|---|---|
| 21 | 有效 |
| 22 | 处于暂停时段 |
| 23 | 暂停推广 |
| 24 | 计划预算不足 |
| 25 | 账户预算不足 |

### adType 枚举值（计划类型）

| 值 | 说明 |
|---|---|
| 0 | 普通计划 |
| 14 | 商品计划 |

### 与 campaign-add 的差异

- `campaignId` 必填
- `campaignBidType` 不支持修改
- 商品目录更新计划不支持修改 `equipmentType` 与 `paDevice`
- `schedule` 设为空数组表示清空原有暂停时段

### equipmentType 与 marketingTargetId 约束关系

| marketingTargetId | 说明 | equipmentType 可选值 |
|---|---|---|
| 0 | 网站链接 | 1, 2, 3 |
| 1 | 应用推广 | 2, 3 |
| 2 | 本地推广 | 2, 3 |
| 4, shopType=1 | 电商店铺推广(度小店) | 2, 3 |
| 4, shopType=其他 | 电商店铺推广(第三方) | 1, 2, 3 |
| 5 | 商品目录 | 1, 2, 3 |

### campaignOcpcBidType 与 campaignBidType 约束关系

| campaignBidType | 新建默认值 | 修改可选值 |
|---|---|---|
| 0 (点击) | 0 (cpc) | 0, 2 |
| 1 (转化) | 1 (目标转化成本) | 1, 3 |

### campaignTransTypes 枚举值（计划目标转化）

| 值 | 说明 | 值 | 说明 |
|---|---|---|---|
| 1 | 咨询按钮点击 | 35 | 微信复制按钮点击 |
| 2 | 电话按钮点击 | 36 | 评价按钮点击 |
| 3 | 表单提交成功 | 40 | 关注按钮点击 |
| 4 | APP激活 | 41 | 申请小额贷款 |
| 5 | 表单按钮点击 | 42 | 授信 |
| 6 | 下载(预约)按钮点击 | 43 | 小程序线索 |
| 7 | 购买按钮点击 | 45 | 商品下单成功 |
| 9 | 电商订单 | 46 | 加入购物车 |
| 10 | 服务购买成功 | 49 | 登录 |
| 12 | 预约按钮点击 | 50 | 预约 |
| 13 | 表单有效请求 | 52 | 深度使用 |
| 14 | 订单提交成功 | 56 | 到店 |
| 15 | 加入购物车按钮点击 | 57 | 调起点击 |
| 16 | 表单调起按钮点击 | 67 | 微信调起按钮点击 |
| 17 | 三句话咨询 | 68 | 粉丝关注成功 |
| 18 | 留线索 | 71 | 应用调起(小流量) |
| 19 | 一句话咨询 | 72 | 聊到相关业务(小流量) |
| 20 | 关键页面浏览 | 73 | 回访-电话接通(小流量) |
| 25 | APP注册 | 74 | 回访-信息确认(小流量) |
| 26 | APP付费 | 75 | 回访-发现意向(小流量) |
| 27 | 客户自定义 | 76 | 回访-高潜成交(小流量) |
| 28 | 次日留存 | 77 | 回访-成单客户(小流量) |
| 30 | 电话拨通 | 78 | 店铺停留(小流量) |
| 89 | 放款 | 79 | 微信加粉成功 |
| 90 | 商品支付成功 | 92 | 有效咨询(小流量) |
| 99 | 其他 | | |

### campaignDeepTransTypes 枚举值（计划深度转化）

| 值 | 说明 | 值 | 说明 |
|---|---|---|---|
| 9 | 电商订单 | 42 | 授信 |
| 10 | 服务购买成功 | 49 | 登录 |
| 14 | 订单提交成功 | 50 | 预约 |
| 18 | 留线索 | 52 | 深度使用 |
| 25 | APP注册 | 56 | 到店 |
| 26 | APP付费 | 72 | 聊到相关业务(小流量) |
| 28 | 次日留存 | 73 | 回访-电话接通(小流量) |
| 30 | 电话拨通 | 74 | 回访-信息确认(小流量) |
| 89 | 放款 | 75 | 回访-发现意向(小流量) |
| 79 | 微信加粉成功 | 76 | 回访-高潜成交(小流量) |
| | | 77 | 回访-成单客户(小流量) |

### campaignCvSources 枚举值（数据来源）

| 值 | 说明 | 值 | 说明 |
|---|---|---|---|
| 1000 | 不限 | 7 | 百度智能小程序SDK |
| 1 | 网页JS布码 | 8 | 应用SDK |
| 2 | 线索API | 9 | 爱番番 |
| 3 | 咨询工具授权 | 10 | 百度APP |
| 4 | 基木鱼/度小店 | 23 | 百度统计网站导入 |
| 5 | 应用API | 24 | 百度统计小程序导入 |
| 6 | 电话数据授权 | | |

### 复合类型

**ScheduleType**（暂停时段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `startHour` | Long | 开始时间 |
| `endHour` | Long | 结束时间 |
| `weekDay` | Long | 星期几 |

**RegionPriceFactor**（分地域出价系数）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `regionId` | Integer | 地域ID | 可选地域ID见地域编码 |
| `priceFactor` | Double | 出价系数 | [0.1, 1.0] |

**SchedulePriceFactor**（分时段出价系数）

| 字段 | 类型 | 说明 |
|------|------|------|
| `timeId` | Integer | 时间段编号 |
| `priceFactor` | Double | 出价系数 |

**StorePageInfoType**（门店落地页信息）

| 字段 | 类型 | 说明 |
|------|------|------|
| `storeId` | Long | 门店ID |
| `pageId` | Long | 落地页ID |
| `url` | String | 落地页URL |
| `pageType` | Integer | 落地页类型：0-梧桐 / 1-H5+小程序 / 2-医美 / 3-旺铺 |
| `monitorCode` | String | 监控代码 |

**OfflineTimeType**（预算下线时间）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `time` | Date | 下线/上线时间点 | - |
| `flag` | Integer | 下线/上线状态 | 1-上线 / 0-下线 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `campaignId` | Long | 计划ID |
| `campaignName` | String | 计划名称 |
| `budget` | Double | 计划每日预算 |
| `regionTarget` | Integer[] | 计划推广地域 |
| `negativeWords` | String[] | 短语否定关键词列表 |
| `exactNegativeWords` | String[] | 精确否定关键词列表 |
| `schedule` | ScheduleType[] | 计划推广暂停时段 |
| `pause` | Boolean | 暂停状态 |
| `businessPointId` | Long | 推广业务ID |
| `regionPriceFactor` | RegionPriceFactor[] | 分地域出价系数 |
| `schedulePriceFactors` | SchedulePriceFactor[] | 分时段出价系数 |
| `shopType` | Integer | 电商店铺类型 |
| `equipmentType` | Integer | 推广设备 |
| `campaignBid` | Double | 计划点击出价 |
| `campaignOcpcBidType` | Integer | 计划出价模式 |
| `campaignOcpcBid` | Double | 转化计划出价 |
| `campaignTransTypes` | Integer[] | 计划目标转化 |
| `campaignDeepTransTypes` | Integer[] | 计划深度转化 |
| `campaignCvSources` | Integer[] | 数据来源 |
| `storePageInfos` | StorePageInfoType[] | 本地计划门店落地页信息 |
| `transAsset` | Integer | 转化资产类型 |
| `transAssetId` | Long | 转化资产ID |
| `geoLocationStatus` | Integer | 推广地域地理位置选项 |

## 安全要求

- 该接口会修改真实投放对象。
- 执行前必须确认账号、计划 ID、需要修改的字段、旧值和新值、影响范围和回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `campaign-update requires body.campaignTypes` | 漏传必填字段 campaignTypes | 按本文「输入字段」补齐 body.campaignTypes |
| `campaign-update: campaignTypes max 100 per request` | 单次提交数量超过上限 100 | 分批提交，每批 ≤ 100 |
| `campaign-update: each campaignType requires campaignId` | 集合元素 campaignType 缺少必填字段 campaignId | 为每个 campaignType 元素补齐 campaignId |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |
| `status=2 code=90121` | 没有操作计划的权限 | 确认目标账户的计划操作权限 |
| `status=2 code=901231` | 无权限设置计划预算 | 账户未开放预算修改权限 |
| `status=2 code=901291` | 无权限设置计划推广时段 | 账户未开放时段修改权限 |
| `status=2 code=9012` | 没有操作该用户的权限 | 换有操作权限的子账号，或申请账户权限 |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"campaign-update","confirmWrite":true,"userName":"子账号用户名","body":{"campaignTypes":[{"campaignId":87654321,"budget":100}]}}'
```
