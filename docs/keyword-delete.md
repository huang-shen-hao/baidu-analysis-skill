# 删除关键词

## Trigger

用户明确要求删除关键词时使用。

## Action

`keyword-delete`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/KeywordService/deleteWord`
- 方法说明：删除指定的关键词及商品目录模板词（可批量），建议分批多次请求。

## Payload

```json
{
  "action": "keyword-delete",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "keywordIds": [
      260133434998
    ]
  }
}
```

## 安全要求

- 该接口会删除真实投放对象，且删除后**不可恢复**。
- 执行前必须确认：
  - 推广账号。
  - 关键词 ID 和关键词字面。
  - 对投放、报表和审计记录的影响。
  - 回滚或补救方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `keywordIds` | Long[] | 是 | 关键词ID集合 | 长度限制：[1, 10000] |

## 返回字段

返回被删除的关键词完整信息。

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `keywordId` | Long | 关键词ID | - |
| `campaignId` | Long | 推广计划ID | - |
| `adgroupId` | Long | 推广单元ID | - |
| `keyword` | String | 关键词字面 | 最大 40 字节（中文 2 字节，英文/数字 1 字节） |
| `price` | Double | 关键词竞价价格 | (0, 999.99] |
| `matchType` | Integer | 匹配模式 | 与 phraseType 配合使用（见下方约束表） |
| `phraseType` | Integer | 细分匹配模式 | 与 matchType 配合使用（见下方约束表） |
| `pause` | Boolean | 启用/暂停 | true-暂停 / false-启用 |
| `status` | Integer | 关键词状态 | 枚举值见下方 |
| `pcDestinationUrl` | String | 计算机访问网址 | 最大 1024 字节 |
| `mobileDestinationUrl` | String | 移动访问网址 | 最大 1024 字节 |
| `offlineReasons` | OfflineReason[] | 物料推广下线原因 | 多个原因时数组有多个元素 |
| `tabs` | Integer[] | 关键词物料标签数组 | [0, 31]；0 表示无标签，31 表示重点关键词 |
| `leftPriceGuide` | Double | 计算机指导价 | [0, 999.99)；历史数据不足时返回 - |
| `mPriceGuide` | Double | 移动指导价 | [0, 999.99)；历史数据不足时返回 - |
| `deeplink` | String | 应用调起网址 | - |
| `miniProgramUrl` | String | 小程序访问网址 | 最大 1024 字节 |
| `quality` | Integer | 质量度（只读） | [0, 10] |
| `estimatedClickRate` | Integer | 预估点击率 | 0-数据积累中 / 1-低于平均 / 2-平均水平 / 3-高于平均 |
| `businessRelationship` | Integer | 创意相关性 | 0-数据积累中 / 1-低于平均 / 2-平均水平 / 3-高于平均 |
| `landPageExperience` | Integer | 落地页体验 | 0-数据积累中 / 1-低于平均 / 2-平均水平 / 3-高于平均 |
| `createTime` | String | 关键词创建时间（只读） | - |
| `pcFinalUrl` | String | 计算机最终访问网址 | - |
| `pcTrackParam` | String | 计算机监控后缀 | - |
| `pcTrackTemplate` | String | 计算机第三方追踪模板 | - |
| `mobileFinalUrl` | String | 移动最终访问网址 | - |
| `mobileTrackParam` | String | 移动监控后缀 | - |
| `mobileTrackTemplate` | String | 移动第三方追踪模板 | - |

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
| `keyword-delete requires body.keywordIds` | 漏传必填字段 keywordIds | 按本文「输入字段」补齐 body.keywordIds |
| `keyword-delete: keywordIds max 10000 per request` | 单次提交数量超过上限 10000 | 分批提交，每批 ≤ 10000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |
| `status=2 code=90123` | 没有操作关键词的权限 | 确认目标账户的关键词操作权限 |
| `status=2 code=901691` | 无权限删除关键词 | 账户未开放关键词删除权限 |
| `status=2 code=9012` | 没有操作该用户的权限 | 换有操作权限的子账号，或申请账户权限 |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"keyword-delete","confirmWrite":true,"userName":"子账号用户名","body":{"keywordIds":[260133434998]}}'
```
