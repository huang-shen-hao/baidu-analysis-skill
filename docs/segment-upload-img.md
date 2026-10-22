# 组件图片上传

## Trigger

用户要求上传图片、图片转百度格式、组件图片上传时使用。

## Action

`segment-upload-img`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/ImageManagementService/uploadImage`
- 方法说明：创意组件的图片必须通过该接口转为百度格式的图片链接才能投放。通过传入原图的 base64 编码内容上传图片。

## Payload

```json
{
  "action": "segment-upload-img",
  "userName": "子账号用户名",
  "body": {
    "productLine": "FENGCHAO",
    "items": [
      {
        "content": "base64",
        "imgmd5": "md5"
      }
    ],
    "needMola": true,
    "addImage": false
  }
}
```

## 安全要求

- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `productLine` | String | 是 | 图片所在产品线 | 固定传 `FENGCHAO` |
| `items` | UploadType[] | 是 | 上传图片的集合 | 官方未给单次数量上限（脚本侧限 20 张/次） |
| `needMola` | Boolean | - | 是否需要 molaUrl | 目前必须填写为 `true` |
| `addImage` | Boolean | - | 是否添加到我的图片 | 默认 `true` |

### UploadType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `content` | String | 是 | 图片内容 base64 编码（只收 base64，无 URL 入参） | 支持 jpg、png 格式，最大不超过 2M；不要带 `data:image/...;base64,` 前缀 |
| `imgmd5` | String | - | 图片MD5 | - |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `imageid` | Integer | 图片ID |
| `height` | Integer | 高度（px） |
| `width` | Integer | 宽度（px） |
| `size` | Integer | 图片大小（byte） |
| `url` | String | 图片URL |
| `molaUrl` | String | 图片URL（高级创意图片需使用此 URL） |
| `sign` | String | 图片MD5 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `segment-upload-img: items[i].content is required (base64)` | 缺少必填字段 | 按本文「输入字段」补齐该字段；content 传纯 base64 |
| `segment-upload-img: items[i].content must not include the "data:image/...;base64," prefix` | content 带了 `data:` 前缀 | 只传纯 base64 字符串 |
| `segment-upload-img: items[i].content is too large (官方限制单张 2M)` | 单张图片超过 2M | 压缩图片（官方按单张算，不是整包） |
| `segment-upload-img requires body.items as a non-empty array` | 漏传必填字段 items | 按本文「输入字段」补齐 body.items |
| `segment-upload-img: items max 20 per request（脚本侧上限，官方未给数量上限）` | 单次超过 20 张（脚本侧保护） | 分批提交，每批 ≤ 20 |
| `segment-upload-img: productLine must be "FENGCHAO" when provided` | 参数不符合接口约束 | 对照本文「输入字段」逐项核对 |
| `segment-upload-img: needMola must be true when provided` | 安全约束未满足 | 按本文「安全要求」把该字段显式设为 true |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"segment-upload-img","userName":"子账号用户名","body":{"productLine":"FENGCHAO","items":[{"content":"base64","imgmd5":"md5"}],"needMola":true,"addImage":false}}'
```
