# 查询图片素材绑定

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

用户要求查询单元绑定的图片素材、素材绑定关系时使用。

## Action

`adgroup-image-segment-bind-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AdgroupImageSegmentBindService/getAdgroupImageSegmentBind`
- 方法说明：通过单元 ID 查询单元下绑定的素材图片信息。

## Payload

```json
{
  "action": "adgroup-image-segment-bind-get",
  "userName": "子账号用户名",
  "body": {
    "adgroupIds": [1],
    "fields": [
      "bindId",
      "adgroupId",
      "segmentId",
      "desc",
      "url",
      "segmentType",
      "segmentSign",
      "segmentStatus",
      "auditStatus",
      "reasonText"
    ]
  }
}
```

## 行为说明

- 单次最多可查询 1 万条数据，`limit` 缺省时默认返回前 1 万条。
- `limit` 支持两种形式：`[k]` 取前 k 条；`[m, n]` 从第 m+1 条开始取 n 条。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `adgroupIds` | Long[] | 是 | 单元ID | - |
| `fields` | String[] | 是 | 需要查询的字段 | 取值范围见下方枚举 |
| `limit` | Integer[] | - | 分页 | `[k]` 取前 k 条；`[m, n]` 从第 m+1 条取 n 条；默认前 1 万条 |

### fields 可选枚举

| 字段 | 说明 |
|------|------|
| `bindId` | 绑定ID |
| `adgroupId` | 单元ID |
| `segmentId` | 图片素材ID |
| `desc` | 图片主题 |
| `url` | 图片URL |
| `segmentType` | 图片素材类型 |
| `segmentSign` | 图片素材MD5 |
| `segmentStatus` | 图片素材启用/暂停状态 |
| `auditStatus` | 审核状态 |
| `reasonText` | 审核理由 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `bindId` | Long | 单元和素材绑定ID |
| `adgroupId` | Long | 单元ID |
| `segmentId` | Long | 图片素材ID |
| `desc` | String[] | 图片素材主题 |
| `url` | String | 图片URL |
| `segmentType` | Long | 图片素材类型（100-计算机 / 101-移动） |
| `segmentSign` | String | 素材MD5 |
| `segmentStatus` | Integer | 启用/暂停状态 |
| `auditStatus` | Integer | 素材审核状态 |
| `reasonText` | String | 拒绝理由 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| 输出里带"未传 fields"告警 | 官方要求显式声明返回字段 | 补齐 `fields` 才能拿到 `url` / `desc` / `auditStatus` 等信息 |
| `status=2 code=90112 unitid X not exists` | 单元 ID 不在当前账号下 | 先用 `adgroup-get` 核对单元 ID |
| `BAIDU_USAGE_ERR: requires body.adgroupIds` | 漏传单元 ID | `adgroupIds` 为必填 |
| 迁移到 `segment-bind-get` 后拿不到图片 URL | 新接口返回的是组件绑定，不含图片字段 | 需用 `segmentId` 再查一次 `segment-get` 的 `auditContent` |

> **来源**：错误码来自脚本校验器与百度官方错误码表（节点 166），**未经逐条实测**。
> 本接口的实测观测见对应条目；如需复现可用受控故障注入（空 body / 错字段名）。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"adgroup-image-segment-bind-get","userName":"子账号用户名","body":{"adgroupIds":[1],"fields":["bindId","adgroupId","segmentId","desc","url","segmentType","segmentSign","segmentStatus","auditStatus","reasonText"]}}'
```
