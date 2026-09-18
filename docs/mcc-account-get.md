# 查询账户

## Trigger

用户要求查询账户、账户管家下辖账户、MCC 子账号、推广子账号列表时使用。

## Action

`mcc-account-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/feed/v1/MccFeedService/getUserListByMccid`
- 方法说明：查询账户管家下辖子账户列表。

## Payload

```json
{
  "action": "mcc-account-get",
  "userName": "子账号用户名",
  "body": {}
}
```

## 行为说明

- 该接口仅供账户管家权限使用。
- 无请求内容，body 传空对象 `{}` 即可。
- header 中的被操作账户可以传子账户中任意一个，对该接口功能无影响（查询结果始终为账户管家下辖全部子账户）。

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `userid` | Number | 用户 ID |
| `username` | String | 用户名 |
| `mccid` | Number | 账户管家 ID |
| `fatname` | String | 账户管家名称 |
| `remark` | String | 备注 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=0` 但 `rows=0` | 过滤条件在当前账号下确实没有数据 | 先用空条件或不带过滤拉一次，确认账号下有无物料 |
| `status=2 code=99912` | 查询形态用错：字段名或参数组合不符合接口要求（实测于 getWord / getCreative） | 对照本文 Payload 的字段名与 `ids` + `idType` 组合 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：错误码来自脚本校验器与百度官方错误码表（节点 166），**未经逐条实测**。
> 本接口的实测观测见对应条目；如需复现可用受控故障注入（空 body / 错字段名）。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"mcc-account-get","userName":"账户管家用户名","body":{}}'
```
