(function () {
"use strict";
if (typeof window === "undefined" || window.__navStructure) return;
var NAV_JSON_ID = "nav-structure-json";
var PAGES_JSON_ID = "site-pages-json";
var nodeKey = function nodeKey(node, htmlSpace) {
  return htmlSpace ? node.href : node.path;
};
var isActive = function isActive(node, target, htmlSpace) {
  const key = nodeKey(node, htmlSpace);
  return Boolean(key && key === target);
};
var isExpanded = function isExpanded(node, target, htmlSpace) {
  if (!node) return false;
  if (node.depth === 0 && node.label === '课程总览') return true;
  if (isActive(node, target, htmlSpace)) return true;
  if (node.children) return node.children.some((c) => isExpanded(c, target, htmlSpace));
  return false;
};
var collectActive = function collectActive(nodes, target, htmlSpace) {
  const activeIds = [];
  const expandedIds = [];
  (function walk(arr) {
    for (const n of arr || []) {
      if (isActive(n, target, htmlSpace)) activeIds.push(n.id);
      if (isExpanded(n, target, htmlSpace)) expandedIds.push(n.id);
      if (n.children) walk(n.children);
    }
  })(nodes);
  return { activeIds, expandedIds };
};
var navPromise = null;
var pagesPromise = null;

function escAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function resolveSiteUrl(attrName) {
  var docEl = document.documentElement;
  if (!docEl) return null;
  var rel = docEl.getAttribute(attrName);
  if (!rel) return null;
  var root = docEl.getAttribute("data-root") || "./";
  return new URL(root + rel, location.href).href;
}

function readNavJson() {
  if (window.__siteNavData && Array.isArray(window.__siteNavData.nodes)) {
    return window.__siteNavData;
  }
  try {
    var tag = document.getElementById(NAV_JSON_ID);
    if (!tag) return null;
    var data = JSON.parse(tag.textContent || "");
    if (data && Array.isArray(data.nodes)) {
      window.__siteNavData = data;
      return data;
    }
    return null;
  } catch (e) { return null; }
}

function readPagesJson() {
  if (Array.isArray(window.__sitePagesData)) return window.__sitePagesData;
  try {
    var tag = document.getElementById(PAGES_JSON_ID);
    if (!tag) return null;
    var data = JSON.parse(tag.textContent || "");
    if (Array.isArray(data)) {
      window.__sitePagesData = data;
      return data;
    }
    return null;
  } catch (e) { return null; }
}

function loadNavJson() {
  var sync = readNavJson();
  if (sync) return Promise.resolve(sync);
  if (navPromise) return navPromise;
  var url = resolveSiteUrl("data-nav-path");
  if (!url) return Promise.resolve(null);
  navPromise = fetch(url, { credentials: "same-origin" })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (data && Array.isArray(data.nodes)) {
        window.__siteNavData = data;
        return data;
      }
      navPromise = null;
      return null;
    })
    .catch(function () { navPromise = null; return null; });
  return navPromise;
}

function loadPagesJson() {
  var sync = readPagesJson();
  if (sync) return Promise.resolve(sync);
  if (pagesPromise) return pagesPromise;
  var url = resolveSiteUrl("data-pages-path");
  if (!url) return Promise.resolve(null);
  pagesPromise = fetch(url, { credentials: "same-origin" })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (Array.isArray(data)) {
        window.__sitePagesData = data;
        return data;
      }
      pagesPromise = null;
      return null;
    })
    .catch(function () { pagesPromise = null; return null; });
  return pagesPromise;
}

function findNode(nodes, id) {
  for (var i = 0; i < (nodes || []).length; i++) {
    var n = nodes[i];
    if (n.id === id) return n;
    if (n.children) {
      var hit = findNode(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

function renderListHtml(nodes, target, rootRel, recursive, expandedSet) {
  var out = '<ul class="drawer-nav-list">';
  for (var i = 0; i < (nodes || []).length; i++) {
    var node = nodes[i];
    var hasChildren = !!(node.children && node.children.length > 0);
    var nodeActive = target != null ? isActive(node, target, true) : false;
    var nodeExpanded = expandedSet ? !!expandedSet[node.id] : (target != null ? isExpanded(node, target, true) : false);
    if (hasChildren) {
      var titleHtml = node.indexHref
        ? '<a href="' + escAttr(rootRel + node.indexHref) + '" data-path="' + escAttr(node.indexHref) + '" class="drawer-nav-link"><span>' + node.label + '</span></a>'
        : '<span class="drawer-section-title-text">' + node.label + '</span>';
      var eager = recursive || nodeExpanded;
      var innerHtml = eager ? renderListHtml(node.children, target, rootRel, recursive, expandedSet) : "";
      var lazyAttr = eager ? "" : ' data-nav-lazy="1"';
      out += '<li class="drawer-nav-group ' + (nodeActive ? "active " : "") + (nodeExpanded ? "expanded" : "collapsed") + '" data-node-id="' + escAttr(node.id) + '"' + lazyAttr + '>'
        + '<div class="nav-group-header ' + (node.indexHref ? "" : "nav-header-clickable") + '">'
        + titleHtml
        + '<button class="nav-collapse-btn" aria-label="折叠或展开 ' + escAttr(node.label) + '" title="折叠/展开">'
        + '<svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>'
        + '</button></div>'
        + '<div class="nav-nested-wrapper"><div class="nav-nested">' + innerHtml + '</div></div></li>';
    } else if (node.href) {
      out += '<li class="drawer-nav-item ' + (nodeActive ? "active" : "") + '" data-node-id="' + escAttr(node.id) + '">'
        + '<a href="' + escAttr(rootRel + node.href) + '" data-path="' + escAttr(node.href) + '" class="drawer-nav-link">'
        + '<span>' + node.label + '</span></a></li>';
    } else {
      out += '<li class="drawer-section-title" data-node-id="' + escAttr(node.id) + '">' + node.label + '</li>';
    }
  }
  out += "</ul>";
  return out;
}

function hydrateGroupEl(groupLi, nodes, recursive, expandedSet) {
  if (!groupLi || !nodes) return false;
  if (!groupLi.hasAttribute("data-nav-lazy")) {
    if (recursive) {
      var nestedLazies = groupLi.querySelectorAll("li[data-nav-lazy='1']");
      for (var k = 0; k < nestedLazies.length; k++) {
        hydrateGroupEl(nestedLazies[k], nodes, true, expandedSet);
      }
    }
    return true;
  }
  var id = groupLi.getAttribute("data-node-id");
  var node = findNode(nodes, id);
  var container = groupLi.querySelector(":scope > .nav-nested-wrapper > .nav-nested");
  if (!node || !node.children || !container) {
    groupLi.removeAttribute("data-nav-lazy");
    return false;
  }
  var target = document.body ? (document.body.getAttribute("data-site-path") || "") : "";
  var rootRel = (document.documentElement && document.documentElement.getAttribute("data-root")) || "./";
  container.innerHTML = renderListHtml(node.children, target, rootRel, recursive, expandedSet);
  groupLi.removeAttribute("data-nav-lazy");
  return true;
}

function hydrateIdsSync(nodes, ids) {
  if (!nodes || !ids || !ids.length) return;
  var expSet = {};
  for (var i = 0; i < ids.length; i++) expSet[ids[i]] = 1;
  // 按从外到内顺序水合（数组里祖先先于后代），确保父级渲染出子级 DOM 后再继续向下。
  var progress = true;
  while (progress) {
    progress = false;
    for (var j = 0; j < ids.length; j++) {
      var el = document.querySelector('li[data-node-id="' + ids[j].replace(/"/g, '\"') + '"][data-nav-lazy="1"]');
      if (el && hydrateGroupEl(el, nodes, false, expSet)) progress = true;
    }
  }
}

function ensureHydrated(groupLi) {
  if (!groupLi || !groupLi.hasAttribute("data-nav-lazy")) return Promise.resolve(true);
  return loadNavJson().then(function (data) {
    if (!data || !data.nodes) return false;
    return hydrateGroupEl(groupLi, data.nodes, false, null);
  });
}

function hydrateAll() {
  return loadNavJson().then(function (data) {
    if (!data || !data.nodes) return false;
    var lazies = document.querySelectorAll("li[data-nav-lazy='1']");
    for (var i = 0; i < lazies.length; i++) {
      hydrateGroupEl(lazies[i], data.nodes, true, null);
    }
    return true;
  });
}

window.__navStructure = {
  NAV_JSON_ID: NAV_JSON_ID,
  PAGES_JSON_ID: PAGES_JSON_ID,
  readNavJson: readNavJson,
  readPagesJson: readPagesJson,
  loadNavJson: loadNavJson,
  loadPagesJson: loadPagesJson,
  collectActive: collectActive,
  hydrateIdsSync: hydrateIdsSync,
  ensureHydrated: ensureHydrated,
  hydrateAll: hydrateAll
};
})();