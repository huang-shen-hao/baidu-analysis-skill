# 已下线但仍可用的接口：保留原因与新旧能力差异

> 本文件只在需要处理 `image-segment-*` / `adgroup-image-segment-bind-*` 这 7 个 action 时读取。

## 一、为什么保留

官方文档（节点 211 / 212）标注「创意配图管理 / 创意配图绑定管理」于 **2023-04-19 下线**。
但 2026-09-18 用真实账号实测：**URL 路由仍注册，接口返回 `status=0` 与真实业务数据**（绑定查询返回 2 条记录）。因此本 skill **保留这 7 个 action 可用**，只在每次调用输出 `deprecated: true` 与告警。

风险：Baidu 可能随时真正停服，且不再有官方文档支持。**新流程请使用替代接口。**

## 二、迁移对照

| 已下线（保留） | 替代 action | 迁移要点 |
|---|---|---|
| `image-segment-get` | `image-get` | 资产管理 · 查询图片 |
| `image-segment-add` | `image-upload` | 资产管理 · 上传图片 |
| `image-segment-update` | `image-update` | ⚠️ 新接口只能改图片名称与收藏，**改不了主题与启停** |
| `image-segment-delete` | `image-delete` | 资产管理 · 删除图片 |
| `adgroup-image-segment-bind-get` | `segment-bind-get` | ⚠️ 绑定对象由「素材ID」变为「组件ID」 |
| `adgroup-image-segment-bind-add` | `segment-bind-add` | ⚠️ 需先创建组件（`segmentType` 100/101/320/321），再绑定到单元 |
| `adgroup-image-segment-bind-delete` | `segment-bind-delete` | 按 `bindId` 删除 |

## 三、新旧接口能力对照（实测字段）

### 图片层：`image-segment-*` → `image-*`

| 能力 | 旧（创意配图素材） | 新（图片管理） | 是否等价 |
|---|---|---|---|
| 上传转链 | `srcImageContent` → url + MD5 | `content` → url + `signature` | 等价 |
| 查询列表 | 按 `segmentIds` / `segmentFields` | 按尺寸/大小/格式/时间/收藏筛选 | 大体等价（新的多了宽高、来源、感知哈希） |
| 删除 | `segmentIds` | `imageIds` | 等价 |
| 图片主题 / 素材启停 | `desc` + `status` | 只有 `imageName` + `collect` | **不等价** |
| 审核状态 / 拒绝理由 | `auditStatus` + `reasonText` | **无对应字段** | **缺失** |

### 绑定层：`adgroup-image-segment-bind-*` → `segment-bind-*`

实测同一单元下两个接口返回的字段：

| | 返回字段 |
|---|---|
| 旧 | `bindId, adgroupId, segmentId, desc, url, segmentType, segmentSign, segmentStatus, auditStatus` |
| 新 | `bindId, adgroupId, segmentType, bindSource, isDelete, segmentId, campaignId, campaignName, adgroupName, id` |

新接口查询**拿不到图片 url / 主题 / MD5 / 审核状态**，需要用 `segmentId` 再查一次组件明细（`segment-get` 的 `auditContent.picUrl` / `desc` / `pause` / `status`）；即便如此，**审核状态与拒绝理由在新链路上依旧没有等价字段**。

## 四、结论

绑定与解绑动作等价，但「这个单元挂了哪些图片、长什么样、审没审过」这类运维查询，新链路需要二次查询且审核信息不完整。**在迁移前请确认新链路能否满足你的审核类需求。**

## 相关文档

- [故障排查手册](./troubleshooting-guide.md)
- [百度营销 Skill 执行标准](./execution-standard.md)
