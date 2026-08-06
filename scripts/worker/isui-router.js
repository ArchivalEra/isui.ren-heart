// ⚠️ 备用方案：当前架构用 dnspod 分线路（境内→EdgeOne、境外→CF）做 geo
// 分流——根域入口留在腾讯侧，不需要本 Worker。仅当域名 NS 迁至 CF 托管
// 时启用（SaaS zone + Custom Hostname 的 Worker 设置）。
//
// isui.ren 全域路由 Worker（Cloudflare Workers——SaaS zone 挂载）
//
// 路由语义（用户钦定）：
//   1. isui.ren（根域）默认 → /heart（302 同源）——然后按 geo 分流到
//      cn/global 子域（302——地址栏变子域——配置分层 hostname 选段的前提）
//   2. cn.isui.ren / global.isui.ren 覆写走不同源（Worker 代理到各自源）
//
// 部署：
//   1. Workers & Pages → Workers → Create → 粘贴本文件 → Deploy
//      （Worker 名如 isui-router）
//   2. SaaS zone（SSL/TLS → Custom Hostnames）→ 添加 Custom Hostname：
//      isui.ren / cn.isui.ren / global.isui.ren——每个的「Worker」设置
//      选 isui-router（Worker 优先于 fallback origin——全部流量进路由）
//   3. dnspod：三个域名按 CF 给的 CNAME/验证记录配置
//
// ⚠️ 源 URL 是占位——部署前替换为真实值：
//   cn 源：EdgeOne Makers 分配的项目域名（形如 xxx.edgeone.app）
//   global 源：CF Pages 项目域名（isui-ren-heart.pages.dev）
const SOURCES = {
  'cn.isui.ren': 'https://<EDGEONE_MAKERS_DOMAIN>', // cn 源：EdgeOne Makers 域名
  'global.isui.ren': 'https://isui-ren-heart.pages.dev', // global 源：CF Pages 域名
};

// geo 分流表：中国大陆 → cn 子域；其余 → global 子域
const GEO_TARGETS = {
  CN: 'https://cn.isui.ren',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname;

    // ① 子域：覆写代理到各自源（保留路径/查询字符串）
    const source = SOURCES[host];
    if (source) {
      return fetch(new Request(source + url.pathname + url.search, request));
    }

    // ② 根域（isui.ren）：
    //    默认路径 → /heart（同源 302——用户钦定「默认到 /heart」）
    if (url.pathname === '/' || url.pathname === '') {
      return Response.redirect(new URL('/heart', url.origin), 302);
    }
    //    其余路径：geo 分流 → 302 到 cn/global 子域同路径
    //    （cf-ipcountry 由 Cloudflare 自动注入——按访客 IP 国家）
    const country = (request.headers.get('cf-ipcountry') || '').toUpperCase();
    const target = GEO_TARGETS[country] || 'https://global.isui.ren';
    return Response.redirect(target + url.pathname + url.search, 302);
  },
};
