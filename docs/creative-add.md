# 添加基础创意

## Trigger

用户要求添加创意、新增创意、创建创意，并已确认计划 ID、单元 ID、创意标题、描述和访问网址时使用。

## Action

`creative-add`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/CreativeService/addCreative`
- 方法说明：新增推广创意。创意内容需遵循平台统一填写规范。
- 针对审核问题，可通过预审接口提前检查物料，通过预审的物料可最大程度避免审核下线。

## Payload

```json
{
  "action": "creative-add",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "creativeTypes": [
      {
        "campaignId": 149248725,
        "adgroupId": 5780330358,
        "title": "xx创意标题",
        "description1": "针对数据不完整情况,我们有成熟的解决方案,让{数据}完整恢复",
        "description2": "恢复成功才收费 {中毒}数据恢复 值得信赖",
        "mobileDestinationUrl": "https://aisite.wejianzhan.com/site/abcd.com/46aa6sssd1b-d206-4dfc-999a-7b8b487aab5d",
        "mobileDisplayUrl": "abcd.com",
        "pcDestinationUrl": "https://aisite.wejianzhan.com/site/abcd.com/46aa6sssd1b-d206-4dfc-999a-7b8b487aab5d",
        "pcDisplayUrl": "abcd.com"
      }
    ]
  }
}
```

## 安全要求

- 该接口会创建真实投放对象。
- 执行前必须确认账号、计划 ID、单元 ID、创意标题/描述、访问网址和回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 填写规范

创意标题/描述中不允许含有以下符号：
- 英文符号：`[ <>_「」［］〈〉【】[]]+`
- 中文符号：`[''\""。＋，－？＿]+`
- 空格

## 输入字段

`creativeTypes` 必填 `CreativeType[]`，集合长度限制：[1, 3000]，建议分批多次请求。

### CreativeType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `campaignId` | Long | 是 | 计划ID | - |
| `adgroupId` | Long | 是 | 推广单元ID | - |
| `title` | String | 是 | 创意标题 | [9, 50] 字节（中文 2 字节，英文/数字 1 字节，通配符不计入） |
| `description1` | String | 是 | 创意描述第一行 | [9, 80] 字节（中文 2 字节，英文/数字 1 字节，通配符不计入） |
| `description2` | String | - | 创意描述第二行 | [0, 80] 字节（中文 2 字节，英文/数字 1 字节，通配符不计入） |
| `mobileDestinationUrl` | String | 是 | 移动访问网址 | [1, 1024] 字节；域名需与账户注册域名相同 |
| `mobileDisplayUrl` | String | 是 | 移动显示网址 | [1, 36] 字节；取值为账户注册域名本身（对应 account-get 的 regDomain） |
| `pcDestinationUrl` | String | 是 | 计算机访问网址 | [1, 1024] 字节；域名需与账户注册域名相同 |
| `pcDisplayUrl` | String | 是 | 计算机显示网址 | [1, 36] 字节；取值为账户注册域名本身（对应 account-get 的 regDomain） |
| `tabs` | Integer[] | - | 标签 | 同一创意最多 30 个标签；每个标签 ID 取值 [0, 30]；0 表示无标签 |
| `deeplink` | String | - | 应用调起网址 | 最大 2048 字节；小流量功能，需向营销顾问申请 |
| `ulink` | String | - | ios应用调起 | 最大 4096 字符；小流量功能，需向营销顾问申请；仅支持商品目录营销目标 |
| `miniProgramUrl` | String | - | 小程序访问网址 | 最大 1024 字节 |
| `pcFinalUrl` | String | - | 计算机最终访问网址 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `pcTrackParam` | String | - | 计算机监控后缀 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `pcTrackTemplate` | String | - | 计算机第三方追踪模板 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileFinalUrl` | String | - | 移动最终访问网址 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileTrackParam` | String | - | 移动监控后缀 | 仅适用于：网站链接、电商店铺推广、应用推广 |
| `mobileTrackTemplate` | String | - | 移动第三方追踪模板 | 仅适用于：网站链接、电商店铺推广、应用推广 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `creativeId` | Long | 新创建的创意ID |
| `campaignId` | Long | 计划ID |
| `adgroupId` | Long | 推广单元ID |
| `title` | String | 创意标题 |
| `description1` | String | 创意描述第一行 |
| `description2` | String | 创意描述第二行 |
| `mobileDestinationUrl` | String | 移动访问网址 |
| `mobileDisplayUrl` | String | 移动显示网址 |
| `pcDestinationUrl` | String | 计算机访问网址 |
| `pcDisplayUrl` | String | 计算机显示网址 |
| `tabs` | Integer[] | 标签 |
| `deeplink` | String | 应用调起网址 |
| `miniProgramUrl` | String | 小程序访问网址 |
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
| `creative-add requires body.creativeTypes` | 漏传必填字段 creativeTypes | 按本文「输入字段」补齐 body.creativeTypes |
| `creative-add: creativeTypes max 3000 per request` | 单次提交数量超过上限 3000 | 分批提交，每批 ≤ 3000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |
| `status=2 code=90124` | 没有操作创意的权限 | 确认目标账户的创意操作权限 |
| `status=2 code=9012` | 没有操作该用户的权限 | 换有操作权限的子账号，或申请账户权限 |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"creative-add","confirmWrite":true,"userName":"子账号用户名","body":{"creativeTypes":[{"campaignId":149248725,"adgroupId":5780330358,"title":"xx创意标题","description1":"针对数据不完整情况,我们有成熟的解决方案,让{数据}完整恢复","description2":"恢复成功才收费 {中毒}数据恢复 值得信赖","mobileDestinationUrl":"https://aisite.wejianzhan.com/site/abcd.com/46aa6sssd1b-d206-4dfc-999a-7b8b487aab5d","mobileDisplayUrl":"abcd.com","pcDestinationUrl":"https://aisite.wejianzhan.com/site/abcd.com/46aa6sssd1b-d206-4dfc-999a-7b8b487aab5d","pcDisplayUrl":"abcd.com"}]}}'
```
