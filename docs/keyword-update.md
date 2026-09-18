# 更新关键词

## Trigger

用户要求更新关键词、修改关键词出价、修改关键词匹配模式、修改关键词网址、暂停/启用关键词、修改关键词标签时使用。

## Action

`keyword-update`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/KeywordService/updateWord`
- 方法说明：更新关键词及商品目录模板词（可批量），单次请求不超过 10000 个，建议分批多次请求。

## Payload

```json
{
  "action": "keyword-update",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "keywordTypes": [
      {
        "keywordId": 260133434998,
        "price": 9.8,
        "pause": true,
        "matchType": 2,
        "phraseType": 3
      }
    ]
  }
}
```

## 安全要求

- 该接口会修改真实投放对象。
- 执行前必须确认账号、关键词 ID、修改内容及回滚方案。
- 修改出价、URL、匹配模式等字段可能触发重新审核，建议先通过预审接口检查。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

`keywordTypes` 必填 `KeywordType[]`，集合长度限制：[1, 10000]，建议分批多次请求。

### KeywordType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `keywordId` | Long | 是 | 关键词ID | - |
| `keyword` | String | - | 关键词字面 | 最大 40 字节（中文 2 字节，英文/数字 1 字节）；仅支持在智能匹配-核心词模式下修改 `{}` 圈选范围，不支持字面修改；如 `鲜花配送` 可改为 `{鲜花}配送`；商品目录营销目标可用 `#属性#` 语法修改模板词 |
| `price` | Double | - | 关键词竞价价格 | (0, 999.99] 且 ≤ 所属计划预算；设 0 表示取消该关键词出价，采用所属单元出价 |
| `matchType` | Integer | - | 匹配模式 | 与 phraseType 配合使用（见下方约束表） |
| `phraseType` | Integer | - | 细分匹配模式 | 与 matchType 配合使用（见下方约束表） |
| `pause` | Boolean | - | 启用/暂停关键词 | 默认 false；true-暂停 / false-启用 |
| `pcDestinationUrl` | String | - | 计算机访问网址 | 域名需与账户网站 URL 域名相同；最大 1024 字节；设空字符串表示取消；本地推广不支持 |
| `mobileDestinationUrl` | String | - | 移动访问网址 | 域名需与账户网站 URL 域名相同；最大 1024 字节；设空字符串表示取消；本地推广不支持 |
| `apiInefficient` | Integer | - | 是否低效关键词 | 0-非低效词 / 1-低效词 |
| `tabs` | Integer[] | - | 关键词物料标签数组 | 取值范围 [0, 31]；同一关键词最多 31 个标签；0 表示无标签，31 表示重点关键词 |
| `deeplink` | String | - | 应用调起网址 | 最大 2048 字符；小流量功能，需向营销顾问申请 |
| `ulink` | String | - | ios应用调起 | 最大 4096 字符；小流量功能，需向营销顾问申请；仅支持网站链接、应用推广、电商店铺 |
| `miniProgramUrl` | String | - | 小程序访问网址 | 最大 1024 字节 |
| `pcFinalUrl` | String | - | 计算机最终访问网址 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `pcTrackParam` | String | - | 计算机监控后缀 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `pcTrackTemplate` | String | - | 计算机第三方追踪模板 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileFinalUrl` | String | - | 移动最终访问网址 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileTrackParam` | String | - | 移动监控后缀 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileTrackTemplate` | String | - | 移动第三方追踪模板 | 仅适用于：网站链接、电商店铺推广、应用推广 |

### matchType 与 phraseType 约束关系

| matchType | phraseType | 含义 |
|---|---|---|
| 1 | 1 | 精确匹配 |
| 2 | 1 | 短语匹配 |
| 2 | 3 | 智能匹配 |

## 返回字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `keywordId` | Long | 关键词ID | - |
| `campaignId` | Long | 推广计划ID | - |
| `adgroupId` | Long | 推广单元ID | - |
| `keyword` | String | 关键词字面 | 最大 40 字节；修改时仅支持智能匹配-核心词模式修改 `{}` 圈选范围 |
| `price` | Double | 关键词竞价价格 | (0, 999.99] 且 ≤ 计划预算；设 0 表示使用单元出价 |
| `matchType` | Integer | 匹配模式 | 与 phraseType 配合使用 |
| `phraseType` | Integer | 细分匹配模式 | 与 matchType 配合使用 |
| `pause` | Boolean | 启用/暂停 | true-暂停 / false-启用 |
| `status` | Integer | 关键词状态 | 枚举值见 keyword-get 文档 |
| `pcDestinationUrl` | String | 计算机访问网址 | 域名需与账户网站URL域名相同；最大 1024 字节；设空字符串表示取消 |
| `mobileDestinationUrl` | String | 移动访问网址 | 域名需与账户网站URL域名相同；最大 1024 字节；设空字符串表示取消 |
| `offlineReasons` | OfflineReason[] | 物料推广下线原因 | 多个原因时数组有多个元素 |
| `tabs` | Integer[] | 关键词物料标签数组 | [0, 31]；0 表示无标签，31 表示重点关键词；最多 31 个 |
| `leftPriceGuide` | Double | 计算机指导价 | - |
| `mPriceGuide` | Double | 移动指导价 | - |
| `deeplink` | String | 应用调起网址 | - |
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

### OfflineReason（下线原因）

| 字段 | 类型 | 说明 |
|------|------|------|
| `mainReason` | String | 推广下线主要原因ID，值为 "3" 时代表审核不通过 |
| `detailReason` | String | 推广下线具体原因，JSON 字符串，解析后为嵌套数组，内层第一个元素为具体拒绝理由 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `keyword-update requires body.keywordTypes` | 漏传必填字段 keywordTypes | 按本文「输入字段」补齐 body.keywordTypes |
| `keyword-update: keywordTypes max 10000 per request` | 单次提交数量超过上限 10000 | 分批提交，每批 ≤ 10000 |
| `keyword-update: each keywordType requires keywordId` | 集合元素 keywordType 缺少必填字段 keywordId | 为每个 keywordType 元素补齐 keywordId |
| `keyword-update: price must be in (0, 999.99]` | 参数不符合接口约束 | 对照本文「输入字段」逐项核对 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |
| `status=2 code=90123` | 没有操作关键词的权限 | 确认目标账户的关键词操作权限 |
| `status=2 code=901681` | 没有暂停/启用关键词的权限 | 账户未开放关键词启停权限 |
| `status=2 code=9012` | 没有操作该用户的权限 | 换有操作权限的子账号，或申请账户权限 |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"keyword-update","confirmWrite":true,"userName":"子账号用户名","body":{"keywordTypes":[{"keywordId":260133434998,"price":9.8,"pause":true,"matchType":2,"phraseType":3}]}}'
```
