(function () {
"use strict";
var nav = (typeof navigator !== "undefined") ? navigator.modelContext : null;
var doc = (typeof document !== "undefined") ? document.modelContext : null;
if (!nav || !doc || nav === doc) return;   // 缺任一注册表、或本就同一个 → 什么都不做

var seen = Object.create(null);

function dual(self, other) {
  if (!self || typeof self.registerTool !== "function") return;
  var reg = self.registerTool.bind(self);
  var unreg = (typeof self.unregisterTool === "function") ? self.unregisterTool.bind(self) : null;

  self.registerTool = function (tool) {
    var name = tool && tool.name;
    return Promise.resolve(reg(tool)).then(function (r) {
      if (!name || seen[name]) return r;
      seen[name] = true;
      try { Promise.resolve(other.registerTool(tool)).catch(function () {}); } catch (e) {}
      return r;
    });
  };

  if (unreg) {
    self.unregisterTool = function (arg) {
      var name = (arg && arg.name) ? arg.name : arg;
      return Promise.resolve(unreg(arg)).then(function (r) {
        if (name && seen[name]) {
          delete seen[name];
          try { if (typeof other.unregisterTool === "function") Promise.resolve(other.unregisterTool(arg)).catch(function () {}); } catch (e) {}
        }
        return r;
      });
    };
  }
}

dual(nav, doc);
dual(doc, nav);
})();