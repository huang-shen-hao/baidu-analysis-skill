# 添加组件

## Trigger

用户要求添加组件、创建大图组件、小图组件、视频组件、品牌信息组件时使用。

## Action

`segment-add`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/AdvancedSegmentService/addSegment`
- 方法说明：新增组件（可批量）。
- 创意组件用到的图片 URL 及视频封面 URL，必须通过图片上传接口转为百度格式的图片链接才能投放使用。详见 [segment-upload-img.md](./segment-upload-img.md)。
- 视频组件用到的视频 URL 可通过视频管理接口获取；视频精彩片段 URL 可通过视频工具获取。

## Payload

```json
{
  "action": "segment-add",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "items": [
      {
        "source": 3,
        "segmentType": 310,
        "auditContent": {
          "items": [
            {
              "picUrl": "http://fc5tn.baidu.com/it/u=4056513044,4075758722&fm=203",
              "picText": "",
              "rawPicUrl": "https://cms-image.cdn.bcebos.com/3236773302%2C3923718207.jpg",
              "targetUrl": "",
              "desc": ""
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
- 执行前必须确认账号、组件类型、物料内容和回滚方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 行为说明

- 单次请求不超过 2000 个，大图组件单次请求不超过 20 个。
- `auditContent` 具体格式因组件类型而异，请参考百度组件物料表。

## 输入字段

`items` 必填 `SegmentType[]`，单次请求不超过 2000 个（大图组件不超过 20 个）。

### SegmentType 字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `source` | Integer | 是 | 投放范围 | 0-自定义配图绑定单元层级 / 3-自定义配图绑定账户层级 |
| `segmentType` | Long | 是 | 组件类型 | 取值范围见下方枚举 |
| `auditContent` | String/Object | 是 | 添加的物料内容 | 具体格式因组件类型而异，请参考组件物料表 |

### segmentType 可选枚举

| 值 | 说明 |
|---|---|
| 100 | 计算机小图组件 |
| 101 | 移动小图组件 |
| 320 | 移动大图组件 |
| 321 | 计算机大图组件 |
| 510 | 品牌信息组件 |
| 10001 | 16:9 视频组件 |
| 10002 | 9:16 视频组件 |
| 10003 | 1:1 视频组件 |

## auditContent 物料结构

> 图片组件中的 `picUrl` 必须通过 [segment-upload-img.md](./segment-upload-img.md) 上传图片后生成的 URL。

### 图片组件物料字段

| segmentType | 名称 | picUrl（裁图） | rawPicUrl（原图） | desc（图片主题） | miniProgramStatus | miniProgramUrl | picText | imageId |
|---|---|---|---|---|---|---|---|---|
| 320 移动大图 | 比例 3:1，不小于 800x267 | 选填 | **必填** | 不支持 | 不支持 | 不支持 | 不支持 | 选填 |
| 321 计算机大图 | 建议 518x292，不小于 259x146 | 选填 | **必填** | 不支持 | 不支持 | 不支持 | 不支持 | 选填 |
| 100 计算机小图 | 建议 512x340，不小于 128x85，最大 1024x680 | 选填 | **必填** | 不支持 | 不支持 | 不支持 | 不支持 | 选填 |
| 101 移动小图 | 建议 360x360，不小于 240x240，最大 1024x1024 | 选填 | **必填** | 不支持 | 不支持 | 不支持 | 不支持 | 选填 |

> `rawPicUrl` 必填，每张图片允许 1-20 个主题，每个主题 0-60 个字符（汉字占两个字符）。

#### 图片组件 auditContent 示例

```json
{
  "picUrl": "https://fc5tn.baidu.com/it/u=2596149000,390281206&fm=202",
  "imageId": 1509209364,
  "desc": "pc1",
  "rawPicUrl": "http://bj.bcebos.com/imagelib/150/share_pic/xxx.png"
}
```

### 视频组件物料字段

| segmentType | videoId | videoUrl | fragMentUrl | videoDesc | picUrl | imageRatio | imageType | imageId |
|---|---|---|---|---|---|---|---|---|
| 10001 16:9 视频 | **必填** | **必填** | **必填** | 选填 | **必填** | **必填** | **必填** | 选填 |
| 10002 9:16 视频 | **必填** | **必填** | **必填** | 选填 | **必填** | **必填** | **必填** | 选填 |
| 10003 1:1 视频 | **必填** | **必填** | **必填** | 选填 | **必填** | **必填** | **必填** | 选填 |

图片尺寸要求：16:9 最小 960x540 / 1:1 最小 200x200 / 3:1 最小 800x267 / 3:4 最小 540x720，每种尺寸最多 12 张。

#### imageType 枚举值

| segmentType | imageType | imageRatio | 必要性 |
|---|---|---|---|
| 10001 16:9 视频 | 100 | 16:9 | 必有一张 |
| | 101 | 1:1 | - |
| | 102 | 3:1 | - |
| | 103 | 3:4 | - |
| 10002 9:16 视频 | 203 | 3:4 | 必有一张 |
| | 201 | 1:1 | - |
| | 202 | 3:1 | - |
| 10003 1:1 视频 | 300 | 1:1 | 必有一张 |
| | 301 | 3:1 | - |
| | 302 | 3:4 | - |

#### 视频组件 auditContent 示例（16:9）

```json
{
  "videos": [
    {
      "videoId": 7249753,
      "videoUrl": "http://nadvideo2.baidu.com/xxx.mp4",
      "fragMentUrl": "http://nadvideo2.baidu.com/xxx.mp4",
      "videoDesc": "",
      "images": {
        "100": [
          {
            "picUrl": "http://fc-ccimage.baidu.com/xxx.jpg",
            "imageRatio": "16:9",
            "imageId": 1509209364
          }
        ],
        "101": [
          {
            "picUrl": "https://fc-ccimage.baidu.com/0/pic/xxx.png",
            "imageRatio": "1:1",
            "imageId": 1709209364
          }
        ],
        "102": [
          {
            "picUrl": "https://fc-ccimage.baidu.com/0/pic/xxx.png",
            "imageRatio": "3:1",
            "imageId": 1809209364
          }
        ],
        "103": [
          {
            "picUrl": "https://fc-ccimage.baidu.com/0/pic/xxx.png",
            "imageRatio": "3:4",
            "imageId": 2109209364
          }
        ]
      }
    }
  ]
}
```

### 品牌信息组件物料字段（510）

| 字段 | 类型 | 必填 | 说明 | 限制 |
|---|---|---|---|---|
| `merchantName` | String | 是 | 品牌名称 | 4-20 个字符，不支持特殊字符 `<` `>` |
| `picUrl` | String | 是 | 品牌头像 | 比例 1:1，最小 120x120 |
| `isDefault` | Boolean | - | 是否为默认 | 添加修改不传；所有品牌信息中最多一个为默认，否则使用公司名称 |
| `isCompany` | Boolean | - | 是否为公司名 | 添加修改不传；true 时该物料不支持修改和删除 |

#### 品牌信息组件 auditContent 示例

```json
{
  "picUrl": "https://fc-ccimage.baidu.com/0/pic/1512121190_440488941.jpg",
  "isDefault": false,
  "isCompany": false,
  "merchantName": "测试品牌信息组件"
}
```

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `segmentId` | Long | 组件ID |
| `source` | Integer | 投放范围 |
| `segmentType` | Long | 组件类型 |
| `auditContent` | Object | 物料内容 |
| `auditContent.items[].picUrl` | String | 图片URL |
| `auditContent.items[].imageId` | String | 图片ID |
| `auditContent.items[].rawPicUrl` | String | 原图URL |
| `auditContent.items[].picText` | String | 图片文字 |
| `auditContent.items[].targetUrl` | String | 目标URL |
| `auditContent.items[].desc` | String | 描述 |
| `segmentSign` | String | 组件MD5 |
| `auditStatus` | Integer | 审核状态 |
| `pause` | Boolean | 启停状态 |
| `modTime` | String | 修改时间 |
| `status` | Integer | 组件状态 |

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `segment-add requires body.items` | 漏传必填字段 items | 按本文「输入字段」补齐 body.items |
| `segment-add: segmentTypes max 2000 per request` | 单次提交数量超过上限 2000 | 分批提交，每批 ≤ 2000 |
| `status=2 code=81020` | 用户名不正确：常见于误用 MCC/账户管家主账号调业务接口 | 改用具体推广子账号的 username |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"segment-add","confirmWrite":true,"userName":"子账号用户名","body":{"items":[{"source":3,"segmentType":310,"auditContent":{"items":[{"picUrl":"http://fc5tn.baidu.com/it/u=4056513044,4075758722&fm=203","rawPicUrl":"https://cms-image.cdn.bcebos.com/3236773302%2C3923718207.jpg","picText":"","targetUrl":"","desc":""}]}}]}}'
```
