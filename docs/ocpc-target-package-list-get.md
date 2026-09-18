# 查询oCPC出价策略

## Trigger

用户要求查询oCPC出价策略、出价策略列表、目标转化出价、oCPC策略状态时使用。

## Action

`ocpc-target-package-list-get`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/OcpcService/getTargetPackageList`
- 方法说明：获取oCPC出价策略列表。

## Payload

```json
{
  "action": "ocpc-target-package-list-get",
  "userName": "子账号用户名",
  "body": {
    "targetPackageTypeFields": [
      "targetPackageId",
      "targetPackageName",
      "ocpcBid",
      "ocpcBidType",
      "scope",
      "dataFlowData",
      "assistTransTypes",
      "ocpcDeepCpa",
      "packageStatus",
      "deepTypeStat",
      "deepTransTypeMode",
      "transAsset",
      "transAssetId"
    ],
    "ids": [1],
    "level": 1
  }
}
```

## 行为说明

- `level=1` 时，`ids` 填写 userId，返回该用户下所有 oCPC 出价策略信息。
- `level=2` 时，`ids` 填写 oCPC 出价策略 ID 数组，按策略 ID 查询。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `targetPackageTypeFields` | String[] | 是 | 需要查询的字段 | 取值范围见下方枚举 |
| `ids` | Long[] | 是 | 查询ID | level=1 填 userId；level=2 填策略 ID 数组 |
| `level` | Integer | 是 | 查询层级 | 1-账户 / 2-oCPC出价策略 |

### targetPackageTypeFields 可选枚举

| 字段 | 说明 |
|------|------|
| `targetPackageId` | oCPC出价策略ID |
| `targetPackageName` | oCPC出价策略名称 |
| `ocpcBid` | 目标转化出价（元/转化） |
| `ocpcBidType` | 出价模式（原优化模式） |
| `scope` | 生效范围 |
| `dataFlowData` | 数据来源以及目标转化 |
| `assistTransTypes` | 深度转化类型 |
| `ocpcDeepCpa` | 深度转化出价 |
| `packageStatus` | 出价策略状态 |
| `deepTypeStat` | 深度转化状态 |
| `deepTransTypeMode` | 优化深度转化 |
| `transAsset` | 转化资产类型 |
| `transAssetId` | 转化资产ID |
| `assetType` | 资产类型 |

## 返回字段

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| `targetPackageId` | Long | oCPC出价策略ID | 新增时不填 |
| `targetPackageName` | String | oCPC出价策略名称 | [1, 20] |
| `ocpcBidType` | Integer | 出价模式 | 1-目标转化成本 / 2-增强模式 |
| `ocpcBid` | Double | 目标转化出价 | [0.01, 9999.00] 元；ocpcBidType=1 时必填 |
| `scope` | TargetPackageBindInfo[] | 生效范围 | 绑定的计划列表 |
| `scope[].levelId` | Long | 关联层级的ID（计划ID） | - |
| `scope[].level` | Integer | 关联层级 | 当前仅支持计划层级（2） |
| `dataFlowData` | TargetPackageDataflowInfo[] | 数据来源及目标转化 | - |
| `dataFlowData[].dataFlow` | Integer | 数据来源 | 见下方枚举 |
| `dataFlowData[].transType` | Integer[] | 目标转化类型 | 见下方枚举 |
| `assistTransTypes` | Integer[] | 深度转化类型 | 见下方枚举 |
| `packageStatus` | Integer | 出价策略状态 | 见下方枚举 |
| `ocpcDeepCpa` | Double | 深度转化出价 | [0.01, 9999.00]；等于 0 为自动出价，大于 0 为自定义双出价 |
| `deepTypeStat` | Integer | 深度转化状态 | 1-未生效 / 2-自动优化生效 / 3-双出价生效 / 4-双出价生效 |
| `deepTransTypeMode` | Integer | 优化深度转化 | 0-不使用 / 1-优化转化行为 / 2-优化ROI |
| `transAsset` | Integer | 转化资产类型 | 0-不限 / 1-资产类型 / 2-指定资产 |
| `transAssetId` | Long | 转化资产ID | - |
| `assetType` | Integer[] | 资产类型 | 见下方枚举 |
| `crowdDefinedOcpcBidRatio` | ProjectCrowdDefinedBidRatio[] | 项目精细化出价-自定义人群 | - |

### ocpcBidType 枚举值

| 值 | 说明 |
|---|---|
| 1 | 目标转化成本（原目标转化成本控制） |
| 2 | 增强模式（原点击出价系数控制） |

### dataFlow（数据来源）枚举值

| 值 | 说明 |
|---|---|
| 1 | 网页JS布码 |
| 2 | 线索API |
| 3 | 咨询工具授权 |
| 4 | 基木鱼/度小店 |
| 5 | 应用API |
| 6 | 电话数据授权 |
| 7 | 百度智能小程序SDK |
| 8 | 应用SDK |

### transType（目标转化类型）枚举值

| 值 | 说明 |
|---|---|
| 1 | 咨询按钮点击 |
| 2 | 电话按钮点击 |
| 3 | 表单提交成功 |
| 4 | APP激活 |
| 5 | 表单按钮点击 |
| 6 | 下载（预约）按钮点击 |
| 7 | 购买按钮点击 |
| 8 | 短信咨询按钮点击 |
| 10 | 购买成功 |
| 14 | 订单提交成功 |
| 17 | 三句话咨询 |
| 18 | 留线索 |
| 20 | 深度页面访问 |
| 25 | APP注册 |
| 26 | APP付费 |
| 27 | 客户自定义 |
| 28 | 次日留存 |
| 30 | 电话拨通 |
| 35 | 微信复制按钮点击 |
| 41 | 申请小额贷款 |
| 42 | 小额贷款授信 |
| 45 | 商品下单成功 |
| 46 | 加入购物车 |
| 49 | 注册激活后登录 |
| 50 | 预约 |
| 52 | 深度使用 |
| 57 | 调起点击 |
| 67 | 微信调起按钮点击 |
| 68 | 粉丝关注成功 |
| 71 | [小流量]应用调起 |
| 72 | 聊到相关业务 |
| 73 | [小流量]回访-电话接通 |
| 74 | [小流量]回访-信息确认 |
| 75 | [小流量]回访-发现意向 |
| 76 | [小流量]回访-高潜成交 |
| 77 | [小流量]回访-成单客户 |
| 78 | 电商店铺停留 |
| 79 | 微信加粉成功 |
| 89 | 放款 |
| 90 | 商品支付成功 |
| 92 | [小流量]回访-有效咨询 |
| 99 | 其他 |
| 117 | [小流量]进件 |
| 120 | 综合线索收集 |

### assistTransTypes（深度转化类型）枚举值

| 值 | 说明 |
|---|---|
| 9 | 电商订单 |
| 10 | 购买成功 |
| 14 | 订单提交成功 |
| 18 | 留线索 |
| 25 | APP注册 |
| 26 | APP付费 |
| 28 | 次日留存 |
| 30 | 电话拨通 |
| 42 | 小额贷款授信 |
| 49 | 注册激活后登录 |
| 50 | 预约 |
| 52 | 深度使用 |
| 72 | 聊到相关业务 |

### packageStatus 枚举值

| 值 | 说明 |
|---|---|
| 0 | 未生效 |
| 1 | 投放中 |
| 2 | 投放中（学习中） |
| 3 | 投放中（学习失败） |
| 4 | 投放中（学习结束） |

### assetType 枚举值

| 值 | 说明 |
|---|---|
| 1 | 应用APP |
| 2 | 自建站 |
| 3 | 基木鱼 |
| 4 | 百度健康商城 |
| 5 | 百度APP |
| 6 | 爱采购 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `status=2 code=9013` `system error.` | **实测：缺少必填参数时接口不做参数校验，直接抛系统错误** | 按本文「输入字段」补齐参数；看到 9013 先怀疑参数缺失，不要按"服务端故障"重试 |
| `status=0` 但 `rows=0` | 该账户还没有出价策略 | 先用空条件确认 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> 本表错误码为 **2026-09-18 对该账号受控故障注入的实测结果**（空 body / 错字段名 / 不存在的 ID），非推断。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"ocpc-target-package-list-get","userName":"子账号用户名","body":{"targetPackageTypeFields":["targetPackageId","targetPackageName","ocpcBid","ocpcBidType","scope","dataFlowData","assistTransTypes","ocpcDeepCpa","packageStatus","deepTypeStat","deepTransTypeMode","transAsset","transAssetId"],"ids":[1],"level":1}}'
```
