# 上传图片

## Trigger

用户要求上传图片、把本地图片转成百度可用图片链接、把图片存入"我的图库"时使用。

## Action

`image-upload`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/ImageManageService/uploadImage`
- 方法说明：图片上传接口，上传后搜索推广与信息流推广可共用。上传时不限制单张图片大小，单次请求不超过 10M。

> 本 action 属于「资产管理 · 图片管理」体系，替代已下线的 `image-segment-add`（创意配图管理 / ImageSegmentService）。

## Payload

```json
{
  "action": "image-upload",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "items": [
      {
        "content": "图片base64",
        "imgmd5": "XXX",
        "imageName": "XXX"
      }
    ],
    "addImage": true
  }
}
```

## 安全要求

- 该接口会向账户资产库上传图片；`addImage=true` 会在"我的图库"中产生资产。
- 执行前必须确认图片内容、用途和归属账户。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `items` | UploadImageItem[] | 是 | 图片上传对象 | 一次最多上传 **20 张** |
| `content` | String | 是 | 图片的 base64 编码（只收 base64，无 URL / 路径入参） | 不能为空；支持 jpg/jpeg/png；请求体最大 **10M**；**不要带** `data:image/xxx;base64,` 前缀 |
| `imgmd5` | String | - | 图片的 md5 | - |
| `imageName` | String | - | 图片名称 | 不超过 200 个字符（英文数字 1 字符，中文 2 字符） |
| `addImage` | Boolean | - | 是否保存到我的图库 | 默认 `false`（仅上传不保存）；`true` 时可在推广平台「资产中心-我的图片」查询，并会生成 `imageId` |
| `replace` | Boolean | - | 擎舵二创图片标识 | 仅擎舵二创场景使用，不用于替换图片内容或覆盖已有图片 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `imageId` | Long | 图片ID；`addImage=false` 时不生成 imageId |
| `width` / `height` | Integer | 图片尺寸 |
| `size` | Integer | 图片大小 |
| `url` | String | 图片 URL |
| `signature` | String | 图片 md5 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `BAIDU_USAGE_ERR: items max 20 per request` | 一次传超过 20 张图片 | 分批上传，每批 ≤ 20 张 |
| `content must not include the "data:image/..." prefix` | base64 带了 `data:image/jpg;base64,` 前缀 | 只传纯 base64 字符串 |
| 返回结果里没有 `imageId` | `addImage` 默认 `false`（仅上传不保存） | 需要入库并返回 `imageId` 时显式传 `addImage: true` |
| `image-upload: request body exceeds 10M（官方限制整包请求体 ≤ 10M，按 base64 长度算，请分批）` | 整包请求体超过 10M。按 base64 字符串长度算，base64 比原图大约 1/3，所以原图合计约 7.5M 就会触顶 | 压缩图片或分批上传 |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"image-upload","confirmWrite":true,"userName":"子账号用户名","body":{"items":[{"content":"<base64>","imageName":"首页banner"}],"addImage":true}}'
```

> payload 里含大段 base64 时，命令行可能超过系统长度限制，建议用 `--payload-file=<path>`。
