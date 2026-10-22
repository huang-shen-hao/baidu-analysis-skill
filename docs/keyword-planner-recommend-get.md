# 关键词规划师 · 种子词拓词

## Trigger

用户要**按种子词挖新词**、给关键词库补词、找某类词的真实检索量时使用。典型：\"身份认证相关有哪些词\"、
\"用『电子签章』拓一批词看看搜索量\"、\"这个词族还有没有别的说法\"。

> 与 `keyword-planner-custom-get` 的区别：那个是**账户里已建计划/单元**的主动推荐词；这个是**任意种子词**拓词。

## Action

`keyword-planner-recommend-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/KRService/getKRByQuery`
- 方法说明：根据输入的种子词返回推荐的扩展词，**一次调用仅允许请求一个种子词**。
- 只读接口：不改账户结构，不需要 `confirmWrite`。

## Payload

```json
{
  "action": "keyword-planner-recommend-get",
  "userName": "子账号用户名",
  "body": {
    "query": "身份认证",
    "seedFilter": {
      "device": 0,
      "maxNum": 300,
      "negativeWords": ["免费"],
      "positiveWord": "",
      "regionExtend": false,
      "removeDuplicate": true,
      "removeCampaignDuplicate": false
    }
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `query` | String | **是** | 种子词 | ≤64 字节 |
| `seedFilter` | SeedFilter | - | 筛选条件 | 见下 |

### SeedFilter

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `device` | Integer | 设备类型 | 0 全部（默认）/ 1 计算机 / 2 移动 |
| `maxNum` | Long | 返回条数；越大越靠后、相关性越低 | 1–1000，默认 300 |
| `negativeWords` | String[] | 不包含关键词 | ≤10 个，每个 ≤64 字节 |
| `positiveWord` | String | 只保留包含该词的推荐 | ≤64 字节，单个 |
| `regionExtend` | Boolean | true = 不推荐未选地域的词 | 默认 false |
| `removeDuplicate` | Boolean | true = 不推荐账户内已购词 | 默认 false |
| `removeCampaignDuplicate` | Boolean | true = 不推荐计划内已购词 | 默认 false |
| `searchRegions` | Long[] | 指定地域代码 | 默认全部地域 |

## 返回字段

`body.data[]`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `word` | String | 推荐词字面 |
| `PV` | Long | 月均搜索量 |
| `pcPV` / `mobilePV` | Long | 月均计算机 / 移动搜索量 |
| `show` / `click` | Long | 预估月均展现 / 点击 |
| `competition` | Long | 竞争程度：**1 低 / 2 中 / 3 高** |
| `competitionPc` / `competitionWise` | Integer | 计算机 / 移动竞争程度，同上 |
| `recommendPricePc` / `recommendPriceMobile` | Double | 计算机 / 移动指导价（元） |
| `showReasons` | String[] | 特色标签，如 行业激增词 / 黑马词 / 高频热搜词 |
| `groupName` | String | 关键词分组名 |

> ⚠️ **`competition` 的方向与 `keyword-planner-custom-get` 相反**：本接口 1=低；那个接口 1=高。别跨接口套用阈值。

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `requires body.query` | 没传种子词 | 必填且只能一个 |
| `query exceeds 64 bytes` | 种子词过长 | 缩短或拆成多次调用 |
| `seedFilter.maxNum must be an integer in [1, 1000]` | 条数越界 | 落到 1–1000 |
| `seedFilter.negativeWords ... at most 10 items` | 排除词超 10 个 | 分批或改用 `positiveWord` |

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"keyword-planner-recommend-get","userName":"子账号用户名","body":{"query":"身份认证","seedFilter":{"device":0,"maxNum":300,"removeDuplicate":true}}}'
```
