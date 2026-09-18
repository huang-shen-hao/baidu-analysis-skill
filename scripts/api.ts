/**
 * Baidu Marketing API DTO helper.
 *
 * Unified entry:
 *   node scripts/api.ts --payload='{"action":"campaign-get","body":{...}}'
 *
 * This file intentionally uses Node 18-compatible JavaScript syntax even though
 * the extension is .ts, matching the skill convention of direct `node` execution.
 */

// @ts-nocheck — file runs directly with `node`, not compiled via `tsc`.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const VERSION = '0.9.7';
const API_BASE_URL = process.env.BAIDU_API_BASE_URL || 'https://api.baidu.com';
const OAUTH_ACCESS_TOKEN_URL = process.env.BAIDU_OAUTH_ACCESS_TOKEN_URL ||
  process.env.BAIDU_OAUTH_TOKEN_URL ||
  'https://u.baidu.com/oauth/accessToken';
const OAUTH_REFRESH_TOKEN_URL = process.env.BAIDU_OAUTH_REFRESH_TOKEN_URL || 'https://u.baidu.com/oauth/refreshToken';
const OAUTH_USER_INFO_URL = process.env.BAIDU_OAUTH_USER_INFO_URL || 'https://u.baidu.com/oauth/getUserInfo';
const OAUTH_AUTH_URL = process.env.BAIDU_OAUTH_AUTH_URL || 'https://u.baidu.com/oauth/page/index';
// 默认 token store 不再落在当前工作目录：工作目录可能是 git 仓库，会把 refresh token 带进提交。
const TOKEN_STORE_PATH = process.env.BAIDU_TOKEN_STORE ||
  path.join(os.homedir(), '.baidu-analysis', '.baidu-auth.env');
const TOKEN_REFRESH_SKEW_MS = Number(process.env.BAIDU_TOKEN_REFRESH_SKEW_MS || 5 * 60 * 1000);
const HTTP_TIMEOUT_MS = Number(process.env.BAIDU_HTTP_TIMEOUT_MS || 30 * 1000);
/* ------------------------------------------------------------------ */
/*  顶层字段白名单                                                     */
/*  未列出的顶层字段一律报错：历史上 dryRun / dry_run 这类拼写错误会被   */
/*  静默忽略，导致"以为在预演、实际已执行"。                            */
/* ------------------------------------------------------------------ */

const ALLOWED_TOP_LEVEL_FIELDS = new Set([
  'action', 'userName', 'accessToken', 'header', 'body',
  'confirmWrite', 'dryRun',
  'appId', 'secretKey', 'authCode', 'authLink', 'authUrl', 'callback',
  'redirectUri', 'redirect_uri', 'refreshToken', 'refresh_token', 'openId',
  'userId', 'platformId', 'scope', 'state', 'code',
  'needSubList', 'pageSize', 'lastPageMaxUcId', '__warnings'
]);

function assertNoUnknownFields(payload) {
  const unknown = Object.keys(payload).filter((key) => !ALLOWED_TOP_LEVEL_FIELDS.has(key));
  if (unknown.length > 0) {
    const allowed = [...ALLOWED_TOP_LEVEL_FIELDS].filter((k) => k !== '__warnings').sort().join(', ');
    throw usageError(
      `Unknown top-level field(s): ${unknown.join(', ')}.` +
      ` 未知字段不会被透传，请删除或改用受支持字段。支持字段：${allowed}`
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Action registry                                                    */
/* ------------------------------------------------------------------ */

const ACTIONS = {
  // ── OAuth ───────────────────────────────────────────────────────
  'oauth-auth-url': {
    method: 'LOCAL',
    oauth: true,
    verified: true
  },
  'oauth-token-get': {
    method: 'POST',
    oauth: true,
    verified: true
  },
  'oauth-token-refresh': {
    method: 'POST',
    oauth: true,
    verified: true
  },
  'oauth-user-info-get': {
    method: 'POST',
    oauth: true,
    verified: true
  },

  // ── Account ────────────────────────────────────────────────────
  'mcc-account-get': {
    endpoint: '/json/feed/v1/MccFeedService/getUserListByMccid',
    method: 'POST',
    verified: true
  },
  'account-get': {
    endpoint: '/json/sms/service/AccountService/getAccountInfo',
    method: 'POST',
    verified: true
  },
  'account-update': {
    endpoint: '/json/sms/service/AccountService/updateAccountInfo',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Campaign ───────────────────────────────────────────────────
  'campaign-get': {
    endpoint: '/json/sms/service/CampaignService/getCampaign',
    method: 'POST',
    verified: true
  },
  'campaign-add': {
    endpoint: '/json/sms/service/CampaignService/addCampaign',
    method: 'POST',
    write: true,
    verified: true
  },
  'campaign-update': {
    endpoint: '/json/sms/service/CampaignService/updateCampaign',
    method: 'POST',
    write: true,
    verified: true
  },
  'campaign-delete': {
    endpoint: '/json/sms/service/CampaignService/deleteCampaign',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Adgroup ─────────────────────────────────────────────────────
  'adgroup-get': {
    endpoint: '/json/sms/service/AdgroupService/getAdgroup',
    method: 'POST',
    verified: true
  },
  'adgroup-add': {
    endpoint: '/json/sms/service/AdgroupService/addAdgroup',
    method: 'POST',
    write: true,
    verified: true
  },
  'adgroup-update': {
    endpoint: '/json/sms/service/AdgroupService/updateAdgroup',
    method: 'POST',
    write: true,
    verified: true
  },
  'adgroup-delete': {
    endpoint: '/json/sms/service/AdgroupService/deleteAdgroup',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Adgroup Image Segment Bind（官方标注 2023-04-19 下线，2026-09-18 实测仍可用）──
  'adgroup-image-segment-bind-get': {
    endpoint: '/json/sms/service/AdgroupImageSegmentBindService/getAdgroupImageSegmentBind',
    method: 'POST',
    verified: true
  },
  'adgroup-image-segment-bind-add': {
    endpoint: '/json/sms/service/AdgroupImageSegmentBindService/addAdgroupImageSegmentBind',
    method: 'POST',
    write: true,
    verified: true
  },
  'adgroup-image-segment-bind-delete': {
    endpoint: '/json/sms/service/AdgroupImageSegmentBindService/deleteAdgroupImageSegmentBind',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Creative ─────────────────────────────────────────────────────
  'creative-get': {
    endpoint: '/json/sms/service/CreativeService/getCreative',
    method: 'POST',
    verified: true
  },
  'creative-add': {
    endpoint: '/json/sms/service/CreativeService/addCreative',
    method: 'POST',
    write: true,
    verified: true
  },
  'creative-update': {
    endpoint: '/json/sms/service/CreativeService/updateCreative',
    method: 'POST',
    write: true,
    verified: true
  },
  'creative-delete': {
    endpoint: '/json/sms/service/CreativeService/deleteCreative',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Business Point ────────────────────────────────────────────
  'all-business-point-get': {
    endpoint: '/json/sms/service/BusinessPointService/getAllBusinessPoint',
    method: 'POST',
    verified: true
  },
  'bind-business-point-list-get': {
    endpoint: '/json/sms/service/BusinessPointService/getBindBusinessPointList',
    method: 'POST',
    verified: true
  },

  // ── Danube Creative Group ───────────────────────────────────────
  'danube-constants-get': {
    endpoint: '/json/sms/service/DanubeCreativeGroupService/getDanubeConstants',
    method: 'POST',
    verified: true
  },
  'danube-creative-group-get': {
    endpoint: '/json/sms/service/DanubeCreativeGroupService/getDanubeCreativeGroup',
    method: 'POST',
    verified: true
  },
  'danube-creative-group-copy': {
    endpoint: '/json/sms/service/DanubeCreativeGroupService/copyDanubeCreativeGroup',
    method: 'POST',
    write: true,
    verified: true
  },
  'danube-creative-group-add': {
    endpoint: '/json/sms/service/DanubeCreativeGroupService/addDanubeCreativeGroup',
    method: 'POST',
    write: true,
    verified: true
  },
  'danube-creative-group-update': {
    endpoint: '/json/sms/service/DanubeCreativeGroupService/updateDanubeCreativeGroup',
    method: 'POST',
    write: true,
    verified: true
  },
  'danube-creative-group-delete': {
    endpoint: '/json/sms/service/DanubeCreativeGroupService/deleteDanubeCreativeGroup',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── FC TransTrace ────────────────────────────────────────────────
  'fc-transtrace-list-get': {
    endpoint: '/json/sms/service/FcTransTraceApiService/getFcTransTraceList',
    method: 'POST',
    verified: true
  },
  'fc-transtrace-list-add': {
    endpoint: '/json/sms/service/FcTransTraceApiService/addFcTransTrace',
    method: 'POST',
    write: true,
    verified: true
  },
  'fc-transtrace-list-update': {
    endpoint: '/json/sms/service/FcTransTraceApiService/updateFcTransTrace',
    method: 'POST',
    write: true,
    verified: true
  },
  'fc-transtrace-list-delete': {
    endpoint: '/json/sms/service/FcTransTraceApiService/deleteFcTransTrace',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Image Segment（创意配图素材，官方标注 2023-04-19 下线，2026-09-18 实测仍可用）──
  'image-segment-get': {
    endpoint: '/json/sms/service/ImageSegmentService/getImageSegment',
    method: 'POST',
    verified: true
  },
  'image-segment-add': {
    endpoint: '/json/sms/service/ImageSegmentService/addImageSegment',
    method: 'POST',
    write: true,
    verified: true
  },
  'image-segment-update': {
    endpoint: '/json/sms/service/ImageSegmentService/updateImageSegment',
    method: 'POST',
    write: true,
    verified: true
  },
  'image-segment-delete': {
    endpoint: '/json/sms/service/ImageSegmentService/deleteImageSegment',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Keyword ─────────────────────────────────────────────────────
  'keyword-get': {
    endpoint: '/json/sms/service/KeywordService/getWord',
    method: 'POST',
    verified: true
  },
  'keyword-add': {
    endpoint: '/json/sms/service/KeywordService/addWord',
    method: 'POST',
    write: true,
    verified: true
  },
  'keyword-update': {
    endpoint: '/json/sms/service/KeywordService/updateWord',
    method: 'POST',
    write: true,
    verified: true
  },
  'keyword-delete': {
    endpoint: '/json/sms/service/KeywordService/deleteWord',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Negative Keyword Packet ─────────────────────────────────────
  'negative-keyword-get': {
    endpoint: '/json/sms/service/NegativeKeywordService/getNegativeKeyword',
    method: 'POST',
    verified: true
  },
  'negative-keyword-add': {
    endpoint: '/json/sms/service/NegativeKeywordService/addNegativeKeyword',
    method: 'POST',
    write: true,
    verified: true
  },
  'negative-keyword-update': {
    endpoint: '/json/sms/service/NegativeKeywordService/updateNegativeKeyword',
    method: 'POST',
    write: true,
    verified: true
  },
  'negative-keyword-delete': {
    endpoint: '/json/sms/service/NegativeKeywordService/deleteNegativeKeyword',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── NegativeKeywordPacket ─────────────────────────────────────
  'negative-keyword-packet-get': {
    endpoint: '/json/sms/service/NegativeKeywordPacketService/getNegativeKeywordPacket',
    method: 'POST',
    verified: true
  },
  'negative-keyword-packet-add': {
    endpoint: '/json/sms/service/NegativeKeywordPacketService/addNegativeKeywordPacket',
    method: 'POST',
    write: true,
    verified: true
  },
  'negative-keyword-packet-update': {
    endpoint: '/json/sms/service/NegativeKeywordPacketService/updateNegativeKeywordPacket',
    method: 'POST',
    write: true,
    verified: true
  },
  'negative-keyword-packet-delete': {
    endpoint: '/json/sms/service/NegativeKeywordPacketService/deleteNegativeKeywordPacket',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── OCPC / oCPC Target Package ──────────────────────────────────
  'ocpc-target-package-list-get': {
    endpoint: '/json/sms/service/OcpcService/getTargetPackageList',
    method: 'POST',
    verified: true
  },
  'ocpc-target-package-list-add': {
    endpoint: '/json/sms/service/OcpcService/addTargetPackage',
    method: 'POST',
    write: true,
    verified: true
  },
  'ocpc-target-package-list-update': {
    endpoint: '/json/sms/service/OcpcService/updateTargetPackage',
    method: 'POST',
    write: true,
    verified: true
  },
  'ocpc-target-package-list-delete': {
    endpoint: '/json/sms/service/OcpcService/deleteTargetPackage',
    method: 'POST',
    write: true,
    verified: true
  },
  'ocpc-project-bid-reference-get': {
    endpoint: '/json/sms/service/CampaignEstimatedService/getProjectBidReference',
    method: 'POST',
    verified: true
  },
  'ocpc-suggest-cpas-get': {
    endpoint: '/json/sms/service/FcOcpcService/getSuggestCPAs',
    method: 'POST',
    verified: true
  },

  // ── Report ──────────────────────────────────────────────────────
  'report-data-get': {
    endpoint: '/json/sms/service/OpenApiReportService/getReportData',
    method: 'POST',
    verified: true
  },

  // ── Advanced Segment ───────────────────────────────────────────
  'segment-get': {
    endpoint: '/json/sms/service/AdvancedSegmentService/getSegment',
    method: 'POST',
    verified: true
  },
  'segment-add': {
    endpoint: '/json/sms/service/AdvancedSegmentService/addSegment',
    method: 'POST',
    write: true,
    verified: true
  },
  'segment-update': {
    endpoint: '/json/sms/service/AdvancedSegmentService/updateSegment',
    method: 'POST',
    write: true,
    verified: true
  },
  'segment-delete': {
    endpoint: '/json/sms/service/AdvancedSegmentService/deleteSegment',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Advanced Segment Bind ────────────────────────────────────────
  'segment-bind-get': {
    endpoint: '/json/sms/service/AdvancedSegmentBindService/getSegmentBind',
    method: 'POST',
    verified: true
  },
  'segment-bind-add': {
    endpoint: '/json/sms/service/AdvancedSegmentBindService/addSegmentBind',
    method: 'POST',
    write: true,
    verified: true
  },
  'segment-bind-update': {
    endpoint: '/json/sms/service/AdvancedSegmentBindService/updateSegmentBind',
    method: 'POST',
    write: true,
    verified: true
  },
  'segment-bind-delete': {
    endpoint: '/json/sms/service/AdvancedSegmentBindService/deleteSegmentBind',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Image Upload ────────────────────────────────────────────────
  'segment-upload-img': {
    endpoint: '/json/sms/service/ImageManagementService/uploadImage',
    method: 'POST',
    write: true,
    verified: true
  },

  // ── Asset Image (资产管理 · 图片管理) ────────────────────────────
  // 官方文档：dev2.baidu.com 节点 522（上传图片）/ 查询图片 / 编辑图片 / 删除图片
  // 替代已下线的 ImageSegmentService（创意配图管理）与 AdgroupImageSegmentBindService。
  'image-upload': {
    endpoint: '/json/sms/service/ImageManageService/uploadImage',
    method: 'POST',
    write: true,
    verified: true
  },
  'image-get': {
    endpoint: '/json/sms/service/ImageManageService/getImageList',
    method: 'POST',
    verified: true
  },
  'image-update': {
    endpoint: '/json/sms/service/ImageManageService/modImage',
    method: 'POST',
    write: true,
    verified: true
  },
  'image-delete': {
    endpoint: '/json/sms/service/ImageManageService/delImage',
    method: 'POST',
    write: true,
    verified: true
  }
};

/* ------------------------------------------------------------------ */
/*  官方 QPS 表与废弃接口标注                                          */
/*  来源：dev2.baidu.com 节点 393（API接口qps限制规则）                */
/*  规则：未列出的接口统一按 10 QPS 处理。                              */
/* ------------------------------------------------------------------ */

const QPS_BY_ENDPOINT = {
  'AdgroupService/getAdgroup': 50,
  'AdgroupService/addAdgroup': 30,
  'AdgroupService/updateAdgroup': 100,
  'AdgroupService/deleteAdgroup': 30,
  'CampaignService/addCampaign': 30,
  'CampaignService/getCampaign': 100,
  'CampaignService/updateCampaign': 30,
  'CampaignService/deleteCampaign': 10,
  'CreativeService/addCreative': 50,
  'CreativeService/getCreative': 100,
  'CreativeService/updateCreative': 100,
  'CreativeService/deleteCreative': 30,
  'KeywordService/addWord': 50,
  'KeywordService/getWord': 100,
  'KeywordService/updateWord': 150,
  'KeywordService/deleteWord': 50,
  'AccountService/getAccountInfo': 50,
  'AccountService/updateAccountInfo': 10,
  'MccFeedService/getUserListByMccid': 10
};
const DEFAULT_QPS = 10;

/**
 * 官方文档节点 211 / 212 标注「创意配图管理 / 创意配图绑定管理」于 2023-04-19 下线。
 *
 * 2026-09-18 用真实账号实测：这两个服务的 URL 路由仍然注册，且返回 status=0 与真实业务数据
 * （AdgroupImageSegmentBindService 查询到 2 条绑定记录），说明服务端并未停服。
 *
 * 处置：保留可用能力（避免切断存量业务），但在每次调用输出中返回 deprecated:true 与告警，
 * 并给出替代接口。风险提示：Baidu 可能随时真正停服，且此后无官方文档支持。
 */
const DEPRECATED_ACTIONS = {
  'image-segment-get': '官方标注 2023-04-19 下线（实测仍可用）；新流程请用 image-get（资产管理 · 查询图片），注意新接口不返回 auditStatus/reasonText/desc/status',
  'image-segment-add': '官方标注 2023-04-19 下线（实测仍可用）；新流程请用 image-upload（资产管理 · 上传图片）',
  'image-segment-update': '官方标注 2023-04-19 下线（实测仍可用）；新流程请用 image-update，但新接口只能改图片名称与收藏，无法改图片主题 desc / 启停 status',
  'image-segment-delete': '官方标注 2023-04-19 下线（实测仍可用）；新流程请用 image-delete（资产管理 · 删除图片）',
  'adgroup-image-segment-bind-get': '官方标注 2023-04-19 下线（实测仍可用）；新流程请用 segment-bind-get，但一次查询拿不到图片 url/MD5/审核状态，需再用 segmentId 查组件明细',
  'adgroup-image-segment-bind-add': '官方标注 2023-04-19 下线（实测仍可用）；新流程请用 segment-bind-add 绑定图片类组件（segmentType 100/101/320/321），注意绑定对象由「素材ID」变为「组件ID」',
  'adgroup-image-segment-bind-delete': '官方标注 2023-04-19 下线（实测仍可用）；新流程请用 segment-bind-delete（按 bindId 解绑）'
};

// 已删除的 action 若被旧脚本调用，给出可执行的迁移提示而不是笼统的"不支持"
const REMOVED_ACTIONS = {};

// 官方错误码分类（节点 166：8xxx 系统错误 / 901xxx 搜索推广业务错误 / 925xxx 图文广告错误）
const BAIDU_ERROR_MAP = {
  8001: { class: 'system', retryable: true, zh: '服务端异常，请重试' },
  8002: { class: 'usage', retryable: false, zh: 'Json message 不合法' },
  8101: { class: 'auth', retryable: false, zh: '缺少用户名信息' },
  8102: { class: 'auth', retryable: false, zh: '用户名不合法' },
  8103: { class: 'auth', retryable: false, zh: '用户名不合法' },
  8104: { class: 'permission', retryable: false, zh: '没有权限操作该用户' },
  8303: { class: 'permission', retryable: false, zh: '没有权限操作该用户' },
  8401: { class: 'auth', retryable: false, zh: '缺少 token 信息' },
  8402: { class: 'auth', retryable: false, zh: 'token 不合法' },
  8403: { class: 'auth', retryable: false, zh: 'token 已删除' },
  8406: { class: 'permission', retryable: false, zh: '没有权限使用搜索推广 API 服务' },
  8408: { class: 'permission', retryable: false, zh: '没有权限使用该 token' },
  8409: { class: 'permission', retryable: false, zh: '没有权限操作该用户' },
  8411: { class: 'permission', retryable: false, zh: '没有权限操作其他用户' },
  8412: { class: 'permission', retryable: false, zh: '没有权限使用该 token' },
  9012: { class: 'permission', retryable: false, zh: '没有操作该用户的权限' },
  9013: { class: 'system', retryable: true, zh: '系统错误' },
  90127: { class: 'business', retryable: false, zh: '操作部分失败' },
  9013004: { class: 'system', retryable: true, zh: '系统错误，建议再次重试' }
};

// 需要刷新 token 的错误码（官方：token 缺失/不合法/已删除/无权使用）
const TOKEN_ERROR_CODES = new Set([8401, 8402, 8403, 8408, 8410, 8412]);

function getEndpointKey(action) {
  const endpoint = ACTIONS[action]?.endpoint;
  if (!endpoint) return null;
  return endpoint.split('/').slice(-2).join('/');
}

function getActionQps(action) {
  const key = getEndpointKey(action);
  if (!key) return null;
  return QPS_BY_ENDPOINT[key] ?? DEFAULT_QPS;
}

function classifyBaiduCode(code) {
  const mapped = BAIDU_ERROR_MAP[code];
  if (mapped) return mapped;
  const text = String(code);
  if (text.startsWith('8')) return { class: 'system', retryable: true, zh: '系统错误' };
  if (text.startsWith('901')) return { class: 'business', retryable: false, zh: '业务错误' };
  if (text.startsWith('925')) return { class: 'business', retryable: false, zh: '图文广告业务错误' };
  return { class: 'unknown', retryable: false, zh: '未知错误' };
}

function collectFailureCodes(data) {
  const failures = data?.header?.failures;
  if (!Array.isArray(failures)) return [];
  return failures.map((f) => Number(f?.code)).filter((n) => Number.isFinite(n));
}

/* ------------------------------------------------------------------ */
/*  Per-action validation helpers                                      */
/* ------------------------------------------------------------------ */

function validatePayload(payload) {
  if (!payload.action) {
    throw usageError('Missing required field: action');
  }

  const config = ACTIONS[payload.action];
  if (!config) {
    if (REMOVED_ACTIONS[payload.action]) {
      throw usageError(`Action removed: ${payload.action} — ${REMOVED_ACTIONS[payload.action]}`);
    }
    throw usageError(`Unsupported action: ${payload.action}`);
  }

  if (!config.verified) {
    throw usageError(`Action is not enabled until official docs are confirmed: ${payload.action}`);
  }

  if (config.write) {
    // confirmWrite 只有三种合法形态：
    //   true  → 正式执行（确认责任在调用方）
    //   false → 仅预演，不发送请求
    //   其它  → 报错（缺失、字符串 'true'、数字 1 都算）
    const confirmed = payload.confirmWrite === true;
    const previewOnly = payload.confirmWrite === false || payload.dryRun === true;
    if (!confirmed && !previewOnly) {
      throw usageError(
        `Write action requires confirmWrite — 正式执行传 confirmWrite:true（需用户已确认），仅预演传 confirmWrite:false: ${payload.action}`
      );
    }
  }

  const validators = {
    'campaign-add': validateCampaignAdd,
    'campaign-update': validateCampaignUpdate,
    'campaign-delete': validateCampaignDelete,
    'adgroup-add': validateAdgroupAdd,
    'adgroup-update': validateAdgroupUpdate,
    'adgroup-delete': validateAdgroupDelete,
    'creative-add': validateCreativeAdd,
    'creative-update': validateCreativeUpdate,
    'creative-delete': validateCreativeDelete,
    'account-update': validateAccountUpdate,
    'keyword-add': validateKeywordAdd,
    'keyword-update': validateKeywordUpdate,
    'keyword-delete': validateKeywordDelete,
    'negative-keyword-packet-add': validateNegativeKeywordPacketAdd,
    'negative-keyword-packet-delete': validateNegativeKeywordPacketDelete,
    'danube-creative-group-add': validateDanubeCreativeGroupAdd,
    'danube-creative-group-update': validateDanubeCreativeGroupUpdate,
    'danube-creative-group-delete': validateDanubeCreativeGroupDelete,
    'fc-transtrace-list-add': validateFcTransTraceAdd,
    'fc-transtrace-list-update': validateFcTransTraceUpdate,
    'fc-transtrace-list-delete': validateFcTransTraceDelete,
    'ocpc-target-package-list-add': validateOcpcTargetPackageAdd,
    'ocpc-target-package-list-update': validateOcpcTargetPackageUpdate,
    'ocpc-target-package-list-delete': validateOcpcTargetPackageDelete,
    'report-data-get': validateReportDataGet,
    'segment-add': validateSegmentAdd,
    'segment-delete': validateSegmentDelete,
    'segment-bind-add': validateSegmentBindAdd,
    'segment-bind-delete': validateSegmentBindDelete,
    'segment-bind-update': validateSegmentBindUpdate,
    'segment-upload-img': validateSegmentUploadImg,
    'danube-creative-group-copy': validateDanubeCreativeGroupCopy,
    'segment-update': validateSegmentUpdate,
    'negative-keyword-add': validateNegativeKeywordAdd,
    'negative-keyword-update': validateNegativeKeywordUpdate,
    'negative-keyword-delete': validateNegativeKeywordDelete,
    'negative-keyword-packet-update': validateNegativeKeywordPacketUpdate,
    'image-upload': validateImageUpload,
    'image-get': validateImageGet,
    'image-update': validateImageUpdate,
    'image-delete': validateImageDelete,
    'image-segment-get': validateImageSegmentGet,
    'image-segment-add': validateImageSegmentAdd,
    'image-segment-update': validateImageSegmentUpdate,
    'image-segment-delete': validateImageSegmentDelete,
    'adgroup-image-segment-bind-get': validateAdgroupImageSegmentBindGet,
    'adgroup-image-segment-bind-add': validateAdgroupImageSegmentBindAdd,
    'adgroup-image-segment-bind-delete': validateAdgroupImageSegmentBindDelete
  };

  const validator = validators[payload.action];
  if (validator) {
    validator(payload);
  }

  // 结构兜底：写操作必须有校验器。新增写接口时忘记注册会在这里立刻失败，
  // 而不是带着空 body 打到百度接口（历史上 copy / segment-update 等 10 个 action 就是漏网案例）。
  const uncovered = Object.entries(ACTIONS)
    .filter(([name, cfg]) => cfg.write === true && typeof validators[name] !== 'function')
    .map(([name]) => name);
  if (uncovered.length > 0) {
    const error = new Error(`Write actions missing validators: ${uncovered.join(', ')}`);
    error.errorCode = 'BAIDU_INTERNAL_ERR';
    throw error;
  }
}

/* ---- Campaign ---- */

function validateCampaignAdd(payload) {
  const campaignTypes = payload.body?.campaignTypes;
  if (!Array.isArray(campaignTypes) || campaignTypes.length === 0) {
    throw usageError('campaign-add requires body.campaignTypes');
  }
  if (campaignTypes.length > 100) {
    throw usageError('campaign-add: campaignTypes max 100 per request');
  }

  for (const c of campaignTypes) {
    if (c?.pause !== true) {
      throw usageError('campaign-add: every campaignTypes[].pause must be true for safety');
    }
    if (!c.budget || c.budget < 50 || c.budget > 10000000) {
      throw usageError('campaign-add: budget must be in [50, 10000000]');
    }
  }
}

function validateCampaignUpdate(payload) {
  const campaignTypes = payload.body?.campaignTypes;
  if (!Array.isArray(campaignTypes) || campaignTypes.length === 0) {
    throw usageError('campaign-update requires body.campaignTypes');
  }
  if (campaignTypes.length > 100) {
    throw usageError('campaign-update: campaignTypes max 100 per request');
  }
  for (const c of campaignTypes) {
    if (!c.campaignId) {
      throw usageError('campaign-update: each campaignType requires campaignId');
    }
  }
}

function validateCampaignDelete(payload) {
  const campaignIds = payload.body?.campaignIds;
  if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
    throw usageError('campaign-delete requires body.campaignIds');
  }
  if (campaignIds.length > 100) {
    throw usageError('campaign-delete: campaignIds max 100 per request');
  }
}

/* ---- Adgroup ---- */

function validateAdgroupAdd(payload) {
  const adgroupTypes = payload.body?.adgroupTypes;
  if (!Array.isArray(adgroupTypes) || adgroupTypes.length === 0) {
    throw usageError('adgroup-add requires body.adgroupTypes');
  }
  if (adgroupTypes.length > 5000) {
    throw usageError('adgroup-add: adgroupTypes max 5000 per request');
  }
  for (const a of adgroupTypes) {
    if (a?.pause !== true) {
      throw usageError('adgroup-add: every adgroupTypes[].pause must be true for safety');
    }
    if (!a.campaignId) {
      throw usageError('adgroup-add: each adgroupType requires campaignId');
    }
    if (a.maxPrice !== undefined && (a.maxPrice <= 0 || a.maxPrice > 999.99)) {
      throw usageError('adgroup-add: maxPrice must be in (0, 999.99]');
    }
  }
}

function validateAdgroupUpdate(payload) {
  const adgroupTypes = payload.body?.adgroupTypes;
  if (!Array.isArray(adgroupTypes) || adgroupTypes.length === 0) {
    throw usageError('adgroup-update requires body.adgroupTypes');
  }
  if (adgroupTypes.length > 5000) {
    throw usageError('adgroup-update: adgroupTypes max 5000 per request');
  }
  for (const a of adgroupTypes) {
    if (!a.adgroupId) {
      throw usageError('adgroup-update: each adgroupType requires adgroupId');
    }
  }
}

function validateAdgroupDelete(payload) {
  const adgroupIds = payload.body?.adgroupIds;
  if (!Array.isArray(adgroupIds) || adgroupIds.length === 0) {
    throw usageError('adgroup-delete requires body.adgroupIds');
  }
  if (adgroupIds.length > 10000) {
    throw usageError('adgroup-delete: adgroupIds max 10000 per request');
  }
}

/* ---- Creative ---- */

function validateCreativeAdd(payload) {
  const creativeTypes = payload.body?.creativeTypes;
  if (!Array.isArray(creativeTypes) || creativeTypes.length === 0) {
    throw usageError('creative-add requires body.creativeTypes');
  }
  if (creativeTypes.length > 3000) {
    throw usageError('creative-add: creativeTypes max 3000 per request');
  }
}

function validateCreativeUpdate(payload) {
  const creativeTypes = payload.body?.creativeTypes;
  if (!Array.isArray(creativeTypes) || creativeTypes.length === 0) {
    throw usageError('creative-update requires body.creativeTypes');
  }
  if (creativeTypes.length > 3000) {
    throw usageError('creative-update: creativeTypes max 3000 per request');
  }
  for (const c of creativeTypes) {
    if (!c.creativeId) {
      throw usageError('creative-update: each creativeType requires creativeId');
    }
  }
}

function validateCreativeDelete(payload) {
  const creativeIds = payload.body?.creativeIds;
  if (!Array.isArray(creativeIds) || creativeIds.length === 0) {
    throw usageError('creative-delete requires body.creativeIds');
  }
  if (creativeIds.length > 3000) {
    throw usageError('creative-delete: creativeIds max 3000 per request');
  }
}

/* ---- Account ---- */

function validateAccountUpdate(payload) {
  const accountInfo = payload.body?.accountInfo;
  if (!accountInfo || typeof accountInfo !== 'object' || Array.isArray(accountInfo)) {
    throw usageError('account-update requires body.accountInfo');
  }

  const allowedFields = new Set([
    'budget',
    'regionTarget',
    'excludeIp',
    'budgetType',
    'regionPriceFactor',
    'geoLocationStatus',
    'excludeQueryRegionStatus',
    'longMonitorSublink',
    'accountMonitorUrl'
  ]);
  const unknownFields = Object.keys(accountInfo).filter((field) => !allowedFields.has(field));
  if (unknownFields.length > 0) {
    throw usageError(`account-update contains unsupported accountInfo fields: ${unknownFields.join(', ')}`);
  }
  if (accountInfo.budget !== undefined && (accountInfo.budget < 50 || accountInfo.budget > 10000000)) {
    throw usageError('account-update: budget must be in [50, 10000000]');
  }
}

/* ---- Keyword ---- */

function validateKeywordAdd(payload) {
  const keywordTypes = payload.body?.keywordTypes;
  if (!Array.isArray(keywordTypes) || keywordTypes.length === 0) {
    throw usageError('keyword-add requires body.keywordTypes');
  }
  if (keywordTypes.length > 10000) {
    throw usageError('keyword-add: keywordTypes max 10000 per request');
  }
  for (const k of keywordTypes) {
    if (k?.pause !== true) {
      throw usageError('keyword-add: every keywordTypes[].pause must be true for safety');
    }
    if (k.price !== undefined && (k.price <= 0 || k.price > 999.99)) {
      throw usageError('keyword-add: price must be in (0, 999.99]');
    }
  }
}

function validateKeywordUpdate(payload) {
  const keywordTypes = payload.body?.keywordTypes;
  if (!Array.isArray(keywordTypes) || keywordTypes.length === 0) {
    throw usageError('keyword-update requires body.keywordTypes');
  }
  if (keywordTypes.length > 10000) {
    throw usageError('keyword-update: keywordTypes max 10000 per request');
  }
  for (const k of keywordTypes) {
    if (!k.keywordId) {
      throw usageError('keyword-update: each keywordType requires keywordId');
    }
    if (k.price !== undefined && (k.price <= 0 || k.price > 999.99)) {
      throw usageError('keyword-update: price must be in (0, 999.99]');
    }
  }
}

function validateKeywordDelete(payload) {
  const keywordIds = payload.body?.keywordIds;
  if (!Array.isArray(keywordIds) || keywordIds.length === 0) {
    throw usageError('keyword-delete requires body.keywordIds');
  }
  if (keywordIds.length > 10000) {
    throw usageError('keyword-delete: keywordIds max 10000 per request');
  }
}

/* ---- Negative Keyword Packet ---- */

function validateNegativeKeywordPacketAdd(payload) {
  const negativeKeywordPacketTypes = payload.body?.negativeKeywordPacketTypes;
  if (!Array.isArray(negativeKeywordPacketTypes) || negativeKeywordPacketTypes.length === 0) {
    throw usageError('negative-keyword-packet-add requires body.negativeKeywordPacketTypes');
  }
  if (negativeKeywordPacketTypes.length > 100) {
    throw usageError('negative-keyword-packet-add: negativeKeywordPacketTypes max 100 per request');
  }
}

function validateNegativeKeywordPacketDelete(payload) {
  const ids = payload.body?.negativeKeywordPacketIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw usageError('negative-keyword-packet-delete requires body.negativeKeywordPacketIds');
  }
  if (ids.length > 100) {
    throw usageError('negative-keyword-packet-delete: negativeKeywordPacketIds max 100 per request');
  }
}

/* ---- Danube Creative Group ---- */

function validateDanubeCreativeGroupAdd(payload) {
  const creativeGroupTypes = payload.body?.creativeGroupTypes;
  if (!Array.isArray(creativeGroupTypes) || creativeGroupTypes.length === 0) {
    throw usageError('danube-creative-group-add requires body.creativeGroupTypes');
  }
  if (creativeGroupTypes.length > 10) {
    throw usageError('danube-creative-group-add: creativeGroupTypes max 10 per request');
  }
}

function validateDanubeCreativeGroupUpdate(payload) {
  const creativeGroupTypes = payload.body?.creativeGroupTypes;
  if (!Array.isArray(creativeGroupTypes) || creativeGroupTypes.length === 0) {
    throw usageError('danube-creative-group-update requires body.creativeGroupTypes');
  }
  if (creativeGroupTypes.length > 1000) {
    throw usageError('danube-creative-group-update: creativeGroupTypes max 1000 per request (status-only)');
  }
}

function validateDanubeCreativeGroupDelete(payload) {
  const ids = payload.body?.creativeGroupIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw usageError('danube-creative-group-delete requires body.creativeGroupIds');
  }
  if (ids.length > 1000) {
    throw usageError('danube-creative-group-delete: creativeGroupIds max 1000 per request');
  }
}

/* ---- FC TransTrace ---- */

function validateFcTransTraceAdd(payload) {
  const transTraceList = payload.body?.transTraceList;
  if (!Array.isArray(transTraceList) || transTraceList.length === 0) {
    throw usageError('fc-transtrace-list-add requires body.transTraceList');
  }
  for (const t of transTraceList) {
    if (!t.transMode || ![8, 11].includes(t.transMode)) {
      throw usageError('fc-transtrace-list-add: transMode must be 8 (app API) or 11 (app SDK)');
    }
    if (!t.transName || t.transName.length > 50) {
      throw usageError('fc-transtrace-list-add: transName is required and max 50 chars');
    }
  }
}

function validateFcTransTraceUpdate(payload) {
  const transTraceList = payload.body?.transTraceList;
  if (!Array.isArray(transTraceList) || transTraceList.length === 0) {
    throw usageError('fc-transtrace-list-update requires body.transTraceList');
  }
  for (const t of transTraceList) {
    if (t.transId === undefined || t.transMode === undefined) {
      throw usageError('fc-transtrace-list-update: each item requires transId and transMode');
    }
  }
}

function validateFcTransTraceDelete(payload) {
  const transTraceList = payload.body?.transTraceList;
  if (!Array.isArray(transTraceList) || transTraceList.length === 0) {
    throw usageError('fc-transtrace-list-delete requires body.transTraceList');
  }
  if (transTraceList.length > 100) {
    throw usageError('fc-transtrace-list-delete: transTraceList max 100 per request');
  }
}

/* ---- OCPC Target Package ---- */

function validateOcpcTargetPackageAdd(payload) {
  const targetPackageTypes = payload.body?.targetPackageTypes;
  if (!Array.isArray(targetPackageTypes) || targetPackageTypes.length === 0) {
    throw usageError('ocpc-target-package-list-add requires body.targetPackageTypes');
  }
  if (targetPackageTypes.length > 20) {
    throw usageError('ocpc-target-package-list-add: targetPackageTypes max 20 per request');
  }
  for (const t of targetPackageTypes) {
    if (t.ocpcBid !== undefined && (t.ocpcBid < 0.01 || t.ocpcBid > 9999)) {
      throw usageError('ocpc-target-package-list-add: ocpcBid must be in [0.01, 9999]');
    }
  }
}

function validateOcpcTargetPackageUpdate(payload) {
  const targetPackageTypes = payload.body?.targetPackageTypes;
  if (!Array.isArray(targetPackageTypes) || targetPackageTypes.length === 0) {
    throw usageError('ocpc-target-package-list-update requires body.targetPackageTypes');
  }
  if (targetPackageTypes.length > 20) {
    throw usageError('ocpc-target-package-list-update: targetPackageTypes max 20 per request');
  }
}

function validateOcpcTargetPackageDelete(payload) {
  const ids = payload.body?.targetPackageIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw usageError('ocpc-target-package-list-delete requires body.targetPackageIds');
  }
  if (ids.length > 100) {
    throw usageError('ocpc-target-package-list-delete: targetPackageIds max 100 per request');
  }
}

/* ---- Report ---- */

function validateReportDataGet(payload) {
  const body = payload.body || {};
  const required = ['reportType', 'startDate', 'endDate', 'timeUnit', 'columns'];
  for (const field of required) {
    if (!body[field]) {
      throw usageError(`report-data-get requires body.${field}`);
    }
  }
  const validUnits = ['HOUR', 'DAY', 'WEEK', 'MONTH', 'SUMMARY'];
  if (!validUnits.includes(body.timeUnit)) {
    throw usageError(`report-data-get: timeUnit must be one of ${validUnits.join('/')}`);
  }
}

/* ---- Advanced Segment ---- */

function validateSegmentAdd(payload) {
  const segmentTypes = payload.body?.items ?? payload.body?.segmentTypes;
  if (!Array.isArray(segmentTypes) || segmentTypes.length === 0) {
    throw usageError('segment-add requires body.items');
  }
  if (segmentTypes.length > 2000) {
    throw usageError('segment-add: segmentTypes max 2000 per request');
  }
}

function validateSegmentDelete(payload) {
  const segmentTypes = payload.body?.segmentTypes;
  if (!Array.isArray(segmentTypes) || segmentTypes.length === 0) {
    throw usageError('segment-delete requires body.segmentTypes');
  }
  if (segmentTypes.length > 2000) {
    throw usageError('segment-delete: segmentTypes max 2000 per request');
  }
}

/* ---- Advanced Segment Bind ---- */

function validateSegmentBindAdd(payload) {
  const segmentBindTypes = payload.body?.items ?? payload.body?.segmentBindTypes;
  if (!Array.isArray(segmentBindTypes) || segmentBindTypes.length === 0) {
    throw usageError('segment-bind-add requires body.items');
  }
  if (segmentBindTypes.length > 2000) {
    throw usageError('segment-bind-add: segmentBindTypes max 2000 per request');
  }
}

function validateSegmentBindUpdate(payload) {
  const segmentBindTypes = payload.body?.segmentBindTypes;
  if (!Array.isArray(segmentBindTypes) || segmentBindTypes.length === 0) {
    throw usageError('segment-bind-update requires body.segmentBindTypes');
  }
  if (segmentBindTypes.length > 2000) {
    throw usageError('segment-bind-update: segmentBindTypes max 2000 per request');
  }
}

function validateSegmentBindDelete(payload) {
  const segmentBindTypes = payload.body?.items ?? payload.body?.segmentBindTypes;
  if (!Array.isArray(segmentBindTypes) || segmentBindTypes.length === 0) {
    throw usageError('segment-bind-delete requires body.items');
  }
  if (segmentBindTypes.length > 2000) {
    throw usageError('segment-bind-delete: segmentBindTypes max 2000 per request');
  }
}

/* ---- Image Upload ---- */

function validateSegmentUploadImg(payload) {
  const body = payload.body || {};
  // 官方节点 522「上传图片」：items 必填，单次最多 20 张，content 为 base64，请求体不超过 10M，
  // 且 content 不能带 "data:image/xxx;base64," 前缀。
  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw usageError('segment-upload-img requires body.items as a non-empty array');
  }
  if (items.length > 20) {
    throw usageError('segment-upload-img: items max 20 per request');
  }
  items.forEach((item, index) => {
    if (!item || typeof item.content !== 'string' || item.content.trim() === '') {
      throw usageError(`segment-upload-img: items[${index}].content is required`);
    }
    if (/^data:image\//i.test(item.content.trim())) {
      throw usageError(`segment-upload-img: items[${index}].content must not include the "data:image/..." prefix`);
    }
    if (item.content.length > 14000000) {
      throw usageError(`segment-upload-img: items[${index}].content is too large (request body max 10M)`);
    }
  });
  if (body.productLine !== undefined && body.productLine !== 'FENGCHAO') {
    throw usageError('segment-upload-img: productLine must be "FENGCHAO" when provided');
  }
  if (body.needMola !== undefined && body.needMola !== true) {
    throw usageError('segment-upload-img: needMola must be true when provided');
  }
}

/* ---- 补齐历史缺失的写操作校验器 ---- */

// 百度口径：中文按 2 字节，英文/数字按 1 字节（与 Buffer.byteLength 的 UTF-8 计数不同）
function baiduByteLength(value) {
  let total = 0;
  for (const char of String(value)) {
    total += char.codePointAt(0) > 0x7f ? 2 : 1;
  }
  return total;
}

const NEGATIVE_MATCH_TYPES = [0, 63];

function validateDanubeCreativeGroupCopy(payload) {
  const groups = payload.body?.creativeGroupTypes;
  if (!Array.isArray(groups) || groups.length === 0) {
    throw usageError('danube-creative-group-copy requires body.creativeGroupTypes');
  }
  if (groups.length > 10) {
    throw usageError('danube-creative-group-copy: creativeGroupTypes max 10 per request');
  }
  groups.forEach((group, index) => {
    if (!group?.creativeGroupId) {
      throw usageError(`danube-creative-group-copy: creativeGroupTypes[${index}].creativeGroupId is required`);
    }
    if (group.creativeGroupName !== undefined && baiduByteLength(group.creativeGroupName) > 20) {
      throw usageError(`danube-creative-group-copy: creativeGroupTypes[${index}].creativeGroupName max 20 bytes`);
    }
    if (!Array.isArray(group.bindingRange) || group.bindingRange.length === 0) {
      throw usageError(`danube-creative-group-copy: creativeGroupTypes[${index}].bindingRange is required`);
    }
    const hasUser = group.bindingRange.some((range) => range?.userId);
    const hasCampaign = group.bindingRange.some((range) => range?.campaignId);
    const hasAdgroup = group.bindingRange.some((range) => range?.adgroupId);
    if (hasUser && (hasCampaign || hasAdgroup)) {
      throw usageError(`danube-creative-group-copy: creativeGroupTypes[${index}].bindingRange cannot mix account level with campaign/adgroup level`);
    }
    if (hasCampaign && hasAdgroup) {
      throw usageError(`danube-creative-group-copy: creativeGroupTypes[${index}].bindingRange cannot mix campaign level with adgroup level`);
    }
  });
}

const SEGMENT_TYPES = [100, 101, 320, 321, 510, 10001, 10002, 10003];

function validateSegmentUpdate(payload) {
  const items = payload.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw usageError('segment-update requires body.items');
  }
  if (items.length > 2000) {
    throw usageError('segment-update: items max 2000 per request');
  }
  items.forEach((item, index) => {
    if (!item?.segmentId) {
      throw usageError(`segment-update: items[${index}].segmentId is required`);
    }
    if (item.segmentType === undefined) {
      throw usageError(`segment-update: items[${index}].segmentType is required`);
    }
    if (!SEGMENT_TYPES.includes(item.segmentType)) {
      throw usageError(`segment-update: items[${index}].segmentType must be one of ${SEGMENT_TYPES.join('/')}`);
    }
  });
}

function validateNegativeKeywordAdd(payload) {
  const keywordTypes = payload.body?.negativeKeywordTypes;
  if (!Array.isArray(keywordTypes) || keywordTypes.length === 0) {
    throw usageError('negative-keyword-add requires body.negativeKeywordTypes');
  }
  if (keywordTypes.length > 5000) {
    throw usageError('negative-keyword-add: negativeKeywordTypes max 5000 per request (受账户权益星级影响，1星2000/2星4000/3星5000)');
  }
  keywordTypes.forEach((item, index) => {
    const at = `negative-keyword-add: negativeKeywordTypes[${index}]`;
    const isPacketBind = item?.negativeKeywordPacketId !== undefined;
    if (isPacketBind) {
      if (!item.campaignId) throw usageError(`${at}.campaignId is required when binding a packet`);
      if (item.negativeKeyword !== undefined) throw usageError(`${at}.negativeKeyword must not be set when binding a packet`);
      return;
    }
    if (!item?.negativeKeyword) throw usageError(`${at}.negativeKeyword is required`);
    if (baiduByteLength(item.negativeKeyword) > 40) throw usageError(`${at}.negativeKeyword max 40 bytes`);
    if (!item.campaignId && !item.adgroupId) throw usageError(`${at} requires campaignId or adgroupId`);
    if (!NEGATIVE_MATCH_TYPES.includes(item.negativeMatchType)) {
      throw usageError(`${at}.negativeMatchType must be 0 (短语) or 63 (精确)`);
    }
  });
}

function validateNegativeKeywordUpdate(payload) {
  const keywordTypes = payload.body?.negativeKeywordTypes;
  if (!Array.isArray(keywordTypes) || keywordTypes.length === 0) {
    throw usageError('negative-keyword-update requires body.negativeKeywordTypes');
  }
  if (keywordTypes.length > 5000) {
    throw usageError('negative-keyword-update: negativeKeywordTypes max 5000 per request');
  }
  keywordTypes.forEach((item, index) => {
    const at = `negative-keyword-update: negativeKeywordTypes[${index}]`;
    if (!item?.negativeKeywordId) throw usageError(`${at}.negativeKeywordId is required`);
    if (item.negativeMatchType !== undefined && !NEGATIVE_MATCH_TYPES.includes(item.negativeMatchType)) {
      throw usageError(`${at}.negativeMatchType must be 0 (短语) or 63 (精确)`);
    }
  });
}

function validateNegativeKeywordDelete(payload) {
  const ids = payload.body?.negativeKeywordIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw usageError('negative-keyword-delete requires body.negativeKeywordIds');
  }
  if (ids.length > 5000) {
    throw usageError('negative-keyword-delete: negativeKeywordIds max 5000 per request');
  }
}

function validateNegativeKeywordPacketUpdate(payload) {
  const packets = payload.body?.updateNegativeKeywordPacketTypes;
  if (!Array.isArray(packets) || packets.length === 0) {
    throw usageError('negative-keyword-packet-update requires body.updateNegativeKeywordPacketTypes');
  }
  if (packets.length > 100) {
    throw usageError('negative-keyword-packet-update: updateNegativeKeywordPacketTypes max 100 per request');
  }
  packets.forEach((packet, index) => {
    const at = `negative-keyword-packet-update: updateNegativeKeywordPacketTypes[${index}]`;
    if (!packet?.negativeKeywordPacketId) throw usageError(`${at}.negativeKeywordPacketId is required`);
    if (packet.negativeKeywordPacketName !== undefined && baiduByteLength(packet.negativeKeywordPacketName) > 30) {
      throw usageError(`${at}.negativeKeywordPacketName max 30 bytes`);
    }
    for (const field of ['addNegativeKeywordTypes', 'updateNegativeKeywordTypes', 'deleteNegativeKeywordIds']) {
      const value = packet[field];
      if (value === undefined) continue;
      if (!Array.isArray(value) || value.length === 0) throw usageError(`${at}.${field} must be a non-empty array`);
      if (value.length > 5000) throw usageError(`${at}.${field} max 5000 per request`);
    }
    (packet.addNegativeKeywordTypes || []).forEach((item, i) => {
      if (!item?.negativeKeyword) throw usageError(`${at}.addNegativeKeywordTypes[${i}].negativeKeyword is required`);
      if (!NEGATIVE_MATCH_TYPES.includes(item.negativeMatchType)) {
        throw usageError(`${at}.addNegativeKeywordTypes[${i}].negativeMatchType must be 0 (短语) or 63 (精确)`);
      }
    });
    (packet.updateNegativeKeywordTypes || []).forEach((item, i) => {
      if (!item?.negativeKeywordId) throw usageError(`${at}.updateNegativeKeywordTypes[${i}].negativeKeywordId is required`);
      if (item.negativeMatchType !== undefined && !NEGATIVE_MATCH_TYPES.includes(item.negativeMatchType)) {
        throw usageError(`${at}.updateNegativeKeywordTypes[${i}].negativeMatchType must be 0 (短语) or 63 (精确)`);
      }
    });
  });
}

/* ---- Asset Image（资产管理 · 图片管理，官方节点 522 及同级） ---- */

const IMAGE_FILTER_FIELDS = ['imageId', 'width', 'height', 'size', 'format', 'resolution', 'addtime', 'isCollect'];
const IMAGE_FILTER_OPS = ['eq', 'in', 'ge', 'gt', 'le', 'lt', 'bt'];

function validateImageUpload(payload) {
  const body = payload.body || {};
  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw usageError('image-upload requires body.items as a non-empty array');
  }
  if (items.length > 20) {
    throw usageError('image-upload: items max 20 per request');
  }
  items.forEach((item, index) => {
    const at = `image-upload: items[${index}]`;
    if (!item || typeof item.content !== 'string' || item.content.trim() === '') {
      throw usageError(`${at}.content is required (base64)`);
    }
    if (/^data:image\//i.test(item.content.trim())) {
      throw usageError(`${at}.content must not include the "data:image/..." prefix`);
    }
    if (item.content.length > 14000000) {
      throw usageError(`${at}.content is too large (request body max 10M)`);
    }
    if (item.imageName !== undefined && baiduByteLength(item.imageName) > 200) {
      throw usageError(`${at}.imageName max 200 characters (中文按 2 字符)`);
    }
  });
  if (body.addImage !== undefined && typeof body.addImage !== 'boolean') {
    throw usageError('image-upload: addImage must be a boolean');
  }
}

function validateImageGet(payload) {
  const body = payload.body || {};
  const filters = body.filters;
  if (filters !== undefined) {
    if (!Array.isArray(filters)) {
      throw usageError('image-get: filters must be an array');
    }
    filters.forEach((filter, index) => {
      const at = `image-get: filters[${index}]`;
      if (!IMAGE_FILTER_FIELDS.includes(filter?.field)) {
        throw usageError(`${at}.field must be one of ${IMAGE_FILTER_FIELDS.join('/')}`);
      }
      if (!IMAGE_FILTER_OPS.includes(filter?.op)) {
        throw usageError(`${at}.op must be one of ${IMAGE_FILTER_OPS.join('/')}`);
      }
      if (!Array.isArray(filter?.values) || filter.values.length === 0) {
        throw usageError(`${at}.values must be a non-empty array`);
      }
      if (filter.field === 'imageId' && filter.values.length > 100) {
        throw usageError(`${at}: imageId 过滤数量上限为 100`);
      }
    });
  }
  if (body.pageNo !== undefined && (!Number.isInteger(body.pageNo) || body.pageNo < 1)) {
    throw usageError('image-get: pageNo must be a positive integer');
  }
  if (body.pageSize !== undefined && (!Number.isInteger(body.pageSize) || body.pageSize <= 0 || body.pageSize >= 1000)) {
    throw usageError('image-get: pageSize must be in (0, 1000)');
  }
}

function validateImageUpdate(payload) {
  const items = payload.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw usageError('image-update requires body.items');
  }
  items.forEach((item, index) => {
    const at = `image-update: items[${index}]`;
    if (!item?.imageId) {
      throw usageError(`${at}.imageId is required`);
    }
    if (item.collect !== undefined && typeof item.collect !== 'boolean') {
      throw usageError(`${at}.collect must be a boolean`);
    }
    if (item.imageName !== undefined && baiduByteLength(item.imageName) > 200) {
      throw usageError(`${at}.imageName max 200 characters (中文按 2 字符)`);
    }
  });
}

function validateImageDelete(payload) {
  const imageIds = payload.body?.imageIds;
  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    throw usageError('image-delete requires body.imageIds');
  }
  if (imageIds.length > 100) {
    throw usageError('image-delete: imageIds max 100 per request');
  }
}

/* ---- 已下线但仍可用的创意配图 / 配图绑定（补齐原先缺失的校验） ---- */

function validateImageSegmentAdd(payload) {
  const list = payload.body?.addSegmentRequestTypes ?? payload.body?.imageSegmentTypes;
  if (!Array.isArray(list) || list.length === 0) {
    throw usageError('image-segment-add requires body.addSegmentRequestTypes');
  }
  list.forEach((item, index) => {
    const at = `image-segment-add: addSegmentRequestTypes[${index}]`;
    if (!item?.srcImageContent) {
      throw usageError(`${at}.srcImageContent is required (base64)`);
    }
    if (![100, 101].includes(item.segmentType)) {
      throw usageError(`${at}.segmentType must be 100 (计算机) or 101 (移动)`);
    }
    if (item.desc !== undefined && !Array.isArray(item.desc)) {
      throw usageError(`${at}.desc must be an array of 图片主题`);
    }
  });
}

function validateImageSegmentGet(payload) {
  const body = payload.body || {};
  if (body.segmentIds !== undefined && !Array.isArray(body.segmentIds)) {
    throw usageError('image-segment-get: segmentIds must be an array');
  }
  if (body.segmentFields !== undefined && !Array.isArray(body.segmentFields)) {
    throw usageError('image-segment-get: segmentFields must be an array');
  }
}

function validateImageSegmentUpdate(payload) {
  const segmentTypes = payload.body?.segmentTypes;
  if (!Array.isArray(segmentTypes) || segmentTypes.length === 0) {
    throw usageError('image-segment-update requires body.segmentTypes');
  }
  segmentTypes.forEach((item, index) => {
    const at = `image-segment-update: segmentTypes[${index}]`;
    if (!item?.segmentId) {
      throw usageError(`${at}.segmentId is required`);
    }
    if (item.status !== undefined && ![0, 1].includes(item.status)) {
      throw usageError(`${at}.status must be 0 (启用) or 1 (暂停)`);
    }
    if (item.desc !== undefined && !Array.isArray(item.desc)) {
      throw usageError(`${at}.desc must be an array of 图片主题`);
    }
  });
}

function validateImageSegmentDelete(payload) {
  const segmentIds = payload.body?.segmentIds;
  if (!Array.isArray(segmentIds) || segmentIds.length === 0) {
    throw usageError('image-segment-delete requires body.segmentIds');
  }
}

function validateAdgroupImageSegmentBindGet(payload) {
  const body = payload.body || {};
  if (!Array.isArray(body.adgroupIds) || body.adgroupIds.length === 0) {
    throw usageError('adgroup-image-segment-bind-get requires body.adgroupIds');
  }
  if (body.fields === undefined) {
    payload.__warnings = (payload.__warnings || []).concat([
      'adgroup-image-segment-bind-get 未传 fields：官方要求显式指定返回字段，建议补齐以获得 url / desc / auditStatus 等信息'
    ]);
  } else if (!Array.isArray(body.fields)) {
    throw usageError('adgroup-image-segment-bind-get: fields must be an array');
  }
  if (body.limit !== undefined && (!Array.isArray(body.limit) || body.limit.length === 0 || body.limit.length > 2)) {
    throw usageError('adgroup-image-segment-bind-get: limit must be [k] or [m, n]');
  }
}

function validateAdgroupImageSegmentBindAdd(payload) {
  const bind = payload.body?.adgroupImageSegmentBindIdTypes;
  if (!bind || typeof bind !== 'object' || Array.isArray(bind)) {
    throw usageError('adgroup-image-segment-bind-add requires body.adgroupImageSegmentBindIdTypes');
  }
  if (!bind.adgroupId) {
    throw usageError('adgroup-image-segment-bind-add: adgroupImageSegmentBindIdTypes.adgroupId is required');
  }
  if (bind.segmentId === undefined) {
    payload.__warnings = (payload.__warnings || []).concat([
      'adgroup-image-segment-bind-add 未传 segmentId：官方文档标为选填，但缺少素材ID通常无法建立有效绑定，请确认'
    ]);
  }
}

function validateAdgroupImageSegmentBindDelete(payload) {
  const bindIds = payload.body?.bindIds;
  if (!Array.isArray(bindIds) || bindIds.length === 0) {
    throw usageError('adgroup-image-segment-bind-delete requires body.bindIds');
  }
}

/* ------------------------------------------------------------------ */
/*  Payload parsing & envelope building                               */
/* ------------------------------------------------------------------ */

function getPayload() {
  const args = process.argv.slice(2);
  const payloadArg = args.find((arg) => arg.startsWith('--payload='))?.slice('--payload='.length);
  const payloadFile = args.find((arg) => arg.startsWith('--payload-file='))?.slice('--payload-file='.length);

  let raw = payloadArg;
  let source = 'argv';
  if (!raw && payloadFile) {
    const resolved = path.resolve(process.cwd(), payloadFile);
    if (!fs.existsSync(resolved)) {
      throw usageError(`Payload file not found: ${resolved}`);
    }
    raw = fs.readFileSync(resolved, 'utf8');
    source = 'file';
  }

  if (!raw) {
    throw usageError('Missing required parameter: --payload or --payload-file');
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (error) {
    throw usageError(`Invalid JSON payload: ${error.message}`);
  }

  // 凭据走命令行参数会同时出现在进程列表与 shell history 中，这里给出显式告警。
  if (source === 'argv') {
    const sensitive = ['secretKey', 'secret_key', 'appSecret', 'accessToken', 'refreshToken'];
    const found = sensitive.filter((key) => payload[key] !== undefined || payload.body?.[key] !== undefined);
    if (found.length > 0) {
      payload.__warnings = (payload.__warnings || []).concat([
        `凭据字段 ${found.join(', ')} 来自命令行参数，会出现在进程列表与 shell history；建议改用 --payload-file 或环境变量`
      ]);
    }
  }

  return payload;
}

function usageError(message) {
  const error = new Error(message);
  error.errorCode = 'BAIDU_USAGE_ERR';
  return error;
}

function authError(message) {
  const error = new Error(message);
  error.errorCode = 'BAIDU_AUTH_ERR';
  return error;
}

function remoteError(message) {
  const error = new Error(message);
  error.errorCode = 'BAIDU_REMOTE_ERR';
  return error;
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, 'utf8');
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value.replace(/\\n/g, '\n');
  }
  return values;
}

function quoteEnvValue(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function loadTokenStore() {
  const stored = readEnvFile(TOKEN_STORE_PATH);
  for (const [key, value] of Object.entries(stored)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
  return stored;
}

function writeTokenStore(tokens) {
  const current = readEnvFile(TOKEN_STORE_PATH);
  const next = {
    ...current,
    ...tokens,
    BAIDU_TOKEN_UPDATED_AT: new Date().toISOString()
  };

  const orderedKeys = [
    'BAIDU_ACCESS_TOKEN',
    'BAIDU_REFRESH_TOKEN',
    'BAIDU_TOKEN_EXPIRES_AT',
    'BAIDU_REFRESH_TOKEN_EXPIRES_AT',
    'BAIDU_AUTH_USER_ID',
    'BAIDU_OPEN_ID',
    'BAIDU_TOKEN_UPDATED_AT'
  ];
  const restKeys = Object.keys(next)
    .filter((key) => !orderedKeys.includes(key))
    .sort();
  const lines = [
    '# Generated by baidu-analysis scripts/api.ts. Do not commit this file.',
    ...orderedKeys.concat(restKeys)
      .filter((key) => next[key] !== undefined && next[key] !== '')
      .map((key) => `${key}=${quoteEnvValue(next[key])}`)
  ];

  // 先写临时文件再原子替换：避免两个进程同时刷新 token 时互相截断（refresh token 被冲掉后需要重新授权）。
  const storeDir = path.dirname(TOKEN_STORE_PATH);
  fs.mkdirSync(storeDir, { recursive: true, mode: 0o700 });
  const tempPath = path.join(storeDir, `.${path.basename(TOKEN_STORE_PATH)}.${process.pid}.tmp`);
  fs.writeFileSync(tempPath, `${lines.join('\n')}\n`, { mode: 0o600 });
  fs.renameSync(tempPath, TOKEN_STORE_PATH);
  try {
    fs.chmodSync(TOKEN_STORE_PATH, 0o600);
  } catch {
    // Best-effort on filesystems that do not support chmod.
  }

  for (const [key, value] of Object.entries(next)) {
    process.env[key] = value;
  }
}

function getStoredAccessToken() {
  loadTokenStore();
  return process.env.BAIDU_ACCESS_TOKEN;
}

function getStoredRefreshToken(payload = {}) {
  loadTokenStore();
  return payload.refreshToken ||
    payload.refresh_token ||
    payload.body?.refreshToken ||
    payload.body?.refresh_token ||
    process.env.BAIDU_REFRESH_TOKEN;
}

function getStoredOpenId(payload = {}) {
  loadTokenStore();
  return payload.openId ||
    payload.body?.openId ||
    process.env.BAIDU_OPEN_ID;
}

function tokenExpiresSoon() {
  loadTokenStore();
  const expiresAt = process.env.BAIDU_TOKEN_EXPIRES_AT;
  if (!expiresAt) return false;

  const expiresMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresMs)) return false;
  return expiresMs - Date.now() <= TOKEN_REFRESH_SKEW_MS;
}

function getOauthCredential(payload, key, envKey) {
  return payload[key] || payload.body?.[key] || process.env[envKey];
}

function getOauthConfig(payload) {
  const appId = getOauthCredential(payload, 'appId', 'BAIDU_APP_ID');
  const secretKey = getOauthCredential(payload, 'secretKey', 'BAIDU_SECRET_KEY');
  const callback = payload.callback ||
    payload.redirectUri ||
    payload.redirect_uri ||
    payload.body?.callback ||
    payload.body?.redirectUri ||
    payload.body?.redirect_uri ||
    process.env.BAIDU_OAUTH_CALLBACK ||
    'https://www.baidu.com';

  return { appId, secretKey, callback };
}

function assertOauthCredentials(payload) {
  const config = getOauthConfig(payload);
  if (!config.appId) {
    throw authError('Missing appId. Provide payload.appId or BAIDU_APP_ID');
  }
  if (!config.secretKey) {
    throw authError('Missing secretKey. Provide payload.secretKey or BAIDU_SECRET_KEY');
  }
  return config;
}

function getAuthCode(payload) {
  return payload.authCode ||
    payload.code ||
    payload.body?.authCode ||
    payload.body?.code ||
    payload.body?.authorizationCode;
}

function getOauthUserId(payload) {
  return payload.userId ||
    payload.body?.userId ||
    process.env.BAIDU_AUTH_USER_ID ||
    process.env.BAIDU_USER_ID;
}

function normalizeDateLike(value) {
  if (!value) return undefined;
  const text = String(value);
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}T00:00:00.000Z`;
  }

  const ms = Date.parse(text);
  if (!Number.isFinite(ms)) return undefined;
  return new Date(ms).toISOString();
}

function getTokenExpiryIso(tokenData) {
  const explicit = normalizeDateLike(tokenData.expiresTime || tokenData.expires_time);
  if (explicit) return explicit;

  const expiresIn = tokenData.expiresIn || tokenData.expires_in || tokenData.expireIn || tokenData.expires;
  const seconds = Number(expiresIn);
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function getRefreshTokenExpiryIso(tokenData) {
  const explicit = normalizeDateLike(tokenData.refreshExpiresTime || tokenData.refresh_expires_time);
  if (explicit) return explicit;

  const expiresIn = tokenData.refreshExpiresIn || tokenData.refresh_expires_in;
  const seconds = Number(expiresIn);
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function normalizeTokenData(data) {
  const source = data?.data && typeof data.data === 'object' ? data.data : data;
  if (!source || typeof source !== 'object') {
    throw remoteError(`OAuth token response is not JSON object: ${String(data)}`);
  }

  if (data && typeof data === 'object' && data.code !== undefined && data.code !== 0) {
    throw remoteError(`OAuth token request failed: ${data.message || JSON.stringify(data)}`);
  }

  const accessToken = source.accessToken || source.access_token;
  const refreshToken = source.refreshToken || source.refresh_token;
  if (!accessToken) {
    const message = source.error_description || source.error || source.message || JSON.stringify(source);
    throw remoteError(`OAuth token response did not include access token: ${message}`);
  }

  const tokens = {
    BAIDU_ACCESS_TOKEN: accessToken
  };
  if (refreshToken) tokens.BAIDU_REFRESH_TOKEN = refreshToken;
  const expiresAt = getTokenExpiryIso(source);
  if (expiresAt) tokens.BAIDU_TOKEN_EXPIRES_AT = expiresAt;
  const refreshExpiresAt = getRefreshTokenExpiryIso(source);
  if (refreshExpiresAt) tokens.BAIDU_REFRESH_TOKEN_EXPIRES_AT = refreshExpiresAt;
  if (source.userId !== undefined) tokens.BAIDU_AUTH_USER_ID = String(source.userId);
  if (source.openId) tokens.BAIDU_OPEN_ID = source.openId;
  return { tokens, expiresAt };
}

function buildOauthBody(payload, grantType) {
  const { appId, secretKey } = assertOauthCredentials(payload);

  if (grantType === 'auth_code') {
    const code = getAuthCode(payload);
    if (!code) {
      throw usageError('oauth-token-get requires payload.code or payload.authCode from callback URL');
    }
    const userId = getOauthUserId(payload);
    if (!userId) {
      throw usageError('oauth-token-get requires payload.userId from callback URL');
    }

    return {
      appId,
      authCode: code,
      secretKey,
      grantType: 'auth_code',
      userId: Number.isFinite(Number(userId)) ? Number(userId) : userId
    };
  }

  if (grantType === 'refresh_token') {
    const refreshToken = getStoredRefreshToken(payload);
    if (!refreshToken) {
      throw authError('Missing refresh token. Run oauth-token-get first or provide payload.refreshToken');
    }
    const userId = getOauthUserId(payload);
    if (!userId) {
      throw usageError('oauth-token-refresh requires payload.userId or stored BAIDU_AUTH_USER_ID');
    }

    return {
      appId,
      secretKey,
      userId: Number.isFinite(Number(userId)) ? Number(userId) : userId,
      refreshToken
    };
  }

  throw usageError(`Unsupported OAuth grantType: ${grantType}`);
}

async function requestOauthToken(payload, grantType) {
  const body = buildOauthBody(payload, grantType);
  const url = grantType === 'refresh_token' ? OAUTH_REFRESH_TOKEN_URL : OAUTH_ACCESS_TOKEN_URL;
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset:utf-8;'
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // Keep raw text if Baidu returns a non-JSON error.
  }

  if (!response.ok) {
    throw remoteError(`OAuth token request failed. HTTP ${response.status}: ${redact(typeof data === 'string' ? data : JSON.stringify(data))}`);
  }

  return normalizeTokenData(data);
}

async function postOauthJson(url, body, context) {
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset:utf-8;'
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // Keep raw text if Baidu returns a non-JSON error.
  }

  if (!response.ok) {
    throw remoteError(`${context} failed. HTTP ${response.status}: ${redact(typeof data === 'string' ? data : JSON.stringify(data))}`);
  }
  if (data && typeof data === 'object' && data.code !== undefined && data.code !== 0) {
    throw remoteError(`${context} failed: ${redact(data.message || JSON.stringify(data))}`);
  }

  return data;
}

async function refreshStoredToken(payload = {}) {
  const result = await requestOauthToken(payload, 'refresh_token');
  writeTokenStore(result.tokens);
  return result;
}

function buildOauthUserInfoBody(payload) {
  loadTokenStore();
  const openId = getStoredOpenId(payload);
  if (!openId) {
    throw authError('oauth-user-info-get requires payload.openId or stored BAIDU_OPEN_ID');
  }

  const accessToken = payload.accessToken ||
    payload.body?.accessToken ||
    payload.header?.accessToken ||
    process.env.BAIDU_ACCESS_TOKEN;
  if (!accessToken) {
    throw authError('oauth-user-info-get requires payload.accessToken or stored BAIDU_ACCESS_TOKEN');
  }

  const userId = getOauthUserId(payload);
  if (!userId) {
    throw usageError('oauth-user-info-get requires payload.userId or stored BAIDU_AUTH_USER_ID');
  }

  const body = {
    openId,
    accessToken,
    userId: Number.isFinite(Number(userId)) ? Number(userId) : userId
  };
  const needSubList = payload.needSubList ?? payload.body?.needSubList;
  if (needSubList !== undefined) body.needSubList = Boolean(needSubList);

  const pageSize = payload.pageSize ?? payload.body?.pageSize;
  if (pageSize !== undefined) {
    const parsed = Number(pageSize);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 500) {
      throw usageError('oauth-user-info-get: pageSize must be an integer in [1, 500]');
    }
    body.pageSize = parsed;
  }

  const lastPageMaxUcId = payload.lastPageMaxUcId ?? payload.body?.lastPageMaxUcId;
  if (lastPageMaxUcId !== undefined) {
    const parsed = Number(lastPageMaxUcId);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw usageError('oauth-user-info-get: lastPageMaxUcId must be a positive integer');
    }
    body.lastPageMaxUcId = parsed;
  } else if (body.needSubList === true) {
    throw usageError('oauth-user-info-get: lastPageMaxUcId is required when needSubList=true; use 1 for the first page');
  }

  return body;
}

async function requestOauthUserInfo(payload) {
  if (!payload.accessToken && !payload.body?.accessToken && !payload.header?.accessToken && tokenExpiresSoon()) {
    await refreshStoredToken(payload);
  }

  let data = await postOauthJson(OAUTH_USER_INFO_URL, buildOauthUserInfoBody(payload), 'OAuth user info request');
  if (isTokenExpiredResponse(data) && getStoredRefreshToken(payload)) {
    await refreshStoredToken(payload);
    data = await postOauthJson(OAUTH_USER_INFO_URL, buildOauthUserInfoBody(payload), 'OAuth user info request');
  }
  return data;
}

async function ensureAccessToken(payload) {
  if (payload.accessToken || payload.header?.accessToken) return;

  const accessToken = getStoredAccessToken();
  if (accessToken && !tokenExpiresSoon()) return;

  if (getStoredRefreshToken(payload)) {
    await refreshStoredToken(payload);
    return;
  }

  if (!accessToken) {
    throw authError('Missing accessToken. Run oauth-token-get first, provide payload.accessToken, or set BAIDU_ACCESS_TOKEN');
  }
}

function buildAuthUrl(payload) {
  const presetAuthUrl = payload.authUrl ||
    payload.authLink ||
    payload.body?.authUrl ||
    payload.body?.authLink ||
    process.env.BAIDU_OAUTH_AUTH_LINK;
  const hasOverrides = payload.appId ||
    payload.platformId ||
    payload.scope ||
    payload.state ||
    payload.callback ||
    payload.body?.appId ||
    payload.body?.platformId ||
    payload.body?.scope ||
    payload.body?.state ||
    payload.body?.callback;
  if (presetAuthUrl && !hasOverrides) {
    try {
      const parsed = new URL(presetAuthUrl);
      if (!parsed.searchParams.get('platformId')) {
        throw authError('BAIDU_OAUTH_AUTH_LINK is missing platformId. Set BAIDU_PLATFORM_ID or provide a complete Baidu OAuth auth link with platformId.');
      }
    } catch (error) {
      if (error?.errorCode === 'BAIDU_AUTH_ERR') throw error;
      throw usageError(`Invalid BAIDU_OAUTH_AUTH_LINK: ${error.message}`);
    }
    return presetAuthUrl;
  }

  const appId = getOauthCredential(payload, 'appId', 'BAIDU_APP_ID');
  if (!appId) {
    throw authError('Missing appId. Provide payload.appId or BAIDU_APP_ID');
  }

  const platformId = payload.platformId || payload.body?.platformId || process.env.BAIDU_PLATFORM_ID;
  if (!platformId) {
    throw authError('Missing platformId. Provide payload.platformId or set BAIDU_PLATFORM_ID before generating the Baidu OAuth auth URL');
  }
  const scope = payload.scope || payload.body?.scope || process.env.BAIDU_OAUTH_SCOPE;
  const state = payload.state || payload.body?.state || process.env.BAIDU_OAUTH_STATE || String(Date.now());
  const callback = getOauthConfig(payload).callback;
  const params = new URLSearchParams({ appId, state, callback });
  if (platformId) params.set('platformId', platformId);
  if (scope) params.set('scope', scope);

  return `${OAUTH_AUTH_URL}?${params.toString()}`;
}

function redactTokenResult(result) {
  return {
    tokenStored: true,
    tokenStorePath: TOKEN_STORE_PATH,
    expiresAt: result.expiresAt || process.env.BAIDU_TOKEN_EXPIRES_AT || null,
    exportedKeys: Object.keys(result.tokens || {})
  };
}

async function callOauthAction(payload) {
  if (payload.action === 'oauth-auth-url') {
    const authUrl = buildAuthUrl(payload);
    let callback = getOauthConfig(payload).callback;
    try {
      callback = new URL(authUrl).searchParams.get('callback') || callback;
    } catch {
      // Keep configured callback if the preset URL cannot be parsed.
    }
    return {
      authUrl,
      callback
    };
  }

  if (payload.action === 'oauth-token-get') {
    const result = await requestOauthToken(payload, 'auth_code');
    writeTokenStore(result.tokens);
    return redactTokenResult(result);
  }

  if (payload.action === 'oauth-token-refresh') {
    const result = await refreshStoredToken(payload);
    return redactTokenResult(result);
  }

  if (payload.action === 'oauth-user-info-get') {
    return requestOauthUserInfo(payload);
  }

  throw usageError(`Unsupported OAuth action: ${payload.action}`);
}

function buildEnvelope(payload) {
  loadTokenStore();
  const userName = payload.userName || process.env.BAIDU_USER_NAME || payload.header?.userName;
  const accessToken = payload.accessToken || payload.header?.accessToken || process.env.BAIDU_ACCESS_TOKEN;

  // 未替换的模板占位符绝不能被当成真实账号/token 发出去：
  // 之前它既会跳过 token 自动刷新，又会静默覆盖环境变量里正确的账号。
  for (const [field, value] of [['userName', userName], ['accessToken', accessToken]]) {
    if (typeof value === 'string' && /^\{\{.*\}\}$/.test(value.trim())) {
      throw usageError(
        `Unresolved placeholder in ${field}: "${value.trim()}". ` +
        '请传入真实值，或删除该字段交由环境变量/ token store 提供（不要直接把模板写进 payload）。'
      );
    }
  }

  if (!userName) {
    throw authError('Missing userName. Provide payload.userName or BAIDU_USER_NAME');
  }
  if (!accessToken) {
    throw authError('Missing accessToken. Provide payload.accessToken or BAIDU_ACCESS_TOKEN');
  }

  return {
    header: {
      ...(payload.header || Object.create(null)),
      userName,
      accessToken
    },
    body: normalizeRequestBody(payload)
  };
}

function normalizeRequestBody(payload) {
  const body = { ...(payload.body || {}) };
  if (
    ['ocpc-target-package-list-add', 'ocpc-target-package-list-update'].includes(payload.action) &&
    Array.isArray(body.targetPackageTypes) &&
    body.targetPackageType === undefined
  ) {
    body.targetPackageType = body.targetPackageTypes;
    delete body.targetPackageTypes;
  }
  return body;
}

/* ------------------------------------------------------------------ */
/*  HTTP call                                                          */
/* ------------------------------------------------------------------ */

async function callBaiduApi(payload) {
  assertNoUnknownFields(payload);
  validatePayload(payload);
  const config = ACTIONS[payload.action];

  // 预演：完成全部校验与信封构造，但不发送任何请求
  if (isDryRun(payload)) {
    return { data: null, meta: buildPreview(payload, config) };
  }

  if (config.oauth) {
    return { data: await callOauthAction(payload), meta: buildActionMeta(payload, {}) };
  }

  const url = `${API_BASE_URL}${config.endpoint}`;
  await ensureAccessToken(payload);
  const envelope = buildEnvelope(payload);

  let response = await postJson(url, config.method, envelope);
  if (isTokenExpiredResponse(response.data) && getStoredRefreshToken(payload)) {
    await refreshStoredToken(payload);
    response = await postJson(url, config.method, buildEnvelope(payload));
  }

  const meta = evaluateBaiduResponse(response.data, payload.action);
  meta.traceId = response.traceId;
  meta.httpStatus = response.httpStatus;
  return { data: response.data, meta: buildActionMeta(payload, meta) };
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError' || /aborted/i.test(String(error?.message))) {
      const timeoutError = remoteError(`Request timed out after ${HTTP_TIMEOUT_MS}ms: ${url}`);
      timeoutError.errorCode = 'BAIDU_TIMEOUT_ERR';
      timeoutError.retryable = true;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function postJson(url, method, envelope) {
  const response = await fetchWithTimeout(url, {
    method,
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(envelope)
  });

  const traceId = response.headers?.get?.('X-B3-Traceid') || response.headers?.get?.('x-b3-traceid') || null;
  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // Keep raw text if Baidu returns a non-JSON error.
  }

  if (!response.ok) {
    const httpError = remoteError(`HTTP ${response.status}: ${redact(typeof data === 'string' ? data : JSON.stringify(data))}`);
    httpError.traceId = traceId;
    httpError.retryable = response.status >= 500 || response.status === 429;
    throw httpError;
  }

  return { data, traceId, httpStatus: response.status };
}

/**
 * 严格校验百度返回结构，并区分「成功 / 部分失败 / 失败」。
 * 官方（节点 255）header.status：0=成功，1=部分失败，2=全部失败，3=系统错误。
 * 之前的实现遇到 header 缺失直接当成功返回，会把网关 HTML 错误页当数据交付。
 */
function evaluateBaiduResponse(data, action) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw remoteError(`Unexpected non-JSON response from Baidu API: ${redact(String(data)).slice(0, 200)}`);
  }

  const header = data.header;
  if (!header || typeof header !== 'object' || Array.isArray(header)) {
    throw remoteError(`Baidu API response missing header: ${redact(JSON.stringify(data)).slice(0, 200)}`);
  }

  const status = header.status;
  if (status === undefined || status === null) {
    throw remoteError(`Baidu API response missing header.status: ${redact(JSON.stringify(header)).slice(0, 200)}`);
  }
  const failures = Array.isArray(header.failures) ? header.failures : [];
  const meta = {
    status,
    partial: status === 1,
    quota: header.quota,
    oprs: header.oprs,
    failures: failures.map((failure) => {
      const code = Number(failure?.code);
      const classified = classifyBaiduCode(code);
      return {
        code: Number.isFinite(code) ? code : failure?.code,
        message: failure?.message,
        position: failure?.position,
        class: classified.class,
        retryable: classified.retryable,
        zh: classified.zh
      };
    })
  };

  if (status === 0 || status === 1) {
    return meta;
  }

  const primary = meta.failures[0];
  const error = remoteError(
    `Baidu API failure (status=${status}${primary ? `, code=${primary.code}` : ''}): ` +
    (primary?.message || JSON.stringify(header))
  );
  error.baiduCode = primary?.code;
  error.baiduClass = primary?.class || (status === 3 ? 'system' : 'business');
  error.retryable = Boolean(primary?.retryable || status === 3);
  error.failures = meta.failures;
  // status=3 时官方把系统错误定位符放在 content 里，提工单时只需提供该 ticket
  if (status === 3 && header.content) {
    error.ticket = String(header.content);
  }
  void action;
  throw error;
}

function isTokenExpiredResponse(data) {
  // 优先按官方错误码判定（8401/8402/8403/8408/8410/8412），避免正则误命中导致写操作重复发请求。
  const codes = collectFailureCodes(data);
  if (codes.some((code) => TOKEN_ERROR_CODES.has(code))) return true;
  if (codes.length > 0) return false;

  const text = typeof data === 'string' ? data : JSON.stringify(data || {});
  return /access[_ ]?token|授权|令牌/i.test(text) &&
    /expire|expired|invalid|失效|过期|无效/i.test(text);
}

/* ------------------------------------------------------------------ */
/*  Error handling                                                     */
/* ------------------------------------------------------------------ */

// 失败路径同样需要脱敏：OAuth 失败响应体里可能回显 token 字段。
function redact(text) {
  return String(text).replace(
    /("?(?:access_?token|refresh_?token|secret_?key|app_?secret|accessToken|refreshToken|secretKey|appSecret)"?\s*[:=]\s*"?)([^",}\s]{4,})/gi,
    '$1***'
  );
}

const ERROR_SUGGESTIONS = {
  BAIDU_USAGE_ERR: '检查 action、payload 字段名、必填项与取值范围（对照 docs/ 下对应文档的「输入字段」）。',
  BAIDU_AUTH_ERR: '检查 BAIDU_APP_ID / BAIDU_SECRET_KEY / token store 是否可读；必要时重新走 oauth-token-get。',
  BAIDU_TIMEOUT_ERR: '请求超时：确认网络可达后重试；写操作重试前先用 pageKey 之类的业务唯一键确认上次是否已生效。',
  BAIDU_INTERNAL_ERR: '属脚本自身约束失败，请修复注册表或校验器后重试。',
  BAIDU_REMOTE_ERR: '对照 docs/troubleshooting-guide.md；带 traceId 与 ticket 可加速向百度定位问题。'
};

function buildActionMeta(payload, meta) {
  const warnings = [];
  if (Array.isArray(payload.__warnings)) warnings.push(...payload.__warnings);

  const deprecation = DEPRECATED_ACTIONS[payload.action];
  if (deprecation) warnings.push(deprecation);

  if (meta.partial) {
    warnings.push(
      `部分失败：提交 ${meta.quota ?? '?'} 条，成功 ${meta.oprs ?? '?'} 条。` +
      '请勿整批重试，只重试 failures[].position 指向的条目，否则已成功的条目会被重复创建。'
    );
  }

  return {
    qps: getActionQps(payload.action),
    deprecated: Boolean(deprecation),
    warnings,
    ...meta
  };
}

/* ------------------------------------------------------------------ */
/*  预演（dry-run）                                                     */
/* ------------------------------------------------------------------ */

// confirmWrite:false 与 dryRun:true 等价——都表示"只预演，不执行"
function isDryRun(payload) {
  return payload.dryRun === true || payload.confirmWrite === false;
}

function summarizeFields(value, prefix = '', out = []) {
  if (out.length >= 30) return out;
  if (value === null || typeof value !== 'object') {
    out.push(`${prefix} = ${JSON.stringify(value)}`);
    return out;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) { out.push(`${prefix} = []`); return out; }
    value.slice(0, 3).forEach((item, index) => summarizeFields(item, `${prefix}[${index}]`, out));
    if (value.length > 3) out.push(`${prefix} … 共 ${value.length} 项`);
    return out;
  }
  for (const [key, item] of Object.entries(value)) summarizeFields(item, prefix ? `${prefix}.${key}` : key, out);
  return out;
}

function buildPreview(payload, config) {
  loadTokenStore();
  const userName = payload.userName || process.env.BAIDU_USER_NAME || payload.header?.userName || '(未指定)';
  const body = normalizeRequestBody(payload);
  const warnings = Array.isArray(payload.__warnings) ? [...payload.__warnings] : [];
  const deprecation = DEPRECATED_ACTIONS[payload.action];
  if (deprecation) warnings.push(deprecation);
  warnings.push('这是预演，未发送任何请求。确认无误后，把同一个 payload 的 confirmWrite 改为 true 重新执行。');

  return {
    dryRun: true,
    qps: getActionQps(payload.action),
    deprecated: Boolean(deprecation),
    warnings,
    preview: {
      action: payload.action,
      isWrite: Boolean(config.write),
      userName,
      endpoint: config.oauth ? '(OAuth 本地动作，不经过业务接口)' : `${API_BASE_URL}${config.endpoint}`,
      method: config.oauth ? 'LOCAL' : config.method,
      changedFields: summarizeFields(body),
      body,
      headerTemplate: {
        userName,
        accessToken: '***（已脱敏，执行时由 token store / 环境变量注入）'
      },
      confirmHint: '用户确认后，把同一 payload 的 confirmWrite 改为 true 重新执行。'
    }
  };
}

function handleError(error, context) {
  const message = error instanceof Error ? error.message : String(error);
  const errorCode = error?.errorCode || (
    message.includes('accessToken') || message.includes('userName')
      ? 'BAIDU_AUTH_ERR'
      : 'BAIDU_REMOTE_ERR'
  );

  const response = {
    success: false,
    errorCode,
    message: `Failed to ${context}`,
    details: redact(message),
    suggestion: ERROR_SUGGESTIONS[errorCode] || ERROR_SUGGESTIONS.BAIDU_REMOTE_ERR
  };

  if (error?.baiduCode !== undefined) response.baiduCode = error.baiduCode;
  if (error?.baiduClass !== undefined) response.baiduClass = error.baiduClass;
  if (error?.retryable !== undefined) response.retryable = Boolean(error.retryable);
  if (Array.isArray(error?.failures) && error.failures.length > 0) response.failures = error.failures;
  if (error?.ticket !== undefined) response.ticket = error.ticket;
  if (error?.traceId) response.traceId = error.traceId;

  console.error(JSON.stringify(response, null, 2));
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/*  Entry                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  const isMain = process.argv[1]?.replaceAll('\\', '/').endsWith('scripts/api.ts') ||
    process.argv[1]?.replaceAll('\\', '/').endsWith('scripts/api');

  if (!isMain) return;

  try {
    const payload = getPayload();
    const { data, meta } = await callBaiduApi(payload);
    if (meta.dryRun) {
      console.log(JSON.stringify({
        success: true,
        dryRun: true,
        action: payload.action,
        version: VERSION,
        request: { qps: meta.qps ?? null, timeoutMs: HTTP_TIMEOUT_MS },
        warnings: meta.warnings || [],
        preview: meta.preview
      }, null, 2));
      return;
    }
    const output = {
      success: true,
      partial: Boolean(meta.partial),
      action: payload.action,
      version: VERSION,
      request: {
        traceId: meta.traceId ?? null,
        httpStatus: meta.httpStatus ?? null,
        qps: meta.qps ?? null,
        timeoutMs: HTTP_TIMEOUT_MS
      },
      warnings: meta.warnings || [],
      data
    };
    if (meta.partial) {
      output.quota = meta.quota;
      output.oprs = meta.oprs;
      output.failures = meta.failures;
    }
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    handleError(error, 'execute api action');
  }
}

main();

module.exports = {
  VERSION,
  API_BASE_URL,
  ACTIONS,
  QPS_BY_ENDPOINT,
  DEPRECATED_ACTIONS,
  BAIDU_ERROR_MAP,
  getPayload,
  callBaiduApi,
  evaluateBaiduResponse,
  buildActionMeta,
  buildPreview,
  isDryRun,
  assertNoUnknownFields,
  classifyBaiduCode,
  getActionQps,
  redact,
  handleError
};
