# 更新oCPC出价策略

## Trigger

用户要求更新oCPC出价策略、修改目标转化出价、修改生效范围、修改深度转化出价时使用。

## Action

`ocpc-target-package-list-update`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/OcpcService/updateTargetPackage`
- 方法说明：编辑oCPC出价策略。
- 2023年2月28日起，出价策略与推广计划转化目标设置规则升级。

## Payload

```json
{
  "action": "ocpc-target-package-list-update",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "targetPackageType": [
      {
        "targetPackageId": 1,
        "targetPackageName": "修改策略名",
        "ocpcBidType": 1,
        "ocpcBid": 50.0,
        "scope": [{ "levelId": 149248725, "level": 2 }],
        "ocpcDeepCpa": 0,
        "deepTransTypeMode": 0,
        "transAsset": 0
      }
    ]
  }
}
```

## 安全要求

- 该接口会修改真实出价策略，直接影响出价和花费。
- 执行前必须确认账号、策略 ID、修改内容和回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 行为说明

- 单次最多修改 20 个策略，集合长度 [1, 20]。
- 与 add 不同：不支持修改 `dataFlowData`（数据来源和目标转化），也不支持修改 `assistTransTypes`（深度转化类型）。
- 数据源需在搜索推广平台网页端-工具中心-转化追踪页面新建后才能使用。

## 输入字段

`targetPackageType` 必填 `TargetPackageType[]`，集合长度 [1, 20]。

### TargetPackageType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `targetPackageId` | Long | 是 | oCPC出价策略ID | - |
| `targetPackageName` | String | - | oCPC出价策略名称 | [1, 20] |
| `ocpcBidType` | Integer | - | 出价模式 | 1-目标转化成本 / 2-增强模式 |
| `ocpcBid` | Double | - | 目标转化出价 | [0.01, 9999.00] 元；ocpcBidType=1 时必填 |
| `scope` | TargetPackageBindInfo[] | - | 生效范围（绑定的计划） | - |
| `scope[].levelId` | Long | - | 关联层级的ID（计划ID） | - |
| `scope[].level` | Integer | - | 关联层级 | 当前仅支持 2（计划层级） |
| `ocpcDeepCpa` | Double | - | 深度转化出价 | [0.01, 9999.00]；等于 0 为自动出价，大于 0 为自定义双出价 |
| `deepTransTypeMode` | Integer | - | 优化深度转化 | 0-不使用 / 1-优化转化行为 / 2-优化ROI |
| `transAsset` | Integer | - | 转化资产类型 | 0-不限 / 1-资产类型 / 2-指定资产 |
| `transAssetId` | Integer | - | 转化资产ID | transAsset=2 时必填 |
| `assetType` | Integer[] | - | 资产类型 | 见下方枚举 |
| `crowdDefinedOcpcBidRatio` | ProjectCrowdDefinedBidRatio[] | - | 项目精细化出价-自定义人群 | - |

### marketingTargetId（营销目标）枚举值

| 值 | 说明 |
|---|---|
| 1 | 应用推广 |
| 2 | 本地门店 |
| 4 | 电商店铺 |
| 5 | 商品目录 |
| 7 | 销售线索（默认） |

### assetType 枚举值

| 值 | 说明 |
|---|---|
| 1 | 应用APP |
| 2 | 自建站 |
| 3 | 基木鱼 |
| 4 | 百度健康商城 |
| 5 | 百度APP |
| 6 | 爱采购 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `targetPackageId` | Long | oCPC出价策略ID |
| `targetPackageName` | String | oCPC出价策略名称 |
| `ocpcBidType` | Integer | 出价模式 |
| `ocpcBid` | Double | 目标转化出价 |
| `scope` | TargetPackageBindInfo[] | 生效范围 |
| `dataFlowData` | TargetPackageDataflowInfo[] | 数据来源及目标转化（只读） |
| `assistTransTypes` | Integer[] | 深度转化类型（只读） |
| `packageStatus` | Integer | 出价策略状态 |
| `ocpcDeepCpa` | Double | 深度转化出价 |
| `deepTypeStat` | Integer | 深度转化状态 |
| `deepTransTypeMode` | Integer | 优化深度转化 |
| `transAsset` | Integer | 转化资产类型 |
| `transAssetId` | Integer | 转化资产ID |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `ocpc-target-package-list-update requires body.targetPackageTypes` | 漏传必填字段 targetPackageTypes | 按本文「输入字段」补齐 body.targetPackageTypes |
| `ocpc-target-package-list-update: targetPackageTypes max 20 per request` | 单次提交数量超过上限 20 | 分批提交，每批 ≤ 20 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"ocpc-target-package-list-update","confirmWrite":true,"userName":"子账号用户名","body":{"targetPackageType":[{"targetPackageId":1,"targetPackageName":"修改策略名","ocpcBid":50.0,"scope":[{"levelId":149248725,"level":2}],"ocpcDeepCpa":0,"deepTransTypeMode":0,"transAsset":0}]}}'
```
