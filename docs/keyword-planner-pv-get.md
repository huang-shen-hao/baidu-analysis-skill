# 关键词规划师 · 关键词流量预估

## Trigger

用户要知道**一批词到底有没有量**、指导价多少、值不值得投时使用。典型：
\"这些词月均搜索量多少\"、\"帮我估一下这批认证词的展现和点击\"、\"哪个词最便宜\"。

> 与拓词接口的分工：先 `keyword-planner-recommend-get` 挖词 → 再用本接口**批量**估流量与出价。
> 单次最多 1000 个词，是唯一能批量拿\"月均搜索量 + 指导价\"的入口。

## Action

`keyword-planner-pv-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/PvSearchFunction/getPvSearch`
- 方法说明：关键词流量查询/预估（月均搜索量、展现、点击、指导价）。
- 只读接口：不改账户结构，不需要 `confirmWrite`。

## Payload

```json
{
  "action": "keyword-planner-pv-get",
  "userName": "子账号用户名",
  "body": {
    "bidWordSource": "wordList",
    "device": 0,
    "orderBy": "averageMonthPv",
    "order": "desc",
    "keywordList": [
      {"keywordName": "电子签章", "matchType": 1, "phraseType": 1},
      {"keywordName": "电子签名平台", "matchType": 2, "phraseType": 1}
    ]
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `bidWordSource` | String | **是** | 预估词的来源 | 目前只支持 `wordList` |
| `keywordList` | PvSearchRequestWordItem[] | **是** | 要预估的词 | 1–1000 个 |
| `device` | Integer | - | 设备 | 0 全部（默认）/ 1 仅移动 / 2 仅计算机 |
| `orderBy` | String | - | 排序字段 | `price` / `matchType` / `averageMonthPv` / `averageMonthPvMobile` / `averageMonthPvPc` / `show` / `click` / `pcPrice` / `mobilePrice` |
| `order` | String | - | 排序方向 | `asc` / `desc`（默认 desc） |

### PvSearchRequestWordItem

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `keywordName` | String | 关键词字面 | ≤40 字节（1 个中文按 2 字节） |
| `matchType` | Integer | 匹配模式 | 1 = 精确（配 `phraseType=1`）；2 = 短语（配 1）或智能（配 3） |
| `phraseType` | Integer | 细分匹配 | 1 / 3，与 `matchType` 配合 |

> 精确匹配 = `matchType:1` + `phraseType:1`；短语匹配 = `2` + `1`；智能匹配 = `2` + `3`。

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `logid` | Long | 本次预估的唯一标识 |
| `data[]` | PvSearchResponseWordItem[] | 每个词的预估结果 |
| `data[].keywordName` | String | 关键词字面 |
| `data[].averageMonthPv` | Long | **月均搜索量** |
| `data[].averageMonthPvPc` / `averageMonthPvMobile` | Long | 月均计算机 / 移动搜索量 |
| `data[].show` / `click` | Long | 预估月均展现 / 点击 |
| `data[].price` | Double | 指导价 |
| `data[].pcPrice` / `mobilePrice` | Double | 计算机 / 移动指导价 |
| `data[].kwc` | Long | 竞价激烈程度：1 高 / 2 中 / 3 低 |
| `data[].matchType` / `phraseType` | Integer | 回显的匹配模式 |
| `data[].showReasons` | String[] | 举荐理由（高频热搜词/黑马词/转化潜力词…） |
| `data[].actualWordList` | String[] | **实际参与预估的词**（黄反/次数限制会导致部分词不被预估） |
| `errorItems` | PvS...[] | 未能预估的词及原因 |

> ⚠️ 返回的是**预估**而非账户实际数据；`actualWordList` 与传入列表不一致时，说明部分词被过滤，结论要按它算。

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `bidWordSource 目前只支持 "wordList"` | 传了其它来源 | 固定 `wordList` |
| `requires body.keywordList as a non-empty array` | 没传词表 | 至少 1 个词 |
| `keywordList max 1000 per request` | 词太多 | 分批 ≤1000 |
| `keywordName exceeds 40 bytes` | 单词语面过长 | 截短或换词 |
| `matchType must be 1（精确）or 2（短语/智能…）` | 枚举错 | 1 / 2，配 `phraseType` |

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"keyword-planner-pv-get","userName":"子账号用户名","body":{"bidWordSource":"wordList","keywordList":[{"keywordName":"电子签章","matchType":1,"phraseType":1}]}}'
```
