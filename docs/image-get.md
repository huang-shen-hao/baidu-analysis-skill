# 查询图片

## Trigger

用户要求查询图片素材、按图片ID/尺寸/大小/格式/添加时间筛选图片、查看我的图库时使用。

## Action

`image-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/ImageManageService/getImageList`
- 方法说明：查询图片，支持根据图片ID、图片尺寸、图片大小等筛选条件查询。

> 本 action 属于「资产管理 · 图片管理」体系，替代已下线的 `image-segment-get`（创意配图管理 / ImageSegmentService）。

## Payload

```json
{
  "action": "image-get",
  "userName": "子账号用户名",
  "body": {
    "filters": [
      { "field": "height", "op": "eq", "values": [720] }
    ],
    "pageNo": 1,
    "pageSize": 20
  }
}
```

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `filters` | FilterCondition[] | - | 过滤条件 | 见下方字段表 |
| `filters[].field` | String | 是 | 过滤字段 | 见下方 field 说明 |
| `filters[].op` | OperationType | 是 | 操作符 | `eq` 等于 / `in` 包含 / `ge` 大于等于 / `gt` 大于 / `le` 小于等于 / `lt` 小于 / `bt` 在范围内 |
| `filters[].values` | String[] | 是 | 过滤值 | 非空 |
| `pageNo` | Integer | - | 当前页码 | 默认 1 |
| `pageSize` | Integer | - | 每页条数 | 默认 40，取值范围 (0, 1000) |

### field 说明

| field | 类型 | 说明 | 支持的操作符 |
|------|------|------|------|
| `imageId` | String | 图片ID | `eq` / `in`（数量限制 0 < n ≤ 100） |
| `width` | Integer | 图片宽 | `eq` / `in` / `ge` / `gt` / `le` / `lt` / `bt` |
| `height` | Integer | 图片高 | `eq` / `in` / `ge` / `gt` / `le` / `lt` / `bt` |
| `size` | Integer | 图片大小 | `eq` / `in` / `ge` / `gt` / `le` / `lt` / `bt` |
| `format` | String | 图片格式（jpg / png） | `eq` / `in` |
| `resolution` | String | 分辨率，格式 `width*height`，如 `["960*640"]` | `eq` / `in` |
| `addtime` | String | 添加时间，格式 `yyyy-MM-dd HH:mm:ss` | `bt` / `eq` |
| `isCollect` | String | 是否收藏，"true" / "false" | `eq` |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `listData` | List\<ImageType\> | 图片列表 |
| `totalCount` | Integer | 数据总数 |
| `pageNo` | Integer | 当前页 |

### ImageType

| 字段 | 类型 | 说明 |
|------|------|------|
| `imageId` / `width` / `height` / `size` | - | 图片ID与尺寸信息 |
| `url` | String | 图片 URL（仅预览用，不保证唯一） |
| `format` | String | jpg / jpeg / png |
| `signature` | String | 图片 MD5 |
| `imageName` | String | 图片名称；**名称为空时不返回该字段** |
| `addTime` / `modTime` | Date | `yyyy-MM-dd HH:mm:ss` |
| `isCollect` | Boolean | 是否收藏 |
| `sourceType` | Integer | 来源类型：0/1-本地上传，3~16-图片工具，9-版权图片，10-站点挖掘，11-视频抽帧 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `BAIDU_USAGE_ERR: field must be one of ...` | `filters[].field` 不在白名单 | 仅支持 `imageId` / `width` / `height` / `size` / `format` / `resolution` / `addtime` / `isCollect` |
| `pageSize must be in (0, 1000)` | 页大小越界 | 取 1–999，默认 40 |
| `imageId 过滤数量上限为 100` | 一次查询的图片 ID 过多 | 分批查询，每批 ≤ 100 |
| 返回条目里没有 `imageName` | 该图片上传时未设置名称 | 正常现象：官方只在有名称时返回该字段 |

> **来源**：错误码来自脚本校验器与百度官方错误码表（节点 166），**未经逐条实测**。
> 本接口的实测观测见对应条目；如需复现可用受控故障注入（空 body / 错字段名）。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"image-get","userName":"子账号用户名","body":{"filters":[{"field":"imageId","op":"in","values":["2312380","2312381"]}],"pageNo":1,"pageSize":20}}'
```

> 分页结果较大时优先用小 `pageSize` 多页拉取，避免单次返回过大。
