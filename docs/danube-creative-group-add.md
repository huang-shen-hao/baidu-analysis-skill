# 新建创意组

## Trigger

用户要求新建创意组、创建高级样式创意组时使用。

## Action

`danube-creative-group-add`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/DanubeCreativeGroupService/addDanubeCreativeGroup`
- 方法说明：新建创意组。

## Payload

```json
{
  "action": "danube-creative-group-add",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "creativeGroupTypes": [
      {
        "creativeGroupName": "测试创意组",
        "bindingRange": [{ "userId": 123456 }],
        "materialTypes": [3037],
        "category": [2880, 2881],
        "creativeComponents": {
          "plas": [
            {
              "mtId": 3037,
              "content": [
                { "image": [{ "imageId": 1509701499 }] },
                { "image": [{ "imageId": 1508578678 }] }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

## 安全要求

- 该接口会创建真实投放对象。
- 执行前必须确认账号、创意组名称、绑定范围、投放样式、组件内容和回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 行为说明

- 新增创意组时最多支持 10 个。
- `materialTypes` 需与 `creativeComponents` 中设置的样式一致，全部样式信息可通过 `danube-constants-get` 查询。
- `category` 行业信息可通过 `danube-constants-get` 查询。

## 输入字段

`creativeGroupTypes` 必填 `DanubeCreativeGroupType[]`，最多 10 个。

### DanubeCreativeGroupType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `creativeGroupName` | String | 是 | 创意组名称 | [1, 20] 字节（中文 2 字节，英文/数字 1 字节） |
| `bindingRange` | DanubeWebPlanRangeItemType[] | 是 | 绑定范围 | 最多 100 个计划和 1000 个单元 |
| `materialTypes` | Integer[] | 是 | 投放样式 | 取值范围见下方枚举 |
| `category` | Long[] | 是 | 行业 | 由总体行业至细分行业依次填写，如 [2880, 2881] |
| `creativeComponents` | DanubeCreativeComponent | 是 | 样式-组件信息 | 因样式类型而异 |

### bindingRange 说明

- 绑定账户：`[{"userId": 5962578}]`
- 绑定计划：`[{"campaignId": 91100082}]`
- 绑定单元：`[{"adgroupId": 4502837792}]`
- 绑定账户时不能同时绑定计划和单元；绑定计划时不能同时绑定该计划下的单元。

### materialTypes 可选枚举

| 值 | 说明 | 设备 |
|---|---|---|
| 3011 | 导航 | 计算机 |
| 3015 | 图加导航 | 计算机 |
| 1046 | 搜索头条 | 计算机 |
| 3196 | 行行通 | 计算机 |
| 3007 | 站内直达 | 计算机 |
| 3228 | 高级图文 | 计算机 |
| 3002 | 图文 | 计算机 |
| 3003 | 商品列表 | 计算机 |
| 3148 | 全息 | 计算机 |
| 1061 | 全息摘要 | 计算机 |
| 3124 | 热点橱窗 | 计算机 |
| 3120 | 商品橱窗 | 计算机 |
| 3036 | 爆款单品橱窗 | 计算机 |
| 11051 | 多品活动大图 | 计算机 |
| 11050 | 单品活动大图 | 计算机 |
| 3051 | 站内直达高级版 | 移动 |
| 3017 | 综合导航 | 移动 |
| 3010 | 文本导航 | 移动 |
| 3008 | 站内直达 | 移动 |
| 3041 | 搜索头条 | 移动 |
| 3004 | 行行通 | 移动 |
| 3149 | 全息 | 移动 |
| 1051 | 全息摘要 | 移动 |
| 1060 | 点睛 | 移动 |
| 3198 | 热点橱窗 | 移动 |
| 3138 | 商品橱窗 | 移动 |
| 3037 | 全景橱窗 | 移动 |
| 3035 | 爆款单品橱窗 | 移动 |
| 9050 | 爆款单品橱窗 | 移动 |
| 3128 | 商品列表 | 移动 |
| 11019 | 活动大图 | 移动 |

### creativeComponents 支持的组件类型

| 类型 | 说明 |
|------|------|
| `category` | 子链组件 |
| `image` | 图片组件 |
| `selectList` | 选择列表组件 |
| `textList` | 文字组件 |
| `plas` | 橱窗组件 |
| `list` | 列表组件 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `creativeGroupName` | String | 创意组名称 |
| `bindingRange` | DanubeWebPlanRangeItemType[] | 绑定范围 |
| `materialTypes` | Integer[] | 投放样式 |
| `category` | Long[] | 行业 |
| `creativeComponents` | DanubeCreativeComponent | 样式-组件信息 |
| `bindingLevel` | String | 绑定层级（USER/PLAN） |
| `device` | Integer | 投放设备 |
| `status` | Integer | 状态 |
| `pause` | Boolean | 暂停状态 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `danube-creative-group-add requires body.creativeGroupTypes` | 漏传必填字段 creativeGroupTypes | 按本文「输入字段」补齐 body.creativeGroupTypes |
| `danube-creative-group-add: creativeGroupTypes max 10 per request` | 单次提交数量超过上限 10 | 分批提交，每批 ≤ 10 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"danube-creative-group-add","confirmWrite":true,"userName":"子账号用户名","body":{"creativeGroupTypes":[{"creativeGroupName":"测试创意组","bindingRange":[{"userId":123456}],"materialTypes":[3037],"category":[2880,2881],"creativeComponents":{"plas":[{"mtId":3037,"content":[{"image":[{"imageId":1509701499}]},{"image":[{"imageId":1508578678}]}]}]}}]}}'
```
