# 查询关键词

## Trigger

用户要求查询关键词、关键词列表、关键词出价、关键词匹配模式、关键词状态、关键词质量度或关键词网址时使用。

## Action

`keyword-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/KeywordService/getWord`
- 方法说明：根据指定的单元 ID 或关键词 ID 批量获取关键词信息。

## Payload

```json
{
  "action": "keyword-get",
  "userName": "子账号用户名",
  "body": {
    "wordFields": [
      "keywordId",
      "campaignId",
      "adgroupId",
      "keyword",
      "price",
      "pause",
      "matchType",
      "phraseType",
      "status",
      "quality",
      "pcFinalUrl",
      "mobileFinalUrl"
    ],
    "ids": [1],
    "idType": 5,
    "getTemp": 0
  }
}
```

## 行为说明

- `idType=5` 时，`ids` 为单元 ID，可查询该单元下所有关键词（不超过 50 个单元 ID）。
- `idType=11` 时，`ids` 为关键词 ID，直接查询关键词（不超过 10000 个关键词 ID）。
- `getTemp` 默认为 0（查询关键词本身）。设为 1 可查询关键词影子。想要获得关键词全集，需分别以 `getTemp=0` 和 `getTemp=1` 调用两次。
- 影子说明：关键词 A 审核通过后，若修改影响审核状态的字段（如 URL），修改后的关键词为 A'（影子），A' 审核通过生效前线上仍为 A。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `wordFields` | String[] | 是 | 需要查询的关键词属性 | 取值范围见下方字段枚举 |
| `ids` | Long[] | 是 | 查询 ID 集合 | idType=5 时为单元 ID，不超过 50 个；idType=11 时为关键词 ID，不超过 10000 个 |
| `idType` | Integer | 是 | 查询 ID 类型 | 5-单元ID / 11-关键词ID |
| `getTemp` | Integer | - | 是否查询关键词影子 | 默认 0；0-查询关键词本身 / 1-查询关键词影子 |

### wordFields 可选枚举

| 字段 | 说明 |
|------|------|
| `keywordId` | 关键词ID |
| `campaignId` | 推广计划ID |
| `adgroupId` | 推广单元ID |
| `keyword` | 关键词字面 |
| `price` | 关键词竞价价格 |
| `pause` | 启用/暂停关键词 |
| `matchType` | 匹配模式 |
| `phraseType` | 细分匹配模式 |
| `status` | 关键词状态 |
| `apiInefficient` | 是否低效关键词 |
| `pcDestinationUrl` | 计算机访问网址 |
| `mobileDestinationUrl` | 移动访问网址 |
| `tabs` | 关键词物料标签数组 |
| `leftPriceGuide` | 计算机指导价 |
| `mPriceGuide` | 移动指导价 |
| `miniProgramUrl` | 小程序访问网址 |
| `offlineReasons` | 物料推广下线原因 |
| `createTime` | 创建时间 |
| `ulink` | ios调起应用（小流量，需向营销顾问申请） |
| `deeplink` | 应用调起网址 |
| `quality` | 质量度 |
| `estimatedClickRate` | 预估点击率 |
| `businessRelationship` | 创意相关性 |
| `landPageExperience` | 落地页体验 |
| `pcFinalUrl` | 计算机最终访问网址 |
| `pcTrackParam` | 计算机监控后缀 |
| `pcTrackTemplate` | 计算机第三方追踪模板 |
| `mobileFinalUrl` | 移动最终访问网址 |
| `mobileTrackParam` | 移动监控后缀 |
| `mobileTrackTemplate` | 移动第三方追踪模板 |

## 返回字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `keywordId` | Long | 关键词ID | - |
| `campaignId` | Long | 推广计划ID | - |
| `adgroupId` | Long | 推广单元ID | - |
| `keyword` | String | 关键词字面 | 最大 40 字节；修改时仅支持智能匹配-核心词模式修改 `{}` 圈选范围 |
| `price` | Double | 关键词竞价价格 | (0, 999.99] 且 ≤ 计划预算；设 0 表示使用单元出价 |
| `matchType` | Integer | 匹配模式 | 与 phraseType 配合使用（见下方约束表） |
| `phraseType` | Integer | 细分匹配模式 | 与 matchType 配合使用（见下方约束表） |
| `pause` | Boolean | 启用/暂停 | true-暂停 / false-启用 |
| `status` | Integer | 关键词状态 | 枚举值见下方 |
| `pcDestinationUrl` | String | 计算机访问网址 | 域名需与账户网站URL域名相同；最大 1024 字节；设空字符串表示取消 |
| `mobileDestinationUrl` | String | 移动访问网址 | 域名需与账户网站URL域名相同；最大 1024 字节；设空字符串表示取消 |
| `offlineReasons` | OfflineReason[] | 物料推广下线原因 | 多个原因时数组有多个元素 |
| `tabs` | Integer[] | 关键词物料标签数组 | [0, 31]；0 表示无标签，31 表示重点关键词；最多 31 个 |
| `leftPriceGuide` | Double | 计算机指导价 | [0, 999.99)；历史数据不足时返回 - |
| `mPriceGuide` | Double | 移动指导价 | [0, 999.99)；历史数据不足时返回 - |
| `deeplink` | String | 应用调起网址 | - |
| `ulink` | String | ios应用调起 | 最大 4096 字符；小流量功能，需向营销顾问申请 |
| `miniProgramUrl` | String | 小程序访问网址 | 最大 1024 字节 |
| `quality` | Integer | 质量度（只读） | [0, 10] |
| `estimatedClickRate` | Integer | 预估点击率 | 0-数据积累中 / 1-低于平均 / 2-平均水平 / 3-高于平均 |
| `businessRelationship` | Integer | 创意相关性 | 0-数据积累中 / 1-低于平均 / 2-平均水平 / 3-高于平均 |
| `landPageExperience` | Integer | 落地页体验 | 0-数据积累中 / 1-低于平均 / 2-平均水平 / 3-高于平均 |
| `createTime` | String | 关键词创建时间（只读） | - |
| `pcFinalUrl` | String | 计算机最终访问网址 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `pcTrackParam` | String | 计算机监控后缀 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `pcTrackTemplate` | String | 计算机第三方追踪模板 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileFinalUrl` | String | 移动最终访问网址 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileTrackParam` | String | 移动监控后缀 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileTrackTemplate` | String | 移动第三方追踪模板 | 仅适用于：网站链接、电商店铺推广、应用推广 |

### matchType 与 phraseType 约束关系

| matchType | phraseType | 含义 |
|---|---|---|
| 1 | 1 | 精确匹配 |
| 2 | 1 | 短语匹配 |
| 2 | 3 | 智能匹配 |

### status 枚举值（关键词状态）

| 值 | 说明 |
|---|---|
| 40 | 有效-移动url审核中 |
| 41 | 有效 |
| 42 | 暂停推广 |
| 43 | 不宜推广 |
| 44 | 展现受限：搜索无效 |
| 45 | 待激活 |
| 46 | 审核中 |
| 47 | 搜索量过低 |
| 48 | 部分无效（投放全部设备时，移动物料审核未过、计算机物料审核通过） |
| 49 | 展现受限：计算机搜索无效 |
| 50 | 展现受限：移动搜索无效 |
| 58 | 展现受限 |

### OfflineReason（下线原因）

| 字段 | 类型 | 说明 |
|------|------|------|
| `mainReason` | String | 推广下线主要原因ID，值为 "3" 时代表审核不通过 |
| `detailReason` | String | 推广下线具体原因，JSON 字符串，解析后为嵌套数组，内层第一个元素为具体拒绝理由 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=2 code=9011519` `Request field is invalid` | 空 body，或字段名拼错 | 按本文 Payload 传 `wordFields` + `ids` + `idType` |
| `status=2 code=99912` `Json message is invalid` | 用了旧字段形态（如 `campaignIds`）而非 `ids` + `idType` | 改用 `ids` + `idType` |
| `status=2 code=90112` `Adgroup id not exist` | `ids` 里的单元 ID 不属于当前账号 | 先用 `adgroup-get` 核对单元 ID |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> 本表错误码为 **2026-09-18 对该账号受控故障注入的实测结果**（空 body / 错字段名 / 不存在的 ID），非推断。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"keyword-get","userName":"子账号用户名","body":{"wordFields":["keywordId","campaignId","adgroupId","keyword","price","pause","matchType","phraseType","status","quality","pcFinalUrl","mobileFinalUrl"],"ids":[1],"idType":5,"getTemp":0}}'
```
