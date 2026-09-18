# 查询基础创意

## Trigger

用户要求查询创意、创意列表、创意标题、创意描述、创意状态、创意网址时使用。

## Action

`creative-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/CreativeService/getCreative`
- 方法说明：查询推广创意。

## Payload

```json
{
  "action": "creative-get",
  "userName": "子账号用户名",
  "body": {
    "creativeFields": [
      "creativeId",
      "title",
      "description1",
      "description2",
      "adgroupId",
      "mobileDestinationUrl",
      "pcDestinationUrl",
      "pcDisplayUrl",
      "mobileDisplayUrl",
      "pause",
      "status",
      "tabs",
      "pcFinalUrl",
      "pcTrackParam",
      "pcTrackTemplate",
      "mobileFinalUrl",
      "mobileTrackParam",
      "mobileTrackTemplate"
    ],
    "idType": 7,
    "ids": [49306215638],
    "getTemp": 0
  }
}
```

## 行为说明

- `idType=5` 时，`ids` 为单元 ID，可查询该单元下所有创意（不超过 1000 个单元 ID）。
- `idType=7` 时，`ids` 为创意 ID，直接查询创意（不超过 3000 个创意 ID），建议分批多次请求。
- `getTemp` 默认为 0（查询创意本身）。设为 1 可查询创意影子。想要获得创意全集，需分别以 `getTemp=0` 和 `getTemp=1` 调用两次。
- 影子说明：创意 A 审核通过后，若修改影响审核状态的字段（如文案、URL），修改后的创意为 A'（影子），A' 审核通过生效前线上仍为 A。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `creativeFields` | String[] | 是 | 查询推广创意字段 | 取值范围见下方字段枚举 |
| `ids` | Long[] | 是 | 查询 ID 集合 | idType=5 时为单元 ID，不超过 1000 个；idType=7 时为创意 ID，不超过 3000 个 |
| `idType` | Integer | 是 | 查询 ID 类型 | 5-单元ID / 7-创意ID |
| `getTemp` | Integer | - | 是否获取创意影子 | 默认 0；0-只查询创意本身 / 1-只查询创意影子 |

### creativeFields 可选枚举

| 字段 | 说明 |
|------|------|
| `creativeId` | 创意ID |
| `adgroupId` | 推广单元ID |
| `title` | 创意标题 |
| `pause` | 暂停/启用创意 |
| `status` | 创意状态 |
| `description1` | 创意描述第一行 |
| `description2` | 创意描述第二行 |
| `pcDestinationUrl` | 计算机访问网址 |
| `pcDisplayUrl` | 计算机显示网址 |
| `mobileDestinationUrl` | 移动访问网址 |
| `mobileDisplayUrl` | 移动显示网址 |
| `tabs` | 标签 |
| `miniProgramUrl` | 小程序访问网址 |
| `offlineReasons` | 推广下线原因 |
| `deeplink` | 应用调起网址 |
| `ulink` | ios应用调起网址（小流量功能，需向营销顾问申请） |
| `createTime` | 添加时间 |
| `pcFinalUrl` | 计算机最终访问网址 |
| `pcTrackParam` | 计算机监控后缀 |
| `pcTrackTemplate` | 计算机第三方追踪模板 |
| `mobileFinalUrl` | 移动最终访问网址 |
| `mobileTrackParam` | 移动监控后缀 |
| `mobileTrackTemplate` | 移动第三方追踪模板 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `creativeId` | Long | 创意ID |
| `adgroupId` | Long | 推广单元ID |
| `title` | String | 创意标题 |
| `description1` | String | 创意描述第一行 |
| `description2` | String | 创意描述第二行 |
| `pause` | Boolean | 暂停/启用创意 |
| `status` | Integer | 创意状态 |
| `pcDestinationUrl` | String | 计算机访问网址 |
| `pcDisplayUrl` | String | 计算机显示网址 |
| `mobileDestinationUrl` | String | 移动访问网址 |
| `mobileDisplayUrl` | String | 移动显示网址 |
| `offlineReasons` | OfflineReason[] | 推广下线原因 |
| `tabs` | Integer[] | 标签 |
| `deeplink` | String | 应用调起网址 |
| `miniProgramUrl` | String | 小程序访问网址 |
| `createTime` | String | 创意创建时间 |
| `pcFinalUrl` | String | 计算机最终访问网址 |
| `pcTrackParam` | String | 计算机监控后缀 |
| `pcTrackTemplate` | String | 计算机第三方追踪模板 |
| `mobileFinalUrl` | String | 移动最终访问网址 |
| `mobileTrackParam` | String | 移动监控后缀 |
| `mobileTrackTemplate` | String | 移动第三方追踪模板 |

### OfflineReason（下线原因）

| 字段 | 类型 | 说明 |
|------|------|------|
| `mainReason` | String | 推广下线主要原因ID，值为 "3" 时代表审核不通过 |
| `detailReason` | String | 推广下线具体原因，JSON 字符串，解析后为嵌套数组，内层第一个元素为具体拒绝理由 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=2 code=9011519` `Request field is invalid` | 空 body，或字段名拼错 | 必须传 `creativeFields` 等接口支持的字段 |
| `status=0` 但 `rows=0` | 当前账号在该条件下没有创意 | 先用空条件确认账号下有无创意 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> 本表错误码为 **2026-09-18 对该账号受控故障注入的实测结果**（空 body / 错字段名 / 不存在的 ID），非推断。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"creative-get","userName":"子账号用户名","body":{"creativeFields":["creativeId","title","description1","description2","adgroupId","mobileDestinationUrl","pcDestinationUrl","pcDisplayUrl","mobileDisplayUrl","pause","status","tabs","pcFinalUrl","pcTrackParam","pcTrackTemplate","mobileFinalUrl","mobileTrackParam","mobileTrackTemplate"],"idType":7,"ids":[49306215638],"getTemp":0}}'
```
