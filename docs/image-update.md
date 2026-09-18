# 编辑图片

## Trigger

用户要求修改图片名称、收藏或取消收藏图片时使用。

## Action

`image-update`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/ImageManageService/modImage`
- 方法说明：图片修改接口。

> 本 action 属于「资产管理 · 图片管理」体系，替代已下线的 `image-segment-update`。注意：本接口只改图片名称与收藏状态，**不支持替换图片内容**。

## Payload

```json
{
  "action": "image-update",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "items": [
      {
        "imageId": 12313241,
        "collect": false,
        "imageName": "XXX"
      }
    ]
  }
}
```

## 安全要求

- 该接口会修改账户资产库中的图片属性（名称、收藏状态）。
- 执行前必须确认图片ID与目标名称。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `items` | ModImageItem[] | 是 | 图片编辑对象 | - |
| `items[].imageId` | Long | 是 | 图片ID | - |
| `items[].collect` | Boolean | - | `true` 收藏 / `false` 取消收藏 | - |
| `items[].imageName` | String | - | 图片名称 | 不超过 200 个字符（英文数字 1 字符，中文 2 字符） |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `imageId` | Long | 图片ID |
| `collect` | Boolean | 是否收藏 |
| `imageName` | String | 图片名称 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `imageId is required` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `collect must be a boolean` | 参数不符合接口约束 | 对照本文「输入字段」逐项核对 |
| `imageName max 200 characters (中文按 2 字符)` | 参数不符合接口约束 | 对照本文「输入字段」逐项核对 |
| `image-update requires body.items` | 漏传必填字段 items | 按本文「输入字段」补齐 body.items |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"image-update","confirmWrite":true,"userName":"子账号用户名","body":{"items":[{"imageId":12313241,"imageName":"首页banner-PC"}]}}'
```
