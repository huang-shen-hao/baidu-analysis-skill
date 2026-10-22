# 添加图片素材

> [!WARNING]
> **官方已标注下线，但实测仍然可用**（2026-09-18 用真实账号验证：接口返回 `status=0` 与真实数据）
>
> 官方文档（节点 211 / 212）标注「创意配图管理 / 创意配图绑定管理」于 **2023-04-19 下线**，但服务端并未停服。
> 风险：Baidu 可能随时真正停服，且不再有官方文档支持。新流程请改用：
> `image-upload` / `image-get` / `image-update` / `image-delete`（资产管理 · 图片管理）与 `segment-bind-*`（创意组件绑定服务）。
> 新旧接口的字段差异见 SKILL.md 的「新旧接口能力对照」。
>
> 本 action 每次调用都会在输出里返回 `deprecated: true` 与告警。

## Trigger

用户要求添加图片素材、上传图片素材时使用。

## Action

`image-segment-add`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/ImageSegmentService/addImageSegment`
- 方法说明：图片素材添加接口。

## Payload

```json
{
  "action": "image-segment-add",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "addSegmentRequestTypes": [
      {
        "srcImageContent": "/9j/4AAQSkZJ...",
        "segmentType": 100,
        "desc": ["desc_example"]
      }
    ],
    "preview": false
  }
}
```

## 安全要求

- 该接口会上传图片素材。
- 执行前必须确认图片内容和用途。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `addSegmentRequestTypes` | AddImageSegmentType[] | 是 | 素材添加对象 | - |
| `preview` | Boolean | - | 是否预览 | 仅可填写 false，不支持预览 |

### AddImageSegmentType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `srcImageContent` | String | 是 | 上传原图的 base64 编码内容 | 单张图片最大不超过 5M |
| `segmentType` | Long | 是 | 图片素材类型 | 100-计算机图片素材 / 101-移动投放素材 |
| `desc` | String[] | 是 | 图片素材的主题描述 | 至少 1 个主题，最多 20 个，每个最多 60 个字符 |
| `cropLocation` | CoordinateType | - | 裁图左上角坐标位置 | 不填默认使用智能裁图 |
| `logoPicTypes` | LogoPicType[] | - | logo图片具体信息 | 不填默认无 logo；最多 2 个 logo |

### CoordinateType 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `x` | Integer | 裁图左上角 X 坐标 |
| `y` | Integer | 裁图左上角 Y 坐标 |

### LogoPicType 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `area` | Integer | logo区域 |
| `gravityX` | Integer | 重心X坐标 |
| `gravityY` | Integer | 重心Y坐标 |
| `logoImgContent` | String | logo图片的 base64 编码内容 |
| `opacity` | Integer | 透明度 |

### segmentType 枚举值

| 值 | 说明 |
|---|---|
| 100 | 计算机图片素材 |
| 101 | 移动投放素材 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `segmentId` | Long | 图片素材ID |
| `desc` | String[] | 图片素材主题 |
| `url` | String | 图片URL |
| `segmentType` | Long | 图片素材类型 |
| `segmentSign` | String | 素材MD5 |
| `status` | Integer | 启用/暂停状态 |
| `auditStatus` | Integer | 素材审核状态 |
| `reasonText` | String | 拒绝理由 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `srcImageContent is required (base64)` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `srcImageContent is too large (官方限制单张 5M)` | 单张图超过 5M | 压缩图片 |
| `desc must have 1–20 主题` | 主题数量不在 1–20 | 每张图给 1–20 个主题 |
| `desc[i] exceeds 60 characters` | 单个主题超过 60 字符 | 精简主题描述 |
| `logoPicTypes 最多 2 个 logo` | logo 超过 2 个 | 最多传 2 个 |
| `segmentType must be 100 (计算机) or 101 (移动)` | 枚举取值非法 | 只接受文档列出的枚举值 |
| `desc must be an array of 图片主题` | 参数不符合接口约束 | 对照本文「输入字段」逐项核对 |
| `image-segment-add requires body.addSegmentRequestTypes` | 漏传必填字段 addSegmentRequestTypes | 按本文「输入字段」补齐 body.addSegmentRequestTypes |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"image-segment-add","confirmWrite":true,"userName":"子账号用户名","body":{"addSegmentRequestTypes":[{"srcImageContent":"/9j/4AAQSkZJ...","segmentType":100,"desc":["desc_example"]}],"preview":false}}'
```
