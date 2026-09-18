# 删除图片

## Trigger

用户要求删除图片素材、清理图库中的图片时使用。

## Action

`image-delete`

## 接口

- 请求地址：`POST https://api.baidu.com/json/sms/service/ImageManageService/delImage`
- 方法说明：图片删除接口。

> 本 action 属于「资产管理 · 图片管理」体系，替代已下线的 `image-segment-delete`。

## Payload

```json
{
  "action": "image-delete",
  "confirmWrite": true,
  "userName": "子账号用户名",
  "body": {
    "imageIds": [12312312, 242452452]
  }
}
```

## 安全要求

- 该接口会删除真实的图片素材，删除后**不可恢复**。
- 执行前必须确认：
  - 推广账号。
  - 图片ID与图片名称。
  - 该图片是否已被在投创意或单元绑定引用。
  - 回滚或补救方案。
- 脚本要求显式传 `confirmWrite`：`false` = 仅预演（返回将发送的请求体，不发送请求）；`true` = 正式执行（需用户已确认）。推荐先用 `false` 预演、确认后再改为 `true`。

## 输入字段

| 字段 | 类型 | 必填 | 说明 | 限制 |
|------|------|------|------|------|
| `imageIds` | Long[] | 是 | 图片ID列表 | 单次请求不超过 **100** 个 |

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `data` | Long[] | 被删除的 imageId 数组 |

## 行为说明

- 官方说明：**本接口无部分成功返回，如果部分删除失败即整体失败**。因此失败时不要按"部分成功"假设，重试前先用 `image-get` 确认目标图片是否仍存在，避免误判。

## 常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| `imageIds max 100 per request` | 单次删除超过 100 个 | 分批删除，每批 ≤ 100 |
| 部分删除失败时整体报错 | 官方明确：本接口**无部分成功语义，部分失败即整体失败** | 失败后先用 `image-get` 确认哪些已删除，不要直接整批重试 |
| 删掉了在投素材 | 图片被在投创意或组件绑定引用 | 删除前先确认引用关系；删除**不可恢复** |

> **来源**：校验器条目逐字取自 `scripts/api.ts`（与本 skill 实际输出一致，可复现）；
> 权限类错误码取自百度官方错误码表（dev2.baidu.com 节点 166），已按**动作**精确映射，但**未经逐条实测**。

## 调用示例

```bash
node scripts/api.ts --payload='{"action":"image-delete","confirmWrite":true,"userName":"子账号用户名","body":{"imageIds":[12312312]}}'
```
