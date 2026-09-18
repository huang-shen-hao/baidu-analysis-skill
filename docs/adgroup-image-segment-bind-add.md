# 添加图片素材绑定

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

用户要求将图片素材绑定到推广单元、添加素材绑定时使用。

## Action

`adgroup-image-segment-bind-add`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AdgroupImageSegmentBindService/addAdgroupImageSegmentBind`
- 方法说明：添加单元和素材绑定。

## Payload

```json
{
  "action": "adgroup-image-segment-bind-add",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "adgroupImageSegmentBindIdTypes": {
      "adgroupId": 1,
      "segmentId": 1
    }
  }
}
```

## 安全要求

- 该接口会创建绑定关系。
- 执行前必须确认账号、单元 ID、素材 ID 和回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `adgroupImageSegmentBindIdTypes` | AdgroupImageSegmentBindIdType | 是 | 单元素材ID绑定对象 | - |
| `adgroupId` | Long | 是 | 单元ID | - |
| `segmentId` | Long | - | 素材ID | - |

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
| `adgroup-image-segment-bind-add requires body.adgroupImageSegmentBindIdTypes` | 漏传必填字段 adgroupImageSegmentBindIdTypes | 按本文「输入字段」补齐 body.adgroupImageSegmentBindIdTypes |
| `adgroup-image-segment-bind-add: adgroupImageSegmentBindIdTypes.adgroupId is required` | 缺少必填字段 | 按本文「输入字段」补齐该字段 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |
| `status=2 code=9012` | 没有操作该用户的权限 | 换有操作权限的子账号，或申请账户权限 |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"adgroup-image-segment-bind-add","confirmWrite":true,"userName":"子账号用户名","body":{"adgroupImageSegmentBindIdTypes":{"adgroupId":1,"segmentId":1}}}'
```
