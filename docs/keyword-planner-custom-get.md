# 关键词规划师 · 账户主动推荐词

## Trigger

用户要在**已建好的计划/单元**上要\"还能加什么词\"、按账户已有结构推词时使用。典型：
\"这个单元建议再加哪些词\"、\"计划 123 的推荐词拉一下\"。

> 与 `keyword-planner-recommend-get` 的区别：那个是**任意种子词**拓词；这个依赖账户里的计划/单元 ID。

## Action

`keyword-planner-custom-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/KRService/getKRCustom`
- 方法说明：主动推词接口，根据客户的业务内容（计划/单元）返回相关推荐词。
- 只读接口：不改账户结构，不需要 `confirmWrite`。

## Payload

```json
{
  "action": "keyword-planner-custom-get",
  "userName": "子账号用户名",
  "body": {
    "idType": 3,
    "id": 123456789,
    "seedFilter": {
      "device": 0,
      "maxNum": 300,
      "negativeWords": ["免费"],
      "positiveWord": "电子签",
      "removeDuplicate": true
    }
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `idType` | Integer | - | 输入 ID 的类型 | 3 计划 / 5 单元 |
| `id` | Long | - | 计划/单元 ID；传了 `id` 就必须同时传 `idType` | 正整数 |
| `seedFilter` | SeedFilter | - | 筛选条件 | 同 `keyword-planner-recommend-get` |

> `id` 为 null 时，`idType` 可在 3/5 之间任填（等价于不指定具体对象）。

## 返回字段

与 `keyword-planner-recommend-get` 相同（`word` / `PV` / `pcPV` / `mobilePV` / `show` / `click` /
`showReasons` / `groupName` / `recommendPricePc` / `recommendPriceMobile` 等），但注意：

> ⚠️ **`competition` 方向相反**：本接口 **1 高 / 2 中 / 3 低**；`keyword-planner-recommend-get` 是 1 低 / 2 中 / 3 高。

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `idType must be 3（计划）or 5（单元）` | 枚举写错 | 只接受 3 / 5 |
| `传 id 时必须同时传 idType` | 只给了对象 ID | 补 `idType` |
| `id must be a positive integer` | ID 非法（负数/字符串数字） | 用数字类型传 |

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"keyword-planner-custom-get","userName":"子账号用户名","body":{"idType":3,"id":123456789}}'
```
