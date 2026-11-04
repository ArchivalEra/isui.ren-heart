(function () {
"use strict";
if (typeof window === "undefined" || window.__navStructure) return;
var NAV_JSON_ID = "nav-structure-json";
var nodeKey = function nodeKey(node, htmlSpace) {
  return htmlSpace ? node.href : node.path;
};
var isActive = function isActive(node, target, htmlSpace) {
  const key = nodeKey(node, htmlSpace);
  return Boolean(key && key === target);
};
var isExpanded = function isExpanded(node, target, htmlSpace) {
  if (!node) return false;
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
function readNavJson() {
  try {
    var tag = document.getElementById(NAV_JSON_ID);
    if (!tag) return null;
    var data = JSON.parse(tag.textContent || "");
    return (data && Array.isArray(data.nodes)) ? data : null;
  } catch (e) { return null; }
}
window.__navStructure = { NAV_JSON_ID: NAV_JSON_ID, readNavJson: readNavJson, collectActive: collectActive };
})();