# 查询计划已使用的推广业务

## Trigger

用户要求查询计划已使用的推广业务、业务类目绑定关系时使用。

## Action

`bind-business-point-list-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/BusinessPointService/getBindBusinessPointList`
- 方法说明：查询计划已使用的推广业务。

## Payload

```json
{
  "action": "bind-business-point-list-get",
  "userName": "子账号用户名",
  "body": {
    "needPath": false
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `needPath` | Boolean | 否 | 是否需要将完整路径填充到响应的 `paths` 字段 | `true`-需要，`false`-不需要 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `paths` | BusinessPointListType[][] | 推广业务类目完整链路 |
| `businessPointId` | Long | 业务类目ID |
| `businessPointName` | String | 业务类目名称 |

### BusinessPointListType

| 字段 | 类型 | 说明 |
|------|------|------|
| `businessPointId` | Long | 业务类目ID |
| `businessPointName` | String | 业务类目名称 |

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
node scripts/api.ts --payload='{"action":"bind-business-point-list-get","userName":"子账号用户名","body":{"needPath":false}}'
```
