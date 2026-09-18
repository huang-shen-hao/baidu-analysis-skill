# 报告数据查询

## Trigger

用户要求获取报告数据、查看搜索推广各类报告（账户/计划/单元/关键词/搜索词/oCPC等）或多渠道数据时使用。

## Action

`report-data-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/OpenApiReportService/getReportData`
- 方法说明：该接口为复用接口，不同 `reportType` 的请求体和返回值不同。

## reportType 列表

| reportType | 报告名称 | 说明 |
|---|---|---|
| `1783967` | 一站式多渠道报告 | 账户粒度多渠道数据（搜索推广、信息流推广、阿拉丁推广、知识营销） |
| `170026` | 搜索整体账户报告 | 搜索推广账户粒度报告，含丰富的场景/行业转化指标 |
| `2208157` | 账户报告 | 搜索推广账户报告 |
| `2290316` | 计划报告 | 搜索推广计划报告 |
| `2284618` | 单元报告 | 搜索推广单元报告 |
| `2602783` | 关键词报告 | 搜索推广关键词报告，含出价、质量度等 |
| `2307838` | 搜索词报告 | 搜索词报告，含触发模式等 |
| `248654` | 搜索商品报告 | 商品维度报告 |
| `9718404` | 人群报告 | 人群维度报告 |
| `2665235` | 创意报告 | 创意报告 |
| `6438125` | 创意组件报告 | 创意组件维度报告 |
| `1150477` | 高级样式报告 | 支持通过 filters mcId 区分：30-商品目录 / 40-商品组件 / 50-高级样式 |
| `144322` | 商品组件报告 | 商品组件维度报告 |
| `962454` | 图片组件报告 | 图片组件维度报告 |
| `1025056` | 搜索视频报告 | 视频维度报告 |
| `19800` | 自动配图报告 | 自动配图报告 |
| `1025058` | 搜索图片报告 | 图片维度报告 |
| `5381679` | 落地页报告 | 落地页维度报告，含转化指标 |
| `4017932` | 搜索访客明细报告 | 访客明细，含城市、IP、搜索词等 |
| `970650` | OCPC报告 | oCPC出价策略维度报告 |
| `999241` | OCPC报告-计划层级 | oCPC计划层级报告 |

## Payload 示例

### 一站式多渠道报告（1783967）

```json
{
  "reportType": 1783967,
  "startDate": "2022-08-23",
  "endDate": "2022-08-23",
  "timeUnit": "DAY",
  "columns": ["product", "date", "cost", "impression", "click"],
  "filters": [
    { "column": "product", "operator": "IN", "values": [0, 1] }
  ],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 搜索整体账户报告（170026）

```json
{
  "reportType": 170026,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "userName", "cost", "impression", "click", "ctr", "cplConversions", "cplConversionsCost", "rfqConversions", "rfqConversionsCost"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 计划报告（2290316）

```json
{
  "reportType": 2290316,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "userName", "campaignNameStatus", "impression", "click", "cost", "ctr", "cpc", "conversion", "bridgeConversion"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 单元报告（2284618）

```json
{
  "reportType": 2284618,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "userName", "campaignNameStatus", "adGroupNameStatus", "impression", "click", "cost", "ctr", "cpc", "conversion"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 关键词报告（2602783）

```json
{
  "reportType": 2602783,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "userName", "campaignNameStatus", "adGroupNameStatus", "wInfoNameStatus", "impression", "click", "cost", "ctr", "cpc", "conversion", "bridgeConversion", "bidNew", "qualityEnum"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 搜索词报告（2307838）

```json
{
  "reportType": 2307838,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "campaignNameStatus", "adGroupNameStatus", "ideaInfo", "wInfoNameStatus", "queryWord", "queryStatusName", "wMatchId", "impression", "click", "cost", "ctr", "cpc", "conversion", "bridgeConversion"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 搜索商品报告（248654）

```json
{
  "reportType": 248654,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "userName", "campaignName", "adGroupName", "outerId", "productNameStatus", "shantouProductId", "impression", "click", "cost", "ctr", "cpc"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 人群报告（9718404）

```json
{
  "reportType": 9718404,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "userName", "audienceName", "audienceStatusNew", "campaignNameStatus", "adGroupNameStatus", "impression", "click", "cost", "ctr", "cpc"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 创意报告（2665235）

```json
{
  "reportType": 2665235,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "userName", "campaignNameStatus", "adGroupNameStatus", "ideaInfo", "click", "cost", "ctr", "cpc"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 创意组件报告（6438125）

```json
{
  "reportType": 6438125,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "secondComponentType", "campaignNameStatus", "adGroupNameStatus", "impression", "click", "cost", "cpc", "ctr"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 高级样式报告（1150477）

```json
{
  "reportType": 1150477,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "mtName", "mtStyle", "campaignName", "adGroupName", "impression", "click", "cost", "ctr", "cpc"],
  "sorts": [],
  "filters": [
    {
      "column": "mcId",
      "operator": "IN",
      "values": ["30"]
    }
  ],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 商品组件报告（144322）

```json
{
  "reportType": 144322,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "productSegment", "planNameStatus", "unitNameStatus", "impression", "click", "cost", "ctr", "cpc"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 图片组件报告（962454）

```json
{
  "reportType": 962454,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["segmentid", "bindId", "impression"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 搜索视频报告（1025056）

```json
{
  "reportType": 1025056,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "videoNameStatus", "videoInfo", "impression", "click", "cost", "ctr", "cpc"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 自动配图报告（19800）

```json
{
  "reportType": 19800,
  "startDate": "2022-08-02",
  "endDate": "2022-08-02",
  "timeUnit": "SUMMARY",
  "columns": ["ctr", "picUrl", "segmentSignId", "segmentSign", "cost", "cpc", "segmentDesc", "impression", "click", "segmentType", "adgroupNameBind"],
  "sorts": [
    {
      "column": "impression",
      "sortRule": "DESC"
    }
  ],
  "filters": [
    {
      "column": "segmentType",
      "operator": "IN",
      "values": ["100", "101", "320", "321"]
    },
    {
      "column": "impression",
      "operator": "GT",
      "values": ["0"]
    },
    {
      "column": "platform",
      "operator": "IN",
      "values": ["1", "8", "14"]
    }
  ],
  "startRow": 0,
  "rowCount": 20,
  "needSum": false,
  "needCache": false,
  "addZeroRows": false,
  "withColumnMeta": false
}
```

### 搜索图片报告（1025058）

```json
{
  "reportType": 1025058,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "picUrl", "picScale", "impression", "click", "cost", "ctr", "cpc"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### OCPC报告（970650）

```json
{
  "reportType": 970650,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "projectNameStatus", "campaignNameStatus", "impression", "click", "cost", "ocpcConversions", "deepOCPCConversionsCost", "transPrice"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### OCPC报告-计划层级（999241）

```json
{
  "reportType": 999241,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "campaignNameStatus", "oCPCLevel", "oCPCBidType", "oCPCTypeName", "impression", "click", "cost", "filteredConversionsSum", "ocpcConversions", "transPrice"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 落地页报告（5381679）

```json
{
  "reportType": 5381679,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["date", "landingPageUrl", "click", "cost", "ocpcConversionsDetail1", "ocpcConversionsDetail5", "ocpcConversionsDetail2", "ocpcConversionsDetail35"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

### 搜索访客明细报告（4017932）

```json
{
  "reportType": 4017932,
  "startDate": "2021-01-01",
  "endDate": "2021-01-07",
  "timeUnit": "DAY",
  "columns": ["dateTime", "cityName", "queryWord", "wInfoNameStatus", "landingPageUrl", "ip", "antiCode", "landingPageDurationSec"],
  "sorts": [],
  "filters": [],
  "startRow": 0,
  "rowCount": 200,
  "needSum": false
}
```

## 行为说明

- 该接口为复用接口，不同 `reportType` 的请求体结构和返回字段不同。
- 支持的时间单位：`HOUR`、`DAY`、`WEEK`、`MONTH`、`SUMMARY`。
- 支持的最大时间区间：824 天。
- 高级样式报告（1150477）可通过 filters 中 `mcId` 参数区分维度：30-商品目录分样式 / 40-商品组件分样式 / 50-高级样式。
- 互斥限制：
  - `topPvWinA` 与 `topPvWinP` 互斥，且不能与 `provinceCityName`/`cityName` 同时请求。
  - `topFirstPvWinA` 与 `topFirstPvWinP` 互斥。
  - `wMatchId` 与 `provinceCityName` 不能同时使用。
  - `provinceName` 不支持小时维度。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `reportType` | Integer | 是 | 报告类型 | 见上方 reportType 列表 |
| `startDate` | String | 是 | 开始日期 | 格式：YYYY-MM-DD |
| `endDate` | String | 是 | 结束日期 | 格式：YYYY-MM-DD，最大跨度 824 天 |
| `timeUnit` | String | 是 | 时间单位 | HOUR / DAY / WEEK / MONTH / SUMMARY |
| `columns` | String[] | 是 | 请求字段 | 见下方 Columns 列表 |
| `filters` | Filter[] | 否 | 过滤条件 | - |
| `filters[].column` | String | 否 | 过滤字段 | 与 columns 字段名一致 |
| `filters[].operator` | String | 否 | 操作符 | IN、EQUALS、GT 等 |
| `filters[].values` | Array | 否 | 过滤值 | - |
| `sorts` | Sort[] | 否 | 排序条件 | - |
| `sorts[].column` | String | 否 | 排序字段 | - |
| `sorts[].sortRule` | String | 否 | 排序方向 | DESC / ASC |
| `startRow` | Integer | 否 | 分页偏移量 | 从 0 开始 |
| `rowCount` | Integer | 否 | 返回行数 | - |
| `needSum` | Boolean | 否 | 是否返回汇总行 | - |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `rowCount` | Integer | 当前返回行数 |
| `totalRowCount` | Integer | 总行数 |
| `rows` | Object[] | 报告数据行 |

### rows[] 常见表头字段

报告数据行会按请求的 `columns` 返回表头字段。以下字段常见于计划、单元、关键词、搜索词、创意和组件类报告：

| 字段 | 类型 | 说明 | 备注 |
|------|------|------|------|
| `campaignId` | Long | 推广计划ID | - |
| `campaignNameStatus` | String | 推广计划 | 报告数据包含已删除物料时，已删除计划会在名称后标记`[已删除]`，例如`推广计划[已删除]`；未删除物料正常显示名称 |
| `adGroupId` | Long | 推广单元ID | - |
| `adGroupNameStatus` | String | 推广单元 | 报告数据包含已删除物料时，已删除单元会在名称后标记`[已删除]`，例如`推广单元[已删除]`；未删除物料正常显示名称 |

## Columns 列表

> 以下为各 reportType 通用的核心字段，不同 reportType 可用字段存在差异，具体以请求示例中的 columns 为准。

### 属性字段

| 名称 | 类型 | 说明 | 备注 |
|------|------|------|------|
| `date` | Date | 日期 | DAY: 2021-03-31；HOUR: 2021-03-31 23:00；WEEK/MONTH/SUMMARY: 2021-03-01至2021-03-31 |
| `userName` | String | 账户名 | - |
| `userId` | Long | 账户ID | - |
| `campaignNameStatus` | String | 推广计划 | 报告数据包含已删除物料时，已删除计划会在名称后标记`[已删除]`，例如`推广计划[已删除]`；未删除物料正常显示名称 |
| `campaignName` | String | 推广计划名称 | - |
| `campaignId` | Long | 推广计划ID | - |
| `campaignStatus` | Enum | 推广计划状态 | 0-未删除 / 1-已删除 |
| `adGroupNameStatus` | String | 推广单元 | 报告数据包含已删除物料时，已删除单元会在名称后标记`[已删除]`，例如`推广单元[已删除]`；未删除物料正常显示名称 |
| `adGroupName` | String | 推广单元名称 | - |
| `adGroupId` | Long | 推广单元ID | - |
| `adGroupStatus` | Enum | 推广单元状态 | 0-未删除 / 1-已删除 |
| `wInfoNameStatus` | String | 关键词/网址 | 已删除物料会标记"[已删除]" |
| `wInfoId` | Long | 关键词ID | - |
| `winfoIdTypeEnum` | Enum | 定向类型 | 0-关键词 / 1-词包 / 3-自动扩量 |
| `wMatchId` | Enum | 触发模式 | 15-智能 / 16-智能匹配-人群智选 / 31-短语 / 63-精确 / 101-自动定向（智能匹配）/ 103-网址投放 / 109-商品定向 / 110-自动定向 / 111-词包。不支持小时，不能与 provinceCityName 同时使用 |
| `mixWmatchEnum` | Enum | 匹配模式 | 0-智能匹配 / 16-智能匹配核心词 / 17-短语匹配 / 48-精确匹配 / 127-分匹配出价 |
| `qualityEnum` | Enum | 质量度 | 1-10 对应 1-10 分 |
| `bidNew` | Double | 出价 | - |
| `estimatedClickRate` | Integer | 预估点击率 | 0-数据积累中 / 1-低于平均 / 2-平均水平 / 3-高于平均 |
| `businessRelationship` | Integer | 创意相关性 | 0-数据积累中 / 1-低于平均 / 2-平均水平 / 3-高于平均 |
| `landPageExperience` | Integer | 落地页体验 | 0-数据积累中 / 1-低于平均 / 2-平均水平 / 3-高于平均 |
| `device` | Enum | 推广设备 | 0-计算机 / 1-移动设备 |
| `targetingType` | Enum | 购买方式 | 0-关键词 / 6-网址定向 / 7-页面投放 |
| `provinceName` | String | 省 | 不支持小时 |
| `provinceCityName` | String | 城市 | 不支持小时，不能与 wMatchId 同时使用 |
| `product` | Long | 投放渠道（1783967专用） | 0-搜索推广 / 1-信息流推广 / 3-阿拉丁推广 / 4-知识营销 |
| `landingPageUrl` | String | 落地页URL | - |
| `queryWord` | String | 搜索词 | - |
| `queryStatusName` | String | 搜索词状态 | - |
| `ideaInfo` | String | 创意信息 | - |

### 基础效果指标

| 名称 | 类型 | 说明 |
|------|------|------|
| `impression` | Long | 展现 |
| `click` | Long | 点击 |
| `cost` | Double | 消费 |
| `ctr` | Double | 点击率 |
| `cpc` | Double | 平均点击价格 |
| `avgRank` | Double | 上方位平均排名（展现量加权），"-"表示未出现在第一页 |
| `conversion` | Long | 转化次数 |
| `bridgeConversion` | Long | 桥接转化 |

### 上方指标

| 名称 | 类型 | 说明 | 备注 |
|------|------|------|------|
| `topPageViews` | Long | 上方位展现 | - |
| `topFirstPageViews` | Long | 上方位首位展现 | - |
| `topFirstPvWinA` | Double | 上方首位胜出率 | 与 `topFirstPvWinP` 互斥 |
| `topFirstPvWinP` | Double | 上方首位胜出率（精确） | 与 `topFirstPvWinA` 互斥 |
| `topPvWinA` | Double | 上方展现胜出率 | 与 `topPvWinP` 互斥，不能与 provinceCityName/cityName 同时请求 |
| `topPvWinP` | Double | 上方展现胜出率（精确） | 与 `topPvWinA` 互斥，不能与 provinceCityName/cityName 同时请求 |
| `topPClicks` | Long | 上方位点击 | - |
| `topPay` | Long | 上方位消费 | - |

### oCPC 指标

| 名称 | 类型 | 说明 |
|------|------|------|
| `oCPCLevel` | Enum | 投放阶段（已下线） | 1-OCPC第一阶段 / 2-OCPC第二阶段 |
| `oCPCBidType` | Enum | 出价类型 | - |
| `oCPCTypeName` | String | oCPC类型名称 | - |
| `filteredConversionsSum` | Long | 无效转化过滤量（含系统识别异常+BCP标记无效） |
| `ocpcConversions` | Long | 目标转化量 |
| `deepOCPCConversions` | Long | 深度转化量 |
| `deepOCPCConversionsCost` | Long | 深度转化成本 |
| `transPrice` | Double | 目标转化成本 |

### 线索收集转化指标（170026专用）

| 名称 | 类型 | 说明 |
|------|------|------|
| `cplConversions` | Long | 服务直达线索量 |
| `cplConversionsCost` | Long | 服务直达线索量平均成本 |
| `rfqConversions` | Long | 线索加油包线索量 |
| `rfqConversionsCost` | Long | 线索加油包线索成本 |
| `ocpcConversionsDetail1` | Long | 咨询按钮点击量 |
| `ocpcConversionsDetail1TransWorth` | Long | 咨询按钮点击量转化价值 |
| `ocpcConversionsDetail19` | Long | 一句话咨询量 |
| `ocpcConversionsDetail17` | Long | 三句话咨询量 |
| `ocpcConversionsDetail18` | Long | 留线索量 |
| `ocpcConversionsDetail43` | Long | 小程序线索量 |
| `ocpcConversionsDetail51` | Long | 有意向客户量 |
| `ocpcConversionsDetail51TransWorth` | Long | 有意向客户量转化价值 |
| `ocpcConversionsDetail72` | Long | 聊到相关业务 |
| `ocpcConversionsDetail73` | Long | 回访-电话接通量 |
| `ocpcConversionsDetail73TransWorth` | Double | 回访-电话接通量转化价值 |
| `ocpcConversionsDetail74` | Long | 回访-信息确认量 |
| `ocpcConversionsDetail74TransWorth` | Long | 回访-信息确认量转化价值 |
| `ocpcConversionsDetail75` | Long | 回访-发现意向量 |
| `ocpcConversionsDetail75TransWorth` | Long | 回访-发现意向量转化价值 |
| `ocpcConversionsDetail76` | Long | 回访-高潜成交量 |
| `ocpcConversionsDetail76TransWorth` | Long | 回访-高潜成交量转化价值 |
| `ocpcConversionsDetail77` | Long | 回访-成单客户量 |
| `ocpcConversionsDetail77TransWorth` | Long | 回访-成单客户量转化价值 |
| `ocpcConversionsDetail5` | Long | 表单按钮点击量 |
| `ocpcConversionsDetail16` | Long | 表单调起按钮点击量 |
| `ocpcConversionsDetail3` | Long | 表单提交成功量 |
| `ocpcConversionsDetail3TransWorth` | Long | 表单提交成功量转化价值 |
| `ocpcConversionsDetail2` | Long | 电话按钮点击量 |
| `ocpcConversionsDetail2TransWorth` | Long | 电话按钮点击量转化价值 |
| `ocpcConversionsDetail30` | Long | 电话拨通量 |
| `ocpcConversionsDetail35` | Long | 微信复制按钮点击量 |
| `ocpcConversionsDetail32` | Long | QQ咨询按钮点击量 |
| `ocpcConversionsDetail50` | Long | 预约量 |
| `ocpcConversionsDetail8` | Long | 短信咨询按钮点击量 |
| `ocpcConversionsDetail31` | Long | 地图按钮点击量 |
| `ocpcConversionsDetail33` | Long | 抽奖按钮点击量 |
| `ocpcConversionsDetail12` | Long | 预约按钮点击量 |
| `ocpcConversionsDetail34` | Long | 投票按钮点击量 |
| `ocpcConversionsDetail36` | Long | 评价按钮点击量 |
| `ocpcConversionsDetail40` | Long | 关注按钮点击量 |
| `ocpcConversionsDetail68` | Long | 粉丝关注成功量 |
| `ocpcConversionsDetail67` | Long | 微信调起按钮点击量 |
| `ocpcConversionsDetail79` | Long | 微信加粉成功量 |
| `ocpcConversionsDetail61` | Long | 二次跳转量 |
| `ocpcConversionsDetail56` | Long | 到店量 |
| `ocpcConversionsDetail120` | Long | 综合线索收集 |
| `ocpcConversionsDetail120_3` | Long | 综合线索收集（表单提交成功） |
| `ocpcConversionsDetail120_18` | Long | 综合线索收集（留线索） |
| `ocpcConversionsDetail120_30` | Long | 综合线索收集（电话拨通） |
| `ocpcConversionsDetail92` | Long | 有效咨询量 |
| `ocpcConversionsDetail141` | Long | 挂号量 |
| `ocpcConversionsDetail142` | Long | 意向咨询量 |
| `ocpcConversionsDetail143` | Long | 意向表单量 |
| `ocpcConversionsDetail52` | Long | 深度使用量 |

> 线索收集（转化时间）指标使用 `ctOCPCConversionsDetail` 前缀，字段名后缀与上述一致。例如 `ctOCPCConversionsDetail1` = 咨询按钮点击量（转化时间）。

### 产品订购转化指标（170026专用）

| 名称 | 类型 | 说明 |
|------|------|------|
| `ocpcConversionsDetail7` | Long | 购买按钮点击量 |
| `ocpcConversionsDetail10` | Long | 服务购买成功量 |
| `ocpcConversionsDetail10TransWorth` | Long | 服务购买成功转化价值 |
| `ocpcConversionsDetail14` | Long | 订单提交成功量 |
| `ocpcConversionsDetail14TransWorth` | Double | 订单提交成功转化价值 |
| `ocpcConversionsDetail14Amount` | Double | 订单提交成功金额 |

### 应用推广转化指标（170026专用）

| 名称 | 类型 | 说明 |
|------|------|------|
| `ocpcConversionsDetail4` | Long | 激活人数 |
| `ocpcConversionsDetail4TransWorth` | Long | 激活人数转化价值 |
| `ocpcConversionsDetail25` | Long | 注册人数 |
| `ocpcConversionsDetail25TransWorth` | Long | 注册人数转化价值 |
| `ocpcConversionsDetail26` | Long | 付费人数 |
| `ocpcConversionsDetail26TransWorth` | Long | 付费人数转化价值 |
| `ocpcConversionsDetail26Count` | Long | 付费次数 |
| `ocpcConversionsDetail26One` | Double | 激活当日付费金额 |
| `ocpcConversionsDetail26Three` | Double | 激活3日内付费金额 |
| `ocpcConversionsDetail26Seven` | Double | 激活7日内付费金额 |
| `ocpcConversionsDetail26Fourteen` | Double | 激活14日内付费金额 |
| `ocpcConversionsDetail26Thirty` | Double | 激活30日内付费金额 |
| `ocpcConversionsDetail28` | Long | 次日留存人数 |
| `ocpcConversionsDetail29` | Long | 7日留存人数 |
| `ocpcConversionsDetail95` | Long | 3日留存人数 |
| `ocpcConversionsDetail96` | Long | 4日留存人数 |
| `ocpcConversionsDetail97` | Long | 5日留存人数 |
| `ocpcConversionsDetail98` | Long | 6日留存人数 |
| `ocpcConversionsDetail100` | Long | 14日留存人数 |
| `ocpcConversionsDetail121` | Long | 2日留存人数 |
| `ocpcConversionsDetail49` | Long | 登录人数 |
| `ocpcConversionsDetail20` | Long | 关键页面浏览量 |
| `ocpcConversionsDetail6` | Long | 下载（预约）按钮点击量 |
| `ocpcConversionsDetail27` | Long | 客户自定义转化量 |

### 金融行业转化指标（170026专用）

| 名称 | 类型 | 说明 |
|------|------|------|
| `ocpcConversionsDetail117` | Long | 进件量 |
| `ocpcConversionsDetail41` | Long | 申请量 |
| `ocpcConversionsDetail41TransWorth` | Long | 申请量转化价值 |
| `ocpcConversionsDetail42` | Long | 授信量 |
| `ocpcConversionsDetail89` | Long | 放款量 |

### 电商行业转化指标（170026专用）

| 名称 | 类型 | 说明 |
|------|------|------|
| `ocpcConversionsDetail57` | Long | 店铺调起量 |
| `ocpcConversionsDetail15` | Long | 加入购物车按钮点击量 |
| `ocpcConversionsDetail46` | Long | 加入购物车量 |
| `ocpcConversionsDetail9` | Long | 电商订单量 |
| `ocpcConversionsDetail78` | Long | 店铺停留转化量 |
| `ocpcConversionsDetail90` | Long | 商品支付成功量 |
| `ocpcConversionsDetail90Amount` | Double | 商品支付成功金额 |
| `ocpcConversionsDetail45` | Long | 商品下单成功量 |
| `ocpcConversionsDetail71` | Long | 应用调起人数 |
| `ocpcConversionsDetail71TransWorth` | Long | 应用调起人数转化价值 |

### 游戏行业转化指标（170026专用）

| 名称 | 类型 | 说明 |
|------|------|------|
| `ocpcConversionsDetail26_49One` | Double | 登录当日付费金额 |
| `ocpcConversionsDetail26_49Three` | Double | 登录3日内付费金额 |
| `ocpcConversionsDetail26_49Seven` | Double | 登录7日内付费金额 |
| `ocpcConversionsDetail49TransWorth` | Long | 登录人数转化价值 |

### 文娱行业转化指标（170026专用）

| 名称 | 类型 | 说明 |
|------|------|------|
| `ocpcConversionsDetail118` | Long | 付费观剧人数 |
| `ocpcConversionsDetail118One` | Double | 付费观剧当日金额 |
| `ocpcConversionsDetail118Three` | Double | 付费观剧3日金额 |
| `ocpcConversionsDetail118Seven` | Double | 付费观剧7日金额 |
| `ocpcConversionsDetail118Fourteen` | Double | 付费观剧14日金额 |
| `ocpcConversionsDetail118Thirty` | Double | 付费观剧30日金额 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `requires body.timeUnit` / `requires body.columns` | 漏传必填字段 | `timeUnit` ∈ HOUR/DAY/WEEK/MONTH/SUMMARY；`columns` 至少一个 |
| 返回 `rows` 极大、上下文被撑爆 | 时间区间过长或列过多 | 缩小时间范围、减少 `columns`，或分页分批拉取 |
| `status=2 code=9015` | `reportType` 与 `columns` 不匹配 | 对照本文「reportType 列表」选用该报告支持的列 |

> **来源**：错误码来自脚本校验器与百度官方错误码表（节点 166），**未经逐条实测**。
> 本接口的实测观测见对应条目；如需复现可用受控故障注入（空 body / 错字段名）。

## 调用示例

```bash
node scripts/api.ts --payload='{\"action\":\"report-data-get\",\"userName\":\"子账号用户名\",\"body\":{\"reportType\":170026,\"startDate\":\"2021-01-01\",\"endDate\":\"2021-01-07\",\"timeUnit\":\"DAY\",\"columns\":[\"date\",\"userName\",\"cost\",\"impression\",\"click\",\"ctr\",\"cplConversions\",\"cplConversionsCost\"],\"sorts\":[],\"filters\":[],\"startRow\":0,\"rowCount\":200,\"needSum\":false}}'
```
