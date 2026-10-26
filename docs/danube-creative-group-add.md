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
        "creativeGroupName": "爆款橱窗-测试",
        "bindingRange": [{ "campaignId": 2249234135 }],
        "materialTypes": [3036],
        "category": [4165, 4171],
        "creativeComponents": {
          "plas": [
            {
              "mtId": 3036,
              "content": [
                { "image": [{ "imageId": 5735268338 }], "url": "https://www.esign.cn/", "name": "电子签章", "desc": "合规有效" },
                { "image": [{ "imageId": 5735269236 }], "url": "https://www.esign.cn/", "name": "电子合同", "desc": "在线签署" },
                { "image": [{ "imageId": 5735269560 }], "url": "https://www.esign.cn/", "name": "合同管理", "desc": "全流程" },
                { "image": [{ "imageId": 5735269910 }], "url": "https://www.esign.cn/", "name": "电子公章", "desc": "用印管控" }
              ]
            }
          ],
          "selectList": [
            {
              "mtId": 3036,
              "content": [
                { "key": "合规", "value": "符合电子签名法" },
                { "key": "效率", "value": "分钟级完成签署" },
                { "key": "安全", "value": "全链路存证" },
                { "key": "适用", "value": "人力采购销售合同" }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

> 三个最容易踩的点：① `bindingRange` 用 `campaignId`（3036/3148/3149 都是 PLAN 级，绑 `userId` 会一路过校验、最后只报 9011862000000）；
> ② `image` 里传 **`imageId`**（`url` 是只读返回字段，传 url 等于没传图）；③ `content` 条数必须落在样式的 min–max 区间（3036 恰好 4 / 4）。

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
- 绑定单元：`[{"adgroupId": 4502837792, "campaignId": 91100082}]`（官方要求同时填所属计划 ID，官方示例漏写了）
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

### 组件对象（官方节点 842「高级样式数据对象」）

每个组件块是 `{ "mtId": <样式ID>, "content": ... }`，`mtId` 必须属于本组的 `materialTypes`。
`plas` / `image` / `selectList` / `textList` 的 `content` 是**数组**；`category`（`Category`）和 `list`（`ListType`）的 `content` 是**单个对象**（官方节点 842），写成数组会被本地校验拦下。

| 组件键 | content 元素 | 字段（必填加粗） |
|---|---|---|
| `plas` | `Plas` | **`image`**（`Image[]` 且每项 **`imageId`** 必填）；`url`、`name`、`desc` 是否必填看样式（见下表），`swanUrl`、`deepLink`、`ulink` 选填 |
| `image` | `Image` | **`imageId`**；`url`、`cutTop/cutLeft/cutWidth/cutHeight`、`viewWidth/viewHeight`、`originWidth/originHeight` 全部**只读**（查询时返回，提交不要传） |
| `selectList` | `SelectList` | **`key`**、**`value`**（`value` 1–23 字符，`key`/`value` 组内不可重复） |
| `category` | `Category`（对象）→ `subLinks[]` → `textLink[]` | `industry`；`subLinks[].label`、`subLinks[].textLink[]`；`textLink[].text`、`textLink[].linkUrl`、`swanUrl`、`moreLink` |
| `textList` | String | 每项非空字符串 |
| `list` | `ListType`（对象） | `industry`、`labels[]`、`slogan`、**`rows[]`**（商品行：`productName`、`productUrl`、`targetUrl`、`labels[]` 等）；每行 `labels` 长度须与外层 `labels` 一致 |

### 各样式组件要求（运行时核实 2026-10-22）

官方 add 页只写「各样式对组件的填写要求不同」，具体数量只能从 `danube-constants-get` 返回的 `config` 里拿。下表是实测值（`minSize–maxSize`，等值即"必须正好这么多个"）。数组型组件数的是 `content` 条数，`category` / `list` 数的是组件块个数：

| 样式 | 设备 | 组件与数量 | 必填字段 | bindingLevel |
|---|---|---|---|---|
| 3036 爆款单品橱窗 | PC | `plas` 4、`selectList` 4 | plas: `image.url`、`url`；selectList: `key`、`value` | PLAN |
| 3035 爆款单品橱窗 | 移动 | `plas` 3–8、`selectList` 2–4 | 同上 | PLAN |
| 3037 全景橱窗 | 移动 | `plas` 3 | `image.url` | PLAN |
| 3198 热点橱窗 | 移动 | `plas` 3–8 | `image.url`、`name`、`url` | PLAN |
| 3138 商品橱窗 | 移动 | `plas` 3–8 | `image.url`、`name`、`desc`、`url` | PLAN |
| 9050 爆款单品橱窗（官方枚举名；官方示例标题写「图文（计算机）」） | 移动 | `plas` 4–8 | `image.url`、`name`、`url` | PLAN |
| 3120 商品橱窗 | PC | `plas` 4 | `image.url`、`name`、`desc`、`url` | PLAN |
| 3124 热点橱窗 | PC | `plas` 4、`category` 1（子链 3–15） | plas: 四项全填；category: `industry`/`label`/`text`/`linkUrl` | PLAN |
| 3148 全息 | PC | `image` + `selectList` 4 | selectList: `key`、`value` | PLAN |
| 3149 全息 | 移动 | `image` + `selectList` 2 + `category` 1（子链 2–4） | category: `text`（**4–12 字节，即 2–6 个汉字**）、`linkUrl` | PLAN |
| 3003 商品列表 | PC | `list` 1 块，`rows` 1–4 行 | `industry`、`label`、`text`、`linkUrl` | PLAN |
| 3128 商品列表 | 移动 | `list` 1 块，`rows` 1–2 行 | 同上 | PLAN |

> 表里的样式 `bindingLevel` 全是 **PLAN**：`bindingRange` 只能给 `campaignId` / `adgroupId`，给 `userId`（账户层级）会通过字段校验、最后以 9011862000000 收场。
> 官方 add 页的 3037 / 3198 / 9050 示例绑的是 `userId`，与实测不符，本 skill 以实测为准。

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
| `样式 3036 的 bindingLevel 是 PLAN，不能绑账户` | `bindingRange` 传了 `userId` | 改传 `campaignId`（或 `adgroupId` + 所属 `campaignId`） |
| `image[].imageId 必填（Image.url 是只读字段）` | `image` 里传了 url、没传 imageId | 先 `image-get`/`image-upload` 拿 `imageId` |
| `样式 3036 的 selectList 需 4 个，本次 3 个` | content 条数不在该样式的 min–max | 按「各样式组件要求」表补齐/裁剪 |
| `绑单元时必须同时给所属 campaignId` | 只给了 `adgroupId` | 补上该单元所属的 `campaignId` |
| `content 必须是对象（官方 Category，不是数组）` | `category` / `list` 的 content 写成了数组 | 改成单个对象 |
| `url 必填（商品链接，样式 3036 要求）` | 该样式的橱窗商品缺必填字段 | 按「各样式组件要求」表补齐 |
| `样式 3149 需要组件 category` | 全息移动缺子链组件 | 补 `category`：1 个主 + 2–4 个子链 |
| `3149（全息移动）子链 text 需 4–12 字节（中文 2 字节，即 2–6 个汉字），本次 N 字节` | 子链文案长度不合规（远端对应 9011003201「长度要求 4-12」） | 调整到 4–12 字节：2–6 个汉字，或 4–12 个英文数字 |
| `creativeComponents 不支持的组件 xxx` | 组件键写错（如 `select_list`、`plAS`） | 只允许 `category/image/selectList/textList/plas/list` |
| 远端 `9011862000000 系统出错` | 字段都过了但服务端内部校验失败：绑定层级不符（PLAN 样式绑账户）、`image` 只有 url 没有 imageId、content 条数不在区间、`mtId` 与 `materialTypes` 不一致、3149 子链缺字段 | 按上面四类逐条自查；本地校验器已覆盖这四类，能过本地再发就不会再撞这个错 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"danube-creative-group-add","confirmWrite":true,"userName":"子账号用户名","body":{"creativeGroupTypes":[{"creativeGroupName":"测试创意组","bindingRange":[{"campaignId":91100082}],"materialTypes":[3037],"category":[2880,2881],"creativeComponents":{"plas":[{"mtId":3037,"content":[{"image":[{"imageId":1509701499}]},{"image":[{"imageId":1508578678}]},{"image":[{"imageId":1508576529}]}]}]}}]}}'
```
