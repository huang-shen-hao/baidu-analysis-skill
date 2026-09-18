# 更新图片素材

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

用户要求更新图片素材、修改图片素材主题、暂停/启用图片素材时使用。

## Action

`image-segment-update`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/ImageSegmentService/updateImageSegment`
- 方法说明：图片素材更新接口。

## Payload

```json
{
  "action": "image-segment-update",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "segmentTypes": [
      {
        "segmentId": 9008642328,
        "desc": ["example string"],
        "status": 0
      }
    ]
  }
}
```

## 安全要求

- 该接口会修改真实素材对象。
- 执行前必须确认素材 ID、修改内容及回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

`segmentTypes` 必填 `ImageSegmentType[]`。

### ImageSegmentType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `segmentId` | Long | 是 | 图片素材ID | - |
| `desc` | String[] | - | 图片素材主题 | - |
| `status` | Integer | - | 启用/暂停状态 | 0-启用 / 1-暂停 |

### status 枚举值

| 值 | 说明 |
|---|---|
| 0 | 启用 |
| 1 | 暂停 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `segmentId` | Long | 图片素材ID |
| `desc` | String[] | 图片素材主题 |
| `url` | String | 图片URL |
| `segmentType` | Long | 图片素材类型（100-计算机 / 101-移动） |
| `segmentSign` | String | 素材MD5（只读） |
| `status` | Integer | 启用/暂停状态 |
| `auditStatus` | Integer | 素材审核状态（只读） |
| `reasonText` | String | 拒绝理由（只读） |

### auditStatus 枚举值（只读）

| 值 | 说明 |
|---|---|
| 0 | 审核通过 |
| 1 | 审核拒绝 |
| 2 | 暂未审核 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `segmentId is required` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `status must be 0 (启用) or 1 (暂停)` | 枚举取值非法 | 只接受文档列出的枚举值 |
| `desc must be an array of 图片主题` | 参数不符合接口约束 | 对照本文「输入字段」逐项核对 |
| `image-segment-update requires body.segmentTypes` | 漏传必填字段 segmentTypes | 按本文「输入字段」补齐 body.segmentTypes |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"image-segment-update","confirmWrite":true,"userName":"子账号用户名","body":{"segmentTypes":[{"segmentId":9008642328,"desc":["example string"],"status":0}]}}'
```
