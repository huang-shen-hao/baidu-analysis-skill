# 查询图片素材

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

用户要求查询图片素材、图片素材信息、图片审核状态时使用。

## Action

`image-segment-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/ImageSegmentService/getImageSegment`
- 方法说明：图片素材查询接口。

## Payload

```json
{
  "action": "image-segment-get",
  "userName": "子账号用户名",
  "body": {
    "segmentIds": [9008642328],
    "segmentFields": [
      "segmentId",
      "desc",
      "url",
      "segmentType",
      "segmentSign",
      "status",
      "auditStatus",
      "reasonText"
    ]
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `segmentIds` | Long[] | - | 图片素材ID集合 | - |
| `segmentFields` | String[] | - | 请求字段 | 取值范围见下方枚举 |

### segmentFields 可选枚举

| 字段 | 说明 |
|------|------|
| `segmentId` | 图片素材ID |
| `desc` | 图片主题 |
| `url` | 图片URL |
| `segmentType` | 图片素材类型 |
| `segmentSign` | 图片素材MD5 |
| `status` | 图片素材启用/暂停状态 |
| `auditStatus` | 审核状态 |
| `reasonText` | 审核理由 |

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
| 输出里带 `deprecated: true` 告警 | 官方标注该服务 2023-04-19 下线（实测仍可用） | 可继续使用，但请按 [已下线接口说明](./deprecated-actions.md) 规划迁移 |
| 迁移到 `image-get` 后查不到审核状态 | 新接口不返回 `auditStatus` / `reasonText` / `desc` / `status` | 需要审核信息时继续用本接口，或向百度确认新链路的审核查询方式 |

> **来源**：错误码来自脚本校验器与百度官方错误码表（节点 166），**未经逐条实测**。
> 本接口的实测观测见对应条目；如需复现可用受控故障注入（空 body / 错字段名）。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"image-segment-get","userName":"子账号用户名","body":{"segmentIds":[9008642328],"segmentFields":["segmentId","desc","url","segmentType","segmentSign","status","auditStatus","reasonText"]}}'
```
