var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __toCommonJS = (from) => {
  var entry = (__moduleCache ??= new WeakMap).get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function") {
    for (var key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(entry, key))
        __defProp(entry, key, {
          get: __accessProp.bind(from, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  __moduleCache.set(from, entry);
  return entry;
};
var __moduleCache;
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};

// node_modules/sortablejs/Sortable.min.js
var require_Sortable_min = __commonJS((exports2, module2) => {
  /*! Sortable 1.15.7 - MIT | git://github.com/SortableJS/Sortable.git */
  (function(t, e) {
    typeof exports2 == "object" && typeof module2 != "undefined" ? module2.exports = e() : typeof define == "function" && define.amd ? define(e) : (t = t || self).Sortable = e();
  })(exports2, function() {
    function o(t2, e2) {
      (e2 == null || e2 > t2.length) && (e2 = t2.length);
      for (var n2 = 0, o2 = Array(e2);n2 < e2; n2++)
        o2[n2] = t2[n2];
      return o2;
    }
    function i(t2, e2, n2) {
      return (e2 = function(t3) {
        t3 = function(t4, e3) {
          if (typeof t4 != "object" || !t4)
            return t4;
          var n3 = t4[Symbol.toPrimitive];
          if (n3 === undefined)
            return (e3 === "string" ? String : Number)(t4);
          e3 = n3.call(t4, e3 || "default");
          if (typeof e3 != "object")
            return e3;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }(t3, "string");
        return typeof t3 == "symbol" ? t3 : t3 + "";
      }(e2)) in t2 ? Object.defineProperty(t2, e2, { value: n2, enumerable: true, configurable: true, writable: true }) : t2[e2] = n2, t2;
    }
    function a() {
      return (a = Object.assign ? Object.assign.bind() : function(t2) {
        for (var e2 = 1;e2 < arguments.length; e2++) {
          var n2, o2 = arguments[e2];
          for (n2 in o2)
            !{}.hasOwnProperty.call(o2, n2) || (t2[n2] = o2[n2]);
        }
        return t2;
      }).apply(null, arguments);
    }
    function r(e2, t2) {
      var n2, o2 = Object.keys(e2);
      return Object.getOwnPropertySymbols && (n2 = Object.getOwnPropertySymbols(e2), t2 && (n2 = n2.filter(function(t3) {
        return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
      })), o2.push.apply(o2, n2)), o2;
    }
    function I(e2) {
      for (var t2 = 1;t2 < arguments.length; t2++) {
        var n2 = arguments[t2] != null ? arguments[t2] : {};
        t2 % 2 ? r(Object(n2), true).forEach(function(t3) {
          i(e2, t3, n2[t3]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(n2)) : r(Object(n2)).forEach(function(t3) {
          Object.defineProperty(e2, t3, Object.getOwnPropertyDescriptor(n2, t3));
        });
      }
      return e2;
    }
    function l(t2, e2) {
      if (t2 == null)
        return {};
      var n2, o2 = function(t3, e3) {
        if (t3 == null)
          return {};
        var n3, o3 = {};
        for (n3 in t3)
          if ({}.hasOwnProperty.call(t3, n3)) {
            if (e3.indexOf(n3) !== -1)
              continue;
            o3[n3] = t3[n3];
          }
        return o3;
      }(t2, e2);
      if (Object.getOwnPropertySymbols)
        for (var i2 = Object.getOwnPropertySymbols(t2), r2 = 0;r2 < i2.length; r2++)
          n2 = i2[r2], e2.indexOf(n2) === -1 && {}.propertyIsEnumerable.call(t2, n2) && (o2[n2] = t2[n2]);
      return o2;
    }
    function e(t2) {
      return function(t3) {
        if (Array.isArray(t3))
          return o(t3);
      }(t2) || function(t3) {
        if (typeof Symbol != "undefined" && t3[Symbol.iterator] != null || t3["@@iterator"] != null)
          return Array.from(t3);
      }(t2) || function(t3, e2) {
        if (t3) {
          if (typeof t3 == "string")
            return o(t3, e2);
          var n2 = {}.toString.call(t3).slice(8, -1);
          return (n2 = n2 === "Object" && t3.constructor ? t3.constructor.name : n2) === "Map" || n2 === "Set" ? Array.from(t3) : n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2) ? o(t3, e2) : undefined;
        }
      }(t2) || function() {
        throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
      }();
    }
    function s(t2) {
      return (s = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t3) {
        return typeof t3;
      } : function(t3) {
        return t3 && typeof Symbol == "function" && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
      })(t2);
    }
    function t(t2) {
      if (typeof window != "undefined" && window.navigator)
        return !!navigator.userAgent.match(t2);
    }
    var y = t(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i), w = t(/Edge/i), c = t(/firefox/i), u = t(/safari/i) && !t(/chrome/i) && !t(/android/i), d = t(/iP(ad|od|hone)/i), n = t(/chrome/i) && t(/android/i), h = { capture: false, passive: false };
    function f(t2, e2, n2) {
      t2.addEventListener(e2, n2, !y && h);
    }
    function p(t2, e2, n2) {
      t2.removeEventListener(e2, n2, !y && h);
    }
    function g(t2, e2) {
      if (e2 && (e2[0] === ">" && (e2 = e2.substring(1)), t2))
        try {
          if (t2.matches)
            return t2.matches(e2);
          if (t2.msMatchesSelector)
            return t2.msMatchesSelector(e2);
          if (t2.webkitMatchesSelector)
            return t2.webkitMatchesSelector(e2);
        } catch (t3) {
          return;
        }
    }
    function m(t2) {
      return t2.host && t2 !== document && t2.host.nodeType && t2.host !== t2 ? t2.host : t2.parentNode;
    }
    function P(t2, e2, n2, o2) {
      if (t2) {
        n2 = n2 || document;
        do {
          if (e2 != null && (e2[0] !== ">" || t2.parentNode === n2) && g(t2, e2) || o2 && t2 === n2)
            return t2;
        } while (t2 !== n2 && (t2 = m(t2)));
      }
      return null;
    }
    var v, b = /\s+/g;
    function k(t2, e2, n2) {
      var o2;
      t2 && e2 && (t2.classList ? t2.classList[n2 ? "add" : "remove"](e2) : (o2 = (" " + t2.className + " ").replace(b, " ").replace(" " + e2 + " ", " "), t2.className = (o2 + (n2 ? " " + e2 : "")).replace(b, " ")));
    }
    function R(t2, e2, n2) {
      var o2 = t2 && t2.style;
      if (o2) {
        if (n2 === undefined)
          return document.defaultView && document.defaultView.getComputedStyle ? n2 = document.defaultView.getComputedStyle(t2, "") : t2.currentStyle && (n2 = t2.currentStyle), e2 === undefined ? n2 : n2[e2];
        o2[e2 = !((e2 in o2) || e2.indexOf("webkit") !== -1) ? "-webkit-" + e2 : e2] = n2 + (typeof n2 == "string" ? "" : "px");
      }
    }
    function D(t2, e2) {
      var n2 = "";
      if (typeof t2 == "string")
        n2 = t2;
      else
        do {
          var o2 = R(t2, "transform");
        } while (o2 && o2 !== "none" && (n2 = o2 + " " + n2), !e2 && (t2 = t2.parentNode));
      var i2 = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
      return i2 && new i2(n2);
    }
    function E(t2, e2, n2) {
      if (t2) {
        var o2 = t2.getElementsByTagName(e2), i2 = 0, r2 = o2.length;
        if (n2)
          for (;i2 < r2; i2++)
            n2(o2[i2], i2);
        return o2;
      }
      return [];
    }
    function O() {
      var t2 = document.scrollingElement;
      return t2 || document.documentElement;
    }
    function X(t2, e2, n2, o2, i2) {
      if (t2.getBoundingClientRect || t2 === window) {
        var r2, a2, l2, s2, c2, u2, d2 = t2 !== window && t2.parentNode && t2 !== O() ? (a2 = (r2 = t2.getBoundingClientRect()).top, l2 = r2.left, s2 = r2.bottom, c2 = r2.right, u2 = r2.height, r2.width) : (l2 = a2 = 0, s2 = window.innerHeight, c2 = window.innerWidth, u2 = window.innerHeight, window.innerWidth);
        if ((e2 || n2) && t2 !== window && (i2 = i2 || t2.parentNode, !y))
          do {
            if (i2 && i2.getBoundingClientRect && (R(i2, "transform") !== "none" || n2 && R(i2, "position") !== "static")) {
              var h2 = i2.getBoundingClientRect();
              a2 -= h2.top + parseInt(R(i2, "border-top-width")), l2 -= h2.left + parseInt(R(i2, "border-left-width")), s2 = a2 + r2.height, c2 = l2 + r2.width;
              break;
            }
          } while (i2 = i2.parentNode);
        return o2 && t2 !== window && (o2 = (e2 = D(i2 || t2)) && e2.a, t2 = e2 && e2.d, e2 && (s2 = (a2 /= t2) + (u2 /= t2), c2 = (l2 /= o2) + (d2 /= o2))), { top: a2, left: l2, bottom: s2, right: c2, width: d2, height: u2 };
      }
    }
    function Y(t2, e2, n2) {
      for (var o2 = M(t2, true), i2 = X(t2)[e2];o2; ) {
        var r2 = X(o2)[n2];
        if (!(n2 === "top" || n2 === "left" ? r2 <= i2 : i2 <= r2))
          return o2;
        if (o2 === O())
          break;
        o2 = M(o2, false);
      }
      return false;
    }
    function B(t2, e2, n2, o2) {
      for (var i2 = 0, r2 = 0, a2 = t2.children;r2 < a2.length; ) {
        if (a2[r2].style.display !== "none" && a2[r2] !== Ht.ghost && (o2 || a2[r2] !== Ht.dragged) && P(a2[r2], n2.draggable, t2, false)) {
          if (i2 === e2)
            return a2[r2];
          i2++;
        }
        r2++;
      }
      return null;
    }
    function F(t2, e2) {
      for (var n2 = t2.lastElementChild;n2 && (n2 === Ht.ghost || R(n2, "display") === "none" || e2 && !g(n2, e2)); )
        n2 = n2.previousElementSibling;
      return n2 || null;
    }
    function j(t2, e2) {
      var n2 = 0;
      if (!t2 || !t2.parentNode)
        return -1;
      for (;t2 = t2.previousElementSibling; )
        t2.nodeName.toUpperCase() === "TEMPLATE" || t2 === Ht.clone || e2 && !g(t2, e2) || n2++;
      return n2;
    }
    function S(t2) {
      var e2 = 0, n2 = 0, o2 = O();
      if (t2)
        do {
          var i2 = D(t2), r2 = i2.a, i2 = i2.d;
        } while (e2 += t2.scrollLeft * r2, n2 += t2.scrollTop * i2, t2 !== o2 && (t2 = t2.parentNode));
      return [e2, n2];
    }
    function M(t2, e2) {
      if (!t2 || !t2.getBoundingClientRect)
        return O();
      var n2 = t2, o2 = false;
      do {
        if (n2.clientWidth < n2.scrollWidth || n2.clientHeight < n2.scrollHeight) {
          var i2 = R(n2);
          if (n2.clientWidth < n2.scrollWidth && (i2.overflowX == "auto" || i2.overflowX == "scroll") || n2.clientHeight < n2.scrollHeight && (i2.overflowY == "auto" || i2.overflowY == "scroll")) {
            if (!n2.getBoundingClientRect || n2 === document.body)
              return O();
            if (o2 || e2)
              return n2;
            o2 = true;
          }
        }
      } while (n2 = n2.parentNode);
      return O();
    }
    function _(t2, e2) {
      return Math.round(t2.top) === Math.round(e2.top) && Math.round(t2.left) === Math.round(e2.left) && Math.round(t2.height) === Math.round(e2.height) && Math.round(t2.width) === Math.round(e2.width);
    }
    function C(e2, n2) {
      return function() {
        var t2;
        v || ((t2 = arguments).length === 1 ? e2.call(this, t2[0]) : e2.apply(this, t2), v = setTimeout(function() {
          v = undefined;
        }, n2));
      };
    }
    function H(t2, e2, n2) {
      t2.scrollLeft += e2, t2.scrollTop += n2;
    }
    function T(t2) {
      var e2 = window.Polymer, n2 = window.jQuery || window.Zepto;
      return e2 && e2.dom ? e2.dom(t2).cloneNode(true) : n2 ? n2(t2).clone(true)[0] : t2.cloneNode(true);
    }
    function x(t2, e2) {
      R(t2, "position", "absolute"), R(t2, "top", e2.top), R(t2, "left", e2.left), R(t2, "width", e2.width), R(t2, "height", e2.height);
    }
    function A(t2) {
      R(t2, "position", ""), R(t2, "top", ""), R(t2, "left", ""), R(t2, "width", ""), R(t2, "height", "");
    }
    function L(n2, o2, i2) {
      var r2 = {};
      return Array.from(n2.children).forEach(function(t2) {
        var e2;
        P(t2, o2.draggable, n2, false) && !t2.animated && t2 !== i2 && (e2 = X(t2), r2.left = Math.min((t2 = r2.left) !== null && t2 !== undefined ? t2 : 1 / 0, e2.left), r2.top = Math.min((t2 = r2.top) !== null && t2 !== undefined ? t2 : 1 / 0, e2.top), r2.right = Math.max((t2 = r2.right) !== null && t2 !== undefined ? t2 : -1 / 0, e2.right), r2.bottom = Math.max((t2 = r2.bottom) !== null && t2 !== undefined ? t2 : -1 / 0, e2.bottom));
      }), r2.width = r2.right - r2.left, r2.height = r2.bottom - r2.top, r2.x = r2.left, r2.y = r2.top, r2;
    }
    var K = "Sortable" + new Date().getTime();
    function N() {
      var e2, o2 = [];
      return { captureAnimationState: function() {
        o2 = [], this.options.animation && [].slice.call(this.el.children).forEach(function(t2) {
          var e3, n2;
          R(t2, "display") !== "none" && t2 !== Ht.ghost && (o2.push({ target: t2, rect: X(t2) }), e3 = I({}, o2[o2.length - 1].rect), !t2.thisAnimationDuration || (n2 = D(t2, true)) && (e3.top -= n2.f, e3.left -= n2.e), t2.fromRect = e3);
        });
      }, addAnimationState: function(t2) {
        o2.push(t2);
      }, removeAnimationState: function(t2) {
        o2.splice(function(t3, e3) {
          for (var n2 in t3)
            if (t3.hasOwnProperty(n2)) {
              for (var o3 in e3)
                if (e3.hasOwnProperty(o3) && e3[o3] === t3[n2][o3])
                  return Number(n2);
            }
          return -1;
        }(o2, { target: t2 }), 1);
      }, animateAll: function(t2) {
        var c2 = this;
        if (!this.options.animation)
          return clearTimeout(e2), void (typeof t2 == "function" && t2());
        var u2 = false, d2 = 0;
        o2.forEach(function(t3) {
          var e3 = 0, n2 = t3.target, o3 = n2.fromRect, i2 = X(n2), r2 = n2.prevFromRect, a2 = n2.prevToRect, l2 = t3.rect, s2 = D(n2, true);
          s2 && (i2.top -= s2.f, i2.left -= s2.e), n2.toRect = i2, n2.thisAnimationDuration && _(r2, i2) && !_(o3, i2) && (l2.top - i2.top) / (l2.left - i2.left) == (o3.top - i2.top) / (o3.left - i2.left) && (t3 = l2, s2 = r2, r2 = a2, a2 = c2.options, e3 = Math.sqrt(Math.pow(s2.top - t3.top, 2) + Math.pow(s2.left - t3.left, 2)) / Math.sqrt(Math.pow(s2.top - r2.top, 2) + Math.pow(s2.left - r2.left, 2)) * a2.animation), _(i2, o3) || (n2.prevFromRect = o3, n2.prevToRect = i2, e3 = e3 || c2.options.animation, c2.animate(n2, l2, i2, e3)), e3 && (u2 = true, d2 = Math.max(d2, e3), clearTimeout(n2.animationResetTimer), n2.animationResetTimer = setTimeout(function() {
            n2.animationTime = 0, n2.prevFromRect = null, n2.fromRect = null, n2.prevToRect = null, n2.thisAnimationDuration = null;
          }, e3), n2.thisAnimationDuration = e3);
        }), clearTimeout(e2), u2 ? e2 = setTimeout(function() {
          typeof t2 == "function" && t2();
        }, d2) : typeof t2 == "function" && t2(), o2 = [];
      }, animate: function(t2, e3, n2, o3) {
        var i2, r2;
        o3 && (R(t2, "transition", ""), R(t2, "transform", ""), i2 = (r2 = D(this.el)) && r2.a, r2 = r2 && r2.d, i2 = (e3.left - n2.left) / (i2 || 1), r2 = (e3.top - n2.top) / (r2 || 1), t2.animatingX = !!i2, t2.animatingY = !!r2, R(t2, "transform", "translate3d(" + i2 + "px," + r2 + "px,0)"), this.forRepaintDummy = t2.offsetWidth, R(t2, "transition", "transform " + o3 + "ms" + (this.options.easing ? " " + this.options.easing : "")), R(t2, "transform", "translate3d(0,0,0)"), typeof t2.animated == "number" && clearTimeout(t2.animated), t2.animated = setTimeout(function() {
          R(t2, "transition", ""), R(t2, "transform", ""), t2.animated = false, t2.animatingX = false, t2.animatingY = false;
        }, o3));
      } };
    }
    var W = [], z = { initializeByDefault: true }, G = { mount: function(e2) {
      for (var t2 in z)
        !z.hasOwnProperty(t2) || t2 in e2 || (e2[t2] = z[t2]);
      W.forEach(function(t3) {
        if (t3.pluginName === e2.pluginName)
          throw "Sortable: Cannot mount plugin ".concat(e2.pluginName, " more than once");
      }), W.push(e2);
    }, pluginEvent: function(e2, n2, o2) {
      var t2 = this;
      this.eventCanceled = false, o2.cancel = function() {
        t2.eventCanceled = true;
      };
      var i2 = e2 + "Global";
      W.forEach(function(t3) {
        n2[t3.pluginName] && (n2[t3.pluginName][i2] && n2[t3.pluginName][i2](I({ sortable: n2 }, o2)), n2.options[t3.pluginName] && n2[t3.pluginName][e2] && n2[t3.pluginName][e2](I({ sortable: n2 }, o2)));
      });
    }, initializePlugins: function(n2, o2, i2, t2) {
      for (var e2 in W.forEach(function(t3) {
        var e3 = t3.pluginName;
        (n2.options[e3] || t3.initializeByDefault) && ((t3 = new t3(n2, o2, n2.options)).sortable = n2, t3.options = n2.options, n2[e3] = t3, a(i2, t3.defaults));
      }), n2.options) {
        var r2;
        n2.options.hasOwnProperty(e2) && ((r2 = this.modifyOption(n2, e2, n2.options[e2])) !== undefined && (n2.options[e2] = r2));
      }
    }, getEventProperties: function(e2, n2) {
      var o2 = {};
      return W.forEach(function(t2) {
        typeof t2.eventProperties == "function" && a(o2, t2.eventProperties.call(n2[t2.pluginName], e2));
      }), o2;
    }, modifyOption: function(e2, n2, o2) {
      var i2;
      return W.forEach(function(t2) {
        e2[t2.pluginName] && t2.optionListeners && typeof t2.optionListeners[n2] == "function" && (i2 = t2.optionListeners[n2].call(e2[t2.pluginName], o2));
      }), i2;
    } };
    function U(t2) {
      var { sortable: e2, rootEl: n2, name: o2, targetEl: i2, cloneEl: r2, toEl: a2, fromEl: l2, oldIndex: s2, newIndex: c2, oldDraggableIndex: u2, newDraggableIndex: d2, originalEvent: h2, putSortable: f2, extraEventProperties: p2 } = t2;
      if (e2 = e2 || n2 && n2[K]) {
        var g2, m2 = e2.options, t2 = "on" + o2.charAt(0).toUpperCase() + o2.substr(1);
        !window.CustomEvent || y || w ? (g2 = document.createEvent("Event")).initEvent(o2, true, true) : g2 = new CustomEvent(o2, { bubbles: true, cancelable: true }), g2.to = a2 || n2, g2.from = l2 || n2, g2.item = i2 || n2, g2.clone = r2, g2.oldIndex = s2, g2.newIndex = c2, g2.oldDraggableIndex = u2, g2.newDraggableIndex = d2, g2.originalEvent = h2, g2.pullMode = f2 ? f2.lastPutMode : undefined;
        var v2, b2 = I(I({}, p2), G.getEventProperties(o2, e2));
        for (v2 in b2)
          g2[v2] = b2[v2];
        n2 && n2.dispatchEvent(g2), m2[t2] && m2[t2].call(e2, g2);
      }
    }
    function q(t2, e2) {
      var n2 = (o2 = 2 < arguments.length && arguments[2] !== undefined ? arguments[2] : {}).evt, o2 = l(o2, V);
      G.pluginEvent.bind(Ht)(t2, e2, I({ dragEl: $, parentEl: Q, ghostEl: J, rootEl: tt, nextEl: et, lastDownEl: nt, cloneEl: ot, cloneHidden: it, dragStarted: vt, putSortable: ut, activeSortable: Ht.active, originalEvent: n2, oldIndex: rt, oldDraggableIndex: lt, newIndex: at, newDraggableIndex: st, hideGhostForTarget: Yt, unhideGhostForTarget: Bt, cloneNowHidden: function() {
        it = true;
      }, cloneNowShown: function() {
        it = false;
      }, dispatchSortableEvent: function(t3) {
        Z({ sortable: e2, name: t3, originalEvent: n2 });
      } }, o2));
    }
    var V = ["evt"];
    function Z(t2) {
      U(I({ putSortable: ut, cloneEl: ot, targetEl: $, rootEl: tt, oldIndex: rt, oldDraggableIndex: lt, newIndex: at, newDraggableIndex: st }, t2));
    }
    var $, Q, J, tt, et, nt, ot, it, rt, at, lt, st, ct, ut, dt, ht, ft, pt, gt, mt, vt, bt, yt, wt, Dt, Et = false, St = false, _t = [], Ct = false, Tt = false, xt = [], Ot = false, Mt = [], At = typeof document != "undefined", Nt = d, It = w || y ? "cssFloat" : "float", Pt = At && !n && !d && "draggable" in document.createElement("div"), kt = function() {
      if (At) {
        if (y)
          return false;
        var t2 = document.createElement("x");
        return t2.style.cssText = "pointer-events:auto", t2.style.pointerEvents === "auto";
      }
    }(), Rt = function(t2, e2) {
      var n2 = R(t2), o2 = parseInt(n2.width) - parseInt(n2.paddingLeft) - parseInt(n2.paddingRight) - parseInt(n2.borderLeftWidth) - parseInt(n2.borderRightWidth), i2 = B(t2, 0, e2), r2 = B(t2, 1, e2), a2 = i2 && R(i2), l2 = r2 && R(r2), s2 = a2 && parseInt(a2.marginLeft) + parseInt(a2.marginRight) + X(i2).width, t2 = l2 && parseInt(l2.marginLeft) + parseInt(l2.marginRight) + X(r2).width;
      if (n2.display === "flex")
        return n2.flexDirection === "column" || n2.flexDirection === "column-reverse" ? "vertical" : "horizontal";
      if (n2.display === "grid")
        return n2.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
      if (i2 && a2.float && a2.float !== "none") {
        e2 = a2.float === "left" ? "left" : "right";
        return !r2 || l2.clear !== "both" && l2.clear !== e2 ? "horizontal" : "vertical";
      }
      return i2 && (a2.display === "block" || a2.display === "flex" || a2.display === "table" || a2.display === "grid" || o2 <= s2 && n2[It] === "none" || r2 && n2[It] === "none" && o2 < s2 + t2) ? "vertical" : "horizontal";
    }, Xt = function(t2) {
      function l2(r2, a2) {
        return function(t3, e3, n3, o2) {
          var i2 = t3.options.group.name && e3.options.group.name && t3.options.group.name === e3.options.group.name;
          if (r2 == null && (a2 || i2))
            return true;
          if (r2 == null || r2 === false)
            return false;
          if (a2 && r2 === "clone")
            return r2;
          if (typeof r2 == "function")
            return l2(r2(t3, e3, n3, o2), a2)(t3, e3, n3, o2);
          e3 = (a2 ? t3 : e3).options.group.name;
          return r2 === true || typeof r2 == "string" && r2 === e3 || r2.join && -1 < r2.indexOf(e3);
        };
      }
      var e2 = {}, n2 = t2.group;
      n2 && s(n2) == "object" || (n2 = { name: n2 }), e2.name = n2.name, e2.checkPull = l2(n2.pull, true), e2.checkPut = l2(n2.put), e2.revertClone = n2.revertClone, t2.group = e2;
    }, Yt = function() {
      !kt && J && R(J, "display", "none");
    }, Bt = function() {
      !kt && J && R(J, "display", "");
    };
    At && !n && document.addEventListener("click", function(t2) {
      if (St)
        return t2.preventDefault(), t2.stopPropagation && t2.stopPropagation(), t2.stopImmediatePropagation && t2.stopImmediatePropagation(), St = false;
    }, true);
    function Ft(t2) {
      if ($) {
        t2 = t2.touches ? t2.touches[0] : t2;
        var e2 = (i2 = t2.clientX, r2 = t2.clientY, _t.some(function(t3) {
          var e3 = t3[K].options.emptyInsertThreshold;
          if (e3 && !F(t3)) {
            var n3 = X(t3), o3 = i2 >= n3.left - e3 && i2 <= n3.right + e3, e3 = r2 >= n3.top - e3 && r2 <= n3.bottom + e3;
            return o3 && e3 ? a2 = t3 : undefined;
          }
        }), a2);
        if (e2) {
          var n2, o2 = {};
          for (n2 in t2)
            t2.hasOwnProperty(n2) && (o2[n2] = t2[n2]);
          o2.target = o2.rootEl = e2, o2.preventDefault = undefined, o2.stopPropagation = undefined, e2[K]._onDragOver(o2);
        }
      }
      var i2, r2, a2;
    }
    function jt(t2) {
      $ && $.parentNode[K]._isOutsideThisEl(t2.target);
    }
    function Ht(t2, e2) {
      if (!t2 || !t2.nodeType || t2.nodeType !== 1)
        throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(t2));
      this.el = t2, this.options = e2 = a({}, e2), t2[K] = this;
      var n2, o2, i2 = { group: null, sort: true, disabled: false, store: null, handle: null, draggable: /^[uo]l$/i.test(t2.nodeName) ? ">li" : ">*", swapThreshold: 1, invertSwap: false, invertedSwapThreshold: null, removeCloneOnHide: true, direction: function() {
        return Rt(t2, this.options);
      }, ghostClass: "sortable-ghost", chosenClass: "sortable-chosen", dragClass: "sortable-drag", ignore: "a, img", filter: null, preventOnFilter: true, animation: 0, easing: null, setData: function(t3, e3) {
        t3.setData("Text", e3.textContent);
      }, dropBubble: false, dragoverBubble: false, dataIdAttr: "data-id", delay: 0, delayOnTouchOnly: false, touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1, forceFallback: false, fallbackClass: "sortable-fallback", fallbackOnBody: false, fallbackTolerance: 0, fallbackOffset: { x: 0, y: 0 }, supportPointer: Ht.supportPointer !== false && "PointerEvent" in window && (!u || d), emptyInsertThreshold: 5 };
      for (n2 in G.initializePlugins(this, t2, i2), i2)
        n2 in e2 || (e2[n2] = i2[n2]);
      for (o2 in Xt(e2), this)
        o2.charAt(0) === "_" && typeof this[o2] == "function" && (this[o2] = this[o2].bind(this));
      this.nativeDraggable = !e2.forceFallback && Pt, this.nativeDraggable && (this.options.touchStartThreshold = 1), e2.supportPointer ? f(t2, "pointerdown", this._onTapStart) : (f(t2, "mousedown", this._onTapStart), f(t2, "touchstart", this._onTapStart)), this.nativeDraggable && (f(t2, "dragover", this), f(t2, "dragenter", this)), _t.push(this.el), e2.store && e2.store.get && this.sort(e2.store.get(this) || []), a(this, N());
    }
    function Lt(t2, e2, n2, o2, i2, r2, a2, l2) {
      var s2, c2, u2 = t2[K], d2 = u2.options.onMove;
      return !window.CustomEvent || y || w ? (s2 = document.createEvent("Event")).initEvent("move", true, true) : s2 = new CustomEvent("move", { bubbles: true, cancelable: true }), s2.to = e2, s2.from = t2, s2.dragged = n2, s2.draggedRect = o2, s2.related = i2 || e2, s2.relatedRect = r2 || X(e2), s2.willInsertAfter = l2, s2.originalEvent = a2, t2.dispatchEvent(s2), c2 = d2 ? d2.call(u2, s2, a2) : c2;
    }
    function Kt(t2) {
      t2.draggable = false;
    }
    function Wt() {
      Ot = false;
    }
    function zt(t2) {
      return setTimeout(t2, 0);
    }
    function Gt(t2) {
      return clearTimeout(t2);
    }
    Ht.prototype = { constructor: Ht, _isOutsideThisEl: function(t2) {
      this.el.contains(t2) || t2 === this.el || (bt = null);
    }, _getDirection: function(t2, e2) {
      return typeof this.options.direction == "function" ? this.options.direction.call(this, t2, e2, $) : this.options.direction;
    }, _onTapStart: function(e2) {
      if (e2.cancelable) {
        var n2 = this, o2 = this.el, t2 = this.options, i2 = t2.preventOnFilter, r2 = e2.type, a2 = e2.touches && e2.touches[0] || e2.pointerType && e2.pointerType === "touch" && e2, l2 = (a2 || e2).target, s2 = e2.target.shadowRoot && (e2.path && e2.path[0] || e2.composedPath && e2.composedPath()[0]) || l2, c2 = t2.filter;
        if (!function(t3) {
          Mt.length = 0;
          var e3 = t3.getElementsByTagName("input"), n3 = e3.length;
          for (;n3--; ) {
            var o3 = e3[n3];
            o3.checked && Mt.push(o3);
          }
        }(o2), !$ && !(/mousedown|pointerdown/.test(r2) && e2.button !== 0 || t2.disabled) && !s2.isContentEditable && (this.nativeDraggable || !u || !l2 || l2.tagName.toUpperCase() !== "SELECT") && !((l2 = P(l2, t2.draggable, o2, false)) && l2.animated || nt === l2)) {
          if (rt = j(l2), lt = j(l2, t2.draggable), typeof c2 == "function") {
            if (c2.call(this, e2, l2, this))
              return Z({ sortable: n2, rootEl: s2, name: "filter", targetEl: l2, toEl: o2, fromEl: o2 }), q("filter", n2, { evt: e2 }), void (i2 && e2.preventDefault());
          } else if (c2 = c2 && c2.split(",").some(function(t3) {
            if (t3 = P(s2, t3.trim(), o2, false))
              return Z({ sortable: n2, rootEl: t3, name: "filter", targetEl: l2, fromEl: o2, toEl: o2 }), q("filter", n2, { evt: e2 }), true;
          }))
            return void (i2 && e2.preventDefault());
          t2.handle && !P(s2, t2.handle, o2, false) || this._prepareDragStart(e2, a2, l2);
        }
      }
    }, _prepareDragStart: function(t2, e2, n2) {
      var o2, i2 = this, r2 = i2.el, a2 = i2.options, l2 = r2.ownerDocument;
      n2 && !$ && n2.parentNode === r2 && (o2 = X(n2), tt = r2, Q = ($ = n2).parentNode, et = $.nextSibling, nt = n2, ct = a2.group, dt = { target: Ht.dragged = $, clientX: (e2 || t2).clientX, clientY: (e2 || t2).clientY }, gt = dt.clientX - o2.left, mt = dt.clientY - o2.top, this._lastX = (e2 || t2).clientX, this._lastY = (e2 || t2).clientY, $.style["will-change"] = "all", o2 = function() {
        q("delayEnded", i2, { evt: t2 }), Ht.eventCanceled ? i2._onDrop() : (i2._disableDelayedDragEvents(), !c && i2.nativeDraggable && ($.draggable = true), i2._triggerDragStart(t2, e2), Z({ sortable: i2, name: "choose", originalEvent: t2 }), k($, a2.chosenClass, true));
      }, a2.ignore.split(",").forEach(function(t3) {
        E($, t3.trim(), Kt);
      }), f(l2, "dragover", Ft), f(l2, "mousemove", Ft), f(l2, "touchmove", Ft), a2.supportPointer ? (f(l2, "pointerup", i2._onDrop), this.nativeDraggable || f(l2, "pointercancel", i2._onDrop)) : (f(l2, "mouseup", i2._onDrop), f(l2, "touchend", i2._onDrop), f(l2, "touchcancel", i2._onDrop)), c && this.nativeDraggable && (this.options.touchStartThreshold = 4, $.draggable = true), q("delayStart", this, { evt: t2 }), !a2.delay || a2.delayOnTouchOnly && !e2 || this.nativeDraggable && (w || y) ? o2() : Ht.eventCanceled ? this._onDrop() : (a2.supportPointer ? (f(l2, "pointerup", i2._disableDelayedDrag), f(l2, "pointercancel", i2._disableDelayedDrag)) : (f(l2, "mouseup", i2._disableDelayedDrag), f(l2, "touchend", i2._disableDelayedDrag), f(l2, "touchcancel", i2._disableDelayedDrag)), f(l2, "mousemove", i2._delayedDragTouchMoveHandler), f(l2, "touchmove", i2._delayedDragTouchMoveHandler), a2.supportPointer && f(l2, "pointermove", i2._delayedDragTouchMoveHandler), i2._dragStartTimer = setTimeout(o2, a2.delay)));
    }, _delayedDragTouchMoveHandler: function(t2) {
      t2 = t2.touches ? t2.touches[0] : t2;
      Math.max(Math.abs(t2.clientX - this._lastX), Math.abs(t2.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1)) && this._disableDelayedDrag();
    }, _disableDelayedDrag: function() {
      $ && Kt($), clearTimeout(this._dragStartTimer), this._disableDelayedDragEvents();
    }, _disableDelayedDragEvents: function() {
      var t2 = this.el.ownerDocument;
      p(t2, "mouseup", this._disableDelayedDrag), p(t2, "touchend", this._disableDelayedDrag), p(t2, "touchcancel", this._disableDelayedDrag), p(t2, "pointerup", this._disableDelayedDrag), p(t2, "pointercancel", this._disableDelayedDrag), p(t2, "mousemove", this._delayedDragTouchMoveHandler), p(t2, "touchmove", this._delayedDragTouchMoveHandler), p(t2, "pointermove", this._delayedDragTouchMoveHandler);
    }, _triggerDragStart: function(t2, e2) {
      e2 = e2 || t2.pointerType == "touch" && t2, !this.nativeDraggable || e2 ? this.options.supportPointer ? f(document, "pointermove", this._onTouchMove) : f(document, e2 ? "touchmove" : "mousemove", this._onTouchMove) : (f($, "dragend", this), f(tt, "dragstart", this._onDragStart));
      try {
        document.selection ? zt(function() {
          document.selection.empty();
        }) : window.getSelection().removeAllRanges();
      } catch (t3) {}
    }, _dragStarted: function(t2, e2) {
      var n2;
      Et = false, tt && $ ? (q("dragStarted", this, { evt: e2 }), this.nativeDraggable && f(document, "dragover", jt), n2 = this.options, t2 || k($, n2.dragClass, false), k($, n2.ghostClass, true), Ht.active = this, t2 && this._appendGhost(), Z({ sortable: this, name: "start", originalEvent: e2 })) : this._nulling();
    }, _emulateDragOver: function() {
      if (ht) {
        this._lastX = ht.clientX, this._lastY = ht.clientY, Yt();
        for (var t2 = document.elementFromPoint(ht.clientX, ht.clientY), e2 = t2;t2 && t2.shadowRoot && (t2 = t2.shadowRoot.elementFromPoint(ht.clientX, ht.clientY)) !== e2; )
          e2 = t2;
        if ($.parentNode[K]._isOutsideThisEl(t2), e2)
          do {
            if (e2[K]) {
              if (e2[K]._onDragOver({ clientX: ht.clientX, clientY: ht.clientY, target: t2, rootEl: e2 }) && !this.options.dragoverBubble)
                break;
            }
          } while (e2 = m(t2 = e2));
        Bt();
      }
    }, _onTouchMove: function(t2) {
      if (dt) {
        var e2 = this.options, n2 = e2.fallbackTolerance, o2 = e2.fallbackOffset, i2 = t2.touches ? t2.touches[0] : t2, r2 = J && D(J, true), a2 = J && r2 && r2.a, l2 = J && r2 && r2.d, e2 = Nt && Dt && S(Dt), a2 = (i2.clientX - dt.clientX + o2.x) / (a2 || 1) + (e2 ? e2[0] - xt[0] : 0) / (a2 || 1), l2 = (i2.clientY - dt.clientY + o2.y) / (l2 || 1) + (e2 ? e2[1] - xt[1] : 0) / (l2 || 1);
        if (!Ht.active && !Et) {
          if (n2 && Math.max(Math.abs(i2.clientX - this._lastX), Math.abs(i2.clientY - this._lastY)) < n2)
            return;
          this._onDragStart(t2, true);
        }
        J && (r2 ? (r2.e += a2 - (ft || 0), r2.f += l2 - (pt || 0)) : r2 = { a: 1, b: 0, c: 0, d: 1, e: a2, f: l2 }, r2 = "matrix(".concat(r2.a, ",").concat(r2.b, ",").concat(r2.c, ",").concat(r2.d, ",").concat(r2.e, ",").concat(r2.f, ")"), R(J, "webkitTransform", r2), R(J, "mozTransform", r2), R(J, "msTransform", r2), R(J, "transform", r2), ft = a2, pt = l2, ht = i2), t2.cancelable && t2.preventDefault();
      }
    }, _appendGhost: function() {
      if (!J) {
        var t2 = this.options.fallbackOnBody ? document.body : tt, e2 = X($, true, Nt, true, t2), n2 = this.options;
        if (Nt) {
          for (Dt = t2;R(Dt, "position") === "static" && R(Dt, "transform") === "none" && Dt !== document; )
            Dt = Dt.parentNode;
          Dt !== document.body && Dt !== document.documentElement ? (Dt === document && (Dt = O()), e2.top += Dt.scrollTop, e2.left += Dt.scrollLeft) : Dt = O(), xt = S(Dt);
        }
        k(J = $.cloneNode(true), n2.ghostClass, false), k(J, n2.fallbackClass, true), k(J, n2.dragClass, true), R(J, "transition", ""), R(J, "transform", ""), R(J, "box-sizing", "border-box"), R(J, "margin", 0), R(J, "top", e2.top), R(J, "left", e2.left), R(J, "width", e2.width), R(J, "height", e2.height), R(J, "opacity", "0.8"), R(J, "position", Nt ? "absolute" : "fixed"), R(J, "zIndex", "100000"), R(J, "pointerEvents", "none"), Ht.ghost = J, t2.appendChild(J), R(J, "transform-origin", gt / parseInt(J.style.width) * 100 + "% " + mt / parseInt(J.style.height) * 100 + "%");
      }
    }, _onDragStart: function(t2, e2) {
      var n2 = this, o2 = t2.dataTransfer, i2 = n2.options;
      q("dragStart", this, { evt: t2 }), Ht.eventCanceled ? this._onDrop() : (q("setupClone", this), Ht.eventCanceled || ((ot = T($)).removeAttribute("id"), ot.draggable = false, ot.style["will-change"] = "", this._hideClone(), k(ot, this.options.chosenClass, false), Ht.clone = ot), n2.cloneId = zt(function() {
        q("clone", n2), Ht.eventCanceled || (n2.options.removeCloneOnHide || tt.insertBefore(ot, $), n2._hideClone(), Z({ sortable: n2, name: "clone" }));
      }), e2 || k($, i2.dragClass, true), e2 ? (St = true, n2._loopId = setInterval(n2._emulateDragOver, 50)) : (p(document, "mouseup", n2._onDrop), p(document, "touchend", n2._onDrop), p(document, "touchcancel", n2._onDrop), o2 && (o2.effectAllowed = "move", i2.setData && i2.setData.call(n2, o2, $)), f(document, "drop", n2), R($, "transform", "translateZ(0)")), Et = true, n2._dragStartId = zt(n2._dragStarted.bind(n2, e2, t2)), f(document, "selectstart", n2), vt = true, window.getSelection().removeAllRanges(), u && R(document.body, "user-select", "none"));
    }, _onDragOver: function(n2) {
      var o2, i2, r2, t2, e2, a2 = this.el, l2 = n2.target, s2 = this.options, c2 = s2.group, u2 = Ht.active, d2 = ct === c2, h2 = s2.sort, f2 = ut || u2, p2 = this, g2 = false;
      if (!Ot) {
        if (n2.preventDefault !== undefined && n2.cancelable && n2.preventDefault(), l2 = P(l2, s2.draggable, a2, true), O2("dragOver"), Ht.eventCanceled)
          return g2;
        if ($.contains(n2.target) || l2.animated && l2.animatingX && l2.animatingY || p2._ignoreWhileAnimating === l2)
          return A2(false);
        if (St = false, u2 && !s2.disabled && (d2 ? h2 || (i2 = Q !== tt) : ut === this || (this.lastPutMode = ct.checkPull(this, u2, $, n2)) && c2.checkPut(this, u2, $, n2))) {
          if (r2 = this._getDirection(n2, l2) === "vertical", o2 = X($), O2("dragOverValid"), Ht.eventCanceled)
            return g2;
          if (i2)
            return Q = tt, M2(), this._hideClone(), O2("revert"), Ht.eventCanceled || (et ? tt.insertBefore($, et) : tt.appendChild($)), A2(true);
          var m2 = F(a2, s2.draggable);
          if (m2 && (S2 = n2, c2 = r2, x2 = X(F((E2 = this).el, E2.options.draggable)), E2 = L(E2.el, E2.options, J), !(c2 ? S2.clientX > E2.right + 10 || S2.clientY > x2.bottom && S2.clientX > x2.left : S2.clientY > E2.bottom + 10 || S2.clientX > x2.right && S2.clientY > x2.top) || m2.animated)) {
            if (m2 && (t2 = n2, e2 = r2, C2 = X(B((_2 = this).el, 0, _2.options, true)), _2 = L(_2.el, _2.options, J), e2 ? t2.clientX < _2.left - 10 || t2.clientY < C2.top && t2.clientX < C2.right : t2.clientY < _2.top - 10 || t2.clientY < C2.bottom && t2.clientX < C2.left)) {
              var v2 = B(a2, 0, s2, true);
              if (v2 === $)
                return A2(false);
              if (D2 = X(l2 = v2), Lt(tt, a2, $, o2, l2, D2, n2, false) !== false)
                return M2(), a2.insertBefore($, v2), Q = a2, N2(), A2(true);
            } else if (l2.parentNode === a2) {
              var b2, y2, w2, D2 = X(l2), E2 = $.parentNode !== a2, S2 = (S2 = $.animated && $.toRect || o2, x2 = l2.animated && l2.toRect || D2, _2 = (e2 = r2) ? S2.left : S2.top, t2 = e2 ? S2.right : S2.bottom, C2 = e2 ? S2.width : S2.height, v2 = e2 ? x2.left : x2.top, S2 = e2 ? x2.right : x2.bottom, x2 = e2 ? x2.width : x2.height, !(_2 === v2 || t2 === S2 || _2 + C2 / 2 === v2 + x2 / 2)), _2 = r2 ? "top" : "left", C2 = Y(l2, "top", "top") || Y($, "top", "top"), v2 = C2 ? C2.scrollTop : undefined;
              if (bt !== l2 && (y2 = D2[_2], Ct = false, Tt = !S2 && s2.invertSwap || E2), (b2 = function(t3, e3, n3, o3, i3, r3, a3, l3) {
                var s3 = o3 ? t3.clientY : t3.clientX, c3 = o3 ? n3.height : n3.width, t3 = o3 ? n3.top : n3.left, o3 = o3 ? n3.bottom : n3.right, n3 = false;
                if (!a3) {
                  if (l3 && wt < c3 * i3) {
                    if (Ct = !Ct && (yt === 1 ? t3 + c3 * r3 / 2 < s3 : s3 < o3 - c3 * r3 / 2) ? true : Ct)
                      n3 = true;
                    else if (yt === 1 ? s3 < t3 + wt : o3 - wt < s3)
                      return -yt;
                  } else if (t3 + c3 * (1 - i3) / 2 < s3 && s3 < o3 - c3 * (1 - i3) / 2)
                    return function(t4) {
                      return j($) < j(t4) ? 1 : -1;
                    }(e3);
                }
                if ((n3 = n3 || a3) && (s3 < t3 + c3 * r3 / 2 || o3 - c3 * r3 / 2 < s3))
                  return t3 + c3 / 2 < s3 ? 1 : -1;
                return 0;
              }(n2, l2, D2, r2, S2 ? 1 : s2.swapThreshold, s2.invertedSwapThreshold == null ? s2.swapThreshold : s2.invertedSwapThreshold, Tt, bt === l2)) !== 0)
                for (var T2 = j($);(w2 = Q.children[T2 -= b2]) && (R(w2, "display") === "none" || w2 === J); )
                  ;
              if (b2 === 0 || w2 === l2)
                return A2(false);
              yt = b2;
              var x2 = (bt = l2).nextElementSibling, E2 = false, S2 = Lt(tt, a2, $, o2, l2, D2, n2, E2 = b2 === 1);
              if (S2 !== false)
                return S2 !== 1 && S2 !== -1 || (E2 = S2 === 1), Ot = true, setTimeout(Wt, 30), M2(), E2 && !x2 ? a2.appendChild($) : l2.parentNode.insertBefore($, E2 ? x2 : l2), C2 && H(C2, 0, v2 - C2.scrollTop), Q = $.parentNode, y2 === undefined || Tt || (wt = Math.abs(y2 - X(l2)[_2])), N2(), A2(true);
            }
          } else {
            if (m2 === $)
              return A2(false);
            if ((l2 = m2 && a2 === n2.target ? m2 : l2) && (D2 = X(l2)), Lt(tt, a2, $, o2, l2, D2, n2, !!l2) !== false)
              return M2(), m2 && m2.nextSibling ? a2.insertBefore($, m2.nextSibling) : a2.appendChild($), Q = a2, N2(), A2(true);
          }
          if (a2.contains($))
            return A2(false);
        }
        return false;
      }
      function O2(t3, e3) {
        q(t3, p2, I({ evt: n2, isOwner: d2, axis: r2 ? "vertical" : "horizontal", revert: i2, dragRect: o2, targetRect: D2, canSort: h2, fromSortable: f2, target: l2, completed: A2, onMove: function(t4, e4) {
          return Lt(tt, a2, $, o2, t4, X(t4), n2, e4);
        }, changed: N2 }, e3));
      }
      function M2() {
        O2("dragOverAnimationCapture"), p2.captureAnimationState(), p2 !== f2 && f2.captureAnimationState();
      }
      function A2(t3) {
        return O2("dragOverCompleted", { insertion: t3 }), t3 && (d2 ? u2._hideClone() : u2._showClone(p2), p2 !== f2 && (k($, (ut || u2).options.ghostClass, false), k($, s2.ghostClass, true)), ut !== p2 && p2 !== Ht.active ? ut = p2 : p2 === Ht.active && ut && (ut = null), f2 === p2 && (p2._ignoreWhileAnimating = l2), p2.animateAll(function() {
          O2("dragOverAnimationComplete"), p2._ignoreWhileAnimating = null;
        }), p2 !== f2 && (f2.animateAll(), f2._ignoreWhileAnimating = null)), (l2 === $ && !$.animated || l2 === a2 && !l2.animated) && (bt = null), s2.dragoverBubble || n2.rootEl || l2 === document || ($.parentNode[K]._isOutsideThisEl(n2.target), t3 || Ft(n2)), !s2.dragoverBubble && n2.stopPropagation && n2.stopPropagation(), g2 = true;
      }
      function N2() {
        at = j($), st = j($, s2.draggable), Z({ sortable: p2, name: "change", toEl: a2, newIndex: at, newDraggableIndex: st, originalEvent: n2 });
      }
    }, _ignoreWhileAnimating: null, _offMoveEvents: function() {
      p(document, "mousemove", this._onTouchMove), p(document, "touchmove", this._onTouchMove), p(document, "pointermove", this._onTouchMove), p(document, "dragover", Ft), p(document, "mousemove", Ft), p(document, "touchmove", Ft);
    }, _offUpEvents: function() {
      var t2 = this.el.ownerDocument;
      p(t2, "mouseup", this._onDrop), p(t2, "touchend", this._onDrop), p(t2, "pointerup", this._onDrop), p(t2, "pointercancel", this._onDrop), p(t2, "touchcancel", this._onDrop), p(document, "selectstart", this);
    }, _onDrop: function(t2) {
      var e2 = this.el, n2 = this.options;
      at = j($), st = j($, n2.draggable), q("drop", this, { evt: t2 }), Q = $ && $.parentNode, at = j($), st = j($, n2.draggable), Ht.eventCanceled || (Ct = Tt = Et = false, clearInterval(this._loopId), clearTimeout(this._dragStartTimer), Gt(this.cloneId), Gt(this._dragStartId), this.nativeDraggable && (p(document, "drop", this), p(e2, "dragstart", this._onDragStart)), this._offMoveEvents(), this._offUpEvents(), u && R(document.body, "user-select", ""), R($, "transform", ""), t2 && (vt && (t2.cancelable && t2.preventDefault(), n2.dropBubble || t2.stopPropagation()), J && J.parentNode && J.parentNode.removeChild(J), (tt === Q || ut && ut.lastPutMode !== "clone") && ot && ot.parentNode && ot.parentNode.removeChild(ot), $ && (this.nativeDraggable && p($, "dragend", this), Kt($), $.style["will-change"] = "", vt && !Et && k($, (ut || this).options.ghostClass, false), k($, this.options.chosenClass, false), Z({ sortable: this, name: "unchoose", toEl: Q, newIndex: null, newDraggableIndex: null, originalEvent: t2 }), tt !== Q ? (0 <= at && (Z({ rootEl: Q, name: "add", toEl: Q, fromEl: tt, originalEvent: t2 }), Z({ sortable: this, name: "remove", toEl: Q, originalEvent: t2 }), Z({ rootEl: Q, name: "sort", toEl: Q, fromEl: tt, originalEvent: t2 }), Z({ sortable: this, name: "sort", toEl: Q, originalEvent: t2 })), ut && ut.save()) : at !== rt && 0 <= at && (Z({ sortable: this, name: "update", toEl: Q, originalEvent: t2 }), Z({ sortable: this, name: "sort", toEl: Q, originalEvent: t2 })), Ht.active && (at != null && at !== -1 || (at = rt, st = lt), Z({ sortable: this, name: "end", toEl: Q, originalEvent: t2 }), this.save())))), this._nulling();
    }, _nulling: function() {
      q("nulling", this), tt = $ = Q = J = et = ot = nt = it = dt = ht = vt = at = st = rt = lt = bt = yt = ut = ct = Ht.dragged = Ht.ghost = Ht.clone = Ht.active = null;
      var e2 = this.el;
      Mt.forEach(function(t2) {
        e2.contains(t2) && (t2.checked = true);
      }), Mt.length = ft = pt = 0;
    }, handleEvent: function(t2) {
      switch (t2.type) {
        case "drop":
        case "dragend":
          this._onDrop(t2);
          break;
        case "dragenter":
        case "dragover":
          $ && (this._onDragOver(t2), function(t3) {
            t3.dataTransfer && (t3.dataTransfer.dropEffect = "move");
            t3.cancelable && t3.preventDefault();
          }(t2));
          break;
        case "selectstart":
          t2.preventDefault();
      }
    }, toArray: function() {
      for (var t2, e2 = [], n2 = this.el.children, o2 = 0, i2 = n2.length, r2 = this.options;o2 < i2; o2++)
        P(t2 = n2[o2], r2.draggable, this.el, false) && e2.push(t2.getAttribute(r2.dataIdAttr) || function(t3) {
          var e3 = t3.tagName + t3.className + t3.src + t3.href + t3.textContent, n3 = e3.length, o3 = 0;
          for (;n3--; )
            o3 += e3.charCodeAt(n3);
          return o3.toString(36);
        }(t2));
      return e2;
    }, sort: function(t2, e2) {
      var n2 = {}, o2 = this.el;
      this.toArray().forEach(function(t3, e3) {
        e3 = o2.children[e3];
        P(e3, this.options.draggable, o2, false) && (n2[t3] = e3);
      }, this), e2 && this.captureAnimationState(), t2.forEach(function(t3) {
        n2[t3] && (o2.removeChild(n2[t3]), o2.appendChild(n2[t3]));
      }), e2 && this.animateAll();
    }, save: function() {
      var t2 = this.options.store;
      t2 && t2.set && t2.set(this);
    }, closest: function(t2, e2) {
      return P(t2, e2 || this.options.draggable, this.el, false);
    }, option: function(t2, e2) {
      var n2 = this.options;
      if (e2 === undefined)
        return n2[t2];
      var o2 = G.modifyOption(this, t2, e2);
      n2[t2] = o2 !== undefined ? o2 : e2, t2 === "group" && Xt(n2);
    }, destroy: function() {
      q("destroy", this);
      var t2 = this.el;
      t2[K] = null, p(t2, "mousedown", this._onTapStart), p(t2, "touchstart", this._onTapStart), p(t2, "pointerdown", this._onTapStart), this.nativeDraggable && (p(t2, "dragover", this), p(t2, "dragenter", this)), Array.prototype.forEach.call(t2.querySelectorAll("[draggable]"), function(t3) {
        t3.removeAttribute("draggable");
      }), this._onDrop(), this._disableDelayedDragEvents(), _t.splice(_t.indexOf(this.el), 1), this.el = t2 = null;
    }, _hideClone: function() {
      it || (q("hideClone", this), Ht.eventCanceled || (R(ot, "display", "none"), this.options.removeCloneOnHide && ot.parentNode && ot.parentNode.removeChild(ot), it = true));
    }, _showClone: function(t2) {
      t2.lastPutMode === "clone" ? it && (q("showClone", this), Ht.eventCanceled || ($.parentNode != tt || this.options.group.revertClone ? et ? tt.insertBefore(ot, et) : tt.appendChild(ot) : tt.insertBefore(ot, $), this.options.group.revertClone && this.animate($, ot), R(ot, "display", ""), it = false)) : this._hideClone();
    } }, At && f(document, "touchmove", function(t2) {
      (Ht.active || Et) && t2.cancelable && t2.preventDefault();
    }), Ht.utils = { on: f, off: p, css: R, find: E, is: function(t2, e2) {
      return !!P(t2, e2, t2, false);
    }, extend: function(t2, e2) {
      if (t2 && e2)
        for (var n2 in e2)
          e2.hasOwnProperty(n2) && (t2[n2] = e2[n2]);
      return t2;
    }, throttle: C, closest: P, toggleClass: k, clone: T, index: j, nextTick: zt, cancelNextTick: Gt, detectDirection: Rt, getChild: B, expando: K }, Ht.get = function(t2) {
      return t2[K];
    }, Ht.mount = function() {
      for (var t2 = arguments.length, e2 = new Array(t2), n2 = 0;n2 < t2; n2++)
        e2[n2] = arguments[n2];
      (e2 = e2[0].constructor === Array ? e2[0] : e2).forEach(function(t3) {
        if (!t3.prototype || !t3.prototype.constructor)
          throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(t3));
        t3.utils && (Ht.utils = I(I({}, Ht.utils), t3.utils)), G.mount(t3);
      });
    }, Ht.create = function(t2, e2) {
      return new Ht(t2, e2);
    };
    var Ut, qt, Vt, Zt, $t, Qt, Jt = [], te = !(Ht.version = "1.15.7");
    function ee() {
      Jt.forEach(function(t2) {
        clearInterval(t2.pid);
      }), Jt = [];
    }
    function ne() {
      clearInterval(Qt);
    }
    var oe, ie = C(function(n2, t2, e2, o2) {
      if (t2.scroll) {
        var i2, r2 = (n2.touches ? n2.touches[0] : n2).clientX, a2 = (n2.touches ? n2.touches[0] : n2).clientY, l2 = t2.scrollSensitivity, s2 = t2.scrollSpeed, c2 = O(), u2 = false;
        qt !== e2 && (qt = e2, ee(), Ut = t2.scroll, i2 = t2.scrollFn, Ut === true && (Ut = M(e2, true)));
        var d2 = 0, h2 = Ut;
        do {
          var f2 = h2, p2 = X(f2), g2 = p2.top, m2 = p2.bottom, v2 = p2.left, b2 = p2.right, y2 = p2.width, w2 = p2.height, D2 = undefined, E2 = undefined, S2 = f2.scrollWidth, _2 = f2.scrollHeight, C2 = R(f2), T2 = f2.scrollLeft, p2 = f2.scrollTop, E2 = f2 === c2 ? (D2 = y2 < S2 && (C2.overflowX === "auto" || C2.overflowX === "scroll" || C2.overflowX === "visible"), w2 < _2 && (C2.overflowY === "auto" || C2.overflowY === "scroll" || C2.overflowY === "visible")) : (D2 = y2 < S2 && (C2.overflowX === "auto" || C2.overflowX === "scroll"), w2 < _2 && (C2.overflowY === "auto" || C2.overflowY === "scroll")), T2 = D2 && (Math.abs(b2 - r2) <= l2 && T2 + y2 < S2) - (Math.abs(v2 - r2) <= l2 && !!T2), p2 = E2 && (Math.abs(m2 - a2) <= l2 && p2 + w2 < _2) - (Math.abs(g2 - a2) <= l2 && !!p2);
          if (!Jt[d2])
            for (var x2 = 0;x2 <= d2; x2++)
              Jt[x2] || (Jt[x2] = {});
          Jt[d2].vx == T2 && Jt[d2].vy == p2 && Jt[d2].el === f2 || (Jt[d2].el = f2, Jt[d2].vx = T2, Jt[d2].vy = p2, clearInterval(Jt[d2].pid), T2 == 0 && p2 == 0 || (u2 = true, Jt[d2].pid = setInterval(function() {
            o2 && this.layer === 0 && Ht.active._onTouchMove($t);
            var t3 = Jt[this.layer].vy ? Jt[this.layer].vy * s2 : 0, e3 = Jt[this.layer].vx ? Jt[this.layer].vx * s2 : 0;
            typeof i2 == "function" && i2.call(Ht.dragged.parentNode[K], e3, t3, n2, $t, Jt[this.layer].el) !== "continue" || H(Jt[this.layer].el, e3, t3);
          }.bind({ layer: d2 }), 24))), d2++;
        } while (t2.bubbleScroll && h2 !== c2 && (h2 = M(h2, false)));
        te = u2;
      }
    }, 30), n = function(t2) {
      var { originalEvent: e2, putSortable: n2, dragEl: o2, activeSortable: i2, dispatchSortableEvent: r2, hideGhostForTarget: a2, unhideGhostForTarget: t2 } = t2;
      e2 && (i2 = n2 || i2, a2(), e2 = e2.changedTouches && e2.changedTouches.length ? e2.changedTouches[0] : e2, e2 = document.elementFromPoint(e2.clientX, e2.clientY), t2(), i2 && !i2.el.contains(e2) && (r2("spill"), this.onSpill({ dragEl: o2, putSortable: n2 })));
    };
    function re() {}
    function ae() {}
    re.prototype = { startIndex: null, dragStart: function(t2) {
      t2 = t2.oldDraggableIndex;
      this.startIndex = t2;
    }, onSpill: function(t2) {
      var { dragEl: e2, putSortable: n2 } = t2;
      this.sortable.captureAnimationState(), n2 && n2.captureAnimationState();
      t2 = B(this.sortable.el, this.startIndex, this.options);
      t2 ? this.sortable.el.insertBefore(e2, t2) : this.sortable.el.appendChild(e2), this.sortable.animateAll(), n2 && n2.animateAll();
    }, drop: n }, a(re, { pluginName: "revertOnSpill" }), ae.prototype = { onSpill: function(t2) {
      var e2 = t2.dragEl, t2 = t2.putSortable || this.sortable;
      t2.captureAnimationState(), e2.parentNode && e2.parentNode.removeChild(e2), t2.animateAll();
    }, drop: n }, a(ae, { pluginName: "removeOnSpill" });
    var le, se, ce, ue, de, he = [], fe = [], pe = false, ge = false, me = false;
    function ve(n2, o2) {
      fe.forEach(function(t2, e2) {
        e2 = o2.children[t2.sortableIndex + (n2 ? Number(e2) : 0)];
        e2 ? o2.insertBefore(t2, e2) : o2.appendChild(t2);
      });
    }
    function be() {
      he.forEach(function(t2) {
        t2 !== ce && t2.parentNode && t2.parentNode.removeChild(t2);
      });
    }
    return Ht.mount(new function() {
      function t2() {
        for (var t3 in this.defaults = { scroll: true, forceAutoScrollFallback: false, scrollSensitivity: 30, scrollSpeed: 10, bubbleScroll: true }, this)
          t3.charAt(0) === "_" && typeof this[t3] == "function" && (this[t3] = this[t3].bind(this));
      }
      return t2.prototype = { dragStarted: function(t3) {
        t3 = t3.originalEvent;
        this.sortable.nativeDraggable ? f(document, "dragover", this._handleAutoScroll) : this.options.supportPointer ? f(document, "pointermove", this._handleFallbackAutoScroll) : t3.touches ? f(document, "touchmove", this._handleFallbackAutoScroll) : f(document, "mousemove", this._handleFallbackAutoScroll);
      }, dragOverCompleted: function(t3) {
        t3 = t3.originalEvent;
        this.options.dragOverBubble || t3.rootEl || this._handleAutoScroll(t3);
      }, drop: function() {
        this.sortable.nativeDraggable ? p(document, "dragover", this._handleAutoScroll) : (p(document, "pointermove", this._handleFallbackAutoScroll), p(document, "touchmove", this._handleFallbackAutoScroll), p(document, "mousemove", this._handleFallbackAutoScroll)), ne(), ee(), clearTimeout(v), v = undefined;
      }, nulling: function() {
        $t = qt = Ut = te = Qt = Vt = Zt = null, Jt.length = 0;
      }, _handleFallbackAutoScroll: function(t3) {
        this._handleAutoScroll(t3, true);
      }, _handleAutoScroll: function(e2, n2) {
        var o2, i2 = this, r2 = (e2.touches ? e2.touches[0] : e2).clientX, a2 = (e2.touches ? e2.touches[0] : e2).clientY, t3 = document.elementFromPoint(r2, a2);
        $t = e2, n2 || this.options.forceAutoScrollFallback || w || y || u ? (ie(e2, this.options, t3, n2), o2 = M(t3, true), !te || Qt && r2 === Vt && a2 === Zt || (Qt && ne(), Qt = setInterval(function() {
          var t4 = M(document.elementFromPoint(r2, a2), true);
          t4 !== o2 && (o2 = t4, ee()), ie(e2, i2.options, t4, n2);
        }, 10), Vt = r2, Zt = a2)) : this.options.bubbleScroll && M(t3, true) !== O() ? ie(e2, this.options, M(t3, false), false) : ee();
      } }, a(t2, { pluginName: "scroll", initializeByDefault: true });
    }), Ht.mount(ae, re), Ht.mount(new function() {
      function t2() {
        this.defaults = { swapClass: "sortable-swap-highlight" };
      }
      return t2.prototype = { dragStart: function(t3) {
        t3 = t3.dragEl;
        oe = t3;
      }, dragOverValid: function(t3) {
        var { completed: e2, target: n2, onMove: o2, activeSortable: i2, changed: r2, cancel: a2 } = t3;
        i2.options.swap && (t3 = this.sortable.el, i2 = this.options, n2 && n2 !== t3 && (t3 = oe, oe = o2(n2) !== false ? (k(n2, i2.swapClass, true), n2) : null, t3 && t3 !== oe && k(t3, i2.swapClass, false)), r2(), e2(true), a2());
      }, drop: function(t3) {
        var e2, n2, o2 = t3.activeSortable, i2 = t3.putSortable, r2 = t3.dragEl, a2 = i2 || this.sortable, l2 = this.options;
        oe && k(oe, l2.swapClass, false), oe && (l2.swap || i2 && i2.options.swap) && r2 !== oe && (a2.captureAnimationState(), a2 !== o2 && o2.captureAnimationState(), n2 = oe, t3 = (e2 = r2).parentNode, l2 = n2.parentNode, t3 && l2 && !t3.isEqualNode(n2) && !l2.isEqualNode(e2) && (i2 = j(e2), r2 = j(n2), t3.isEqualNode(l2) && i2 < r2 && r2++, t3.insertBefore(n2, t3.children[i2]), l2.insertBefore(e2, l2.children[r2])), a2.animateAll(), a2 !== o2 && o2.animateAll());
      }, nulling: function() {
        oe = null;
      } }, a(t2, { pluginName: "swap", eventProperties: function() {
        return { swapItem: oe };
      } });
    }), Ht.mount(new function() {
      function t2(o2) {
        for (var t3 in this)
          t3.charAt(0) === "_" && typeof this[t3] == "function" && (this[t3] = this[t3].bind(this));
        o2.options.avoidImplicitDeselect || (o2.options.supportPointer ? f(document, "pointerup", this._deselectMultiDrag) : (f(document, "mouseup", this._deselectMultiDrag), f(document, "touchend", this._deselectMultiDrag))), f(document, "keydown", this._checkKeyDown), f(document, "keyup", this._checkKeyUp), this.defaults = { selectedClass: "sortable-selected", multiDragKey: null, avoidImplicitDeselect: false, setData: function(t4, e2) {
          var n2 = "";
          he.length && se === o2 ? he.forEach(function(t5, e3) {
            n2 += (e3 ? ", " : "") + t5.textContent;
          }) : n2 = e2.textContent, t4.setData("Text", n2);
        } };
      }
      return t2.prototype = { multiDragKeyDown: false, isMultiDrag: false, delayStartGlobal: function(t3) {
        t3 = t3.dragEl;
        ce = t3;
      }, delayEnded: function() {
        this.isMultiDrag = ~he.indexOf(ce);
      }, setupClone: function(t3) {
        var { sortable: e2, cancel: t3 } = t3;
        if (this.isMultiDrag) {
          for (var n2 = 0;n2 < he.length; n2++)
            fe.push(T(he[n2])), fe[n2].sortableIndex = he[n2].sortableIndex, fe[n2].draggable = false, fe[n2].style["will-change"] = "", k(fe[n2], this.options.selectedClass, false), he[n2] === ce && k(fe[n2], this.options.chosenClass, false);
          e2._hideClone(), t3();
        }
      }, clone: function(t3) {
        var { sortable: e2, rootEl: n2, dispatchSortableEvent: o2, cancel: t3 } = t3;
        this.isMultiDrag && (this.options.removeCloneOnHide || he.length && se === e2 && (ve(true, n2), o2("clone"), t3()));
      }, showClone: function(t3) {
        var { cloneNowShown: e2, rootEl: n2, cancel: t3 } = t3;
        this.isMultiDrag && (ve(false, n2), fe.forEach(function(t4) {
          R(t4, "display", "");
        }), e2(), de = false, t3());
      }, hideClone: function(t3) {
        var e2 = this, n2 = (t3.sortable, t3.cloneNowHidden), t3 = t3.cancel;
        this.isMultiDrag && (fe.forEach(function(t4) {
          R(t4, "display", "none"), e2.options.removeCloneOnHide && t4.parentNode && t4.parentNode.removeChild(t4);
        }), n2(), de = true, t3());
      }, dragStartGlobal: function(t3) {
        t3.sortable;
        !this.isMultiDrag && se && se.multiDrag._deselectMultiDrag(), he.forEach(function(t4) {
          t4.sortableIndex = j(t4);
        }), he = he.sort(function(t4, e2) {
          return t4.sortableIndex - e2.sortableIndex;
        }), me = true;
      }, dragStarted: function(t3) {
        var e2, n2 = this, t3 = t3.sortable;
        this.isMultiDrag && (this.options.sort && (t3.captureAnimationState(), this.options.animation && (he.forEach(function(t4) {
          t4 !== ce && R(t4, "position", "absolute");
        }), e2 = X(ce, false, true, true), he.forEach(function(t4) {
          t4 !== ce && x(t4, e2);
        }), pe = ge = true)), t3.animateAll(function() {
          pe = ge = false, n2.options.animation && he.forEach(function(t4) {
            A(t4);
          }), n2.options.sort && be();
        }));
      }, dragOver: function(t3) {
        var { target: e2, completed: n2, cancel: t3 } = t3;
        ge && ~he.indexOf(e2) && (n2(false), t3());
      }, revert: function(t3) {
        var n2, o2, e2 = t3.fromSortable, i2 = t3.rootEl, r2 = t3.sortable, a2 = t3.dragRect;
        1 < he.length && (he.forEach(function(t4) {
          r2.addAnimationState({ target: t4, rect: ge ? X(t4) : a2 }), A(t4), t4.fromRect = a2, e2.removeAnimationState(t4);
        }), ge = false, n2 = !this.options.removeCloneOnHide, o2 = i2, he.forEach(function(t4, e3) {
          e3 = o2.children[t4.sortableIndex + (n2 ? Number(e3) : 0)];
          e3 ? o2.insertBefore(t4, e3) : o2.appendChild(t4);
        }));
      }, dragOverCompleted: function(t3) {
        var e2, n2 = t3.sortable, o2 = t3.isOwner, i2 = t3.insertion, r2 = t3.activeSortable, a2 = t3.parentEl, l2 = t3.putSortable, t3 = this.options;
        i2 && (o2 && r2._hideClone(), pe = false, t3.animation && 1 < he.length && (ge || !o2 && !r2.options.sort && !l2) && (e2 = X(ce, false, true, true), he.forEach(function(t4) {
          t4 !== ce && (x(t4, e2), a2.appendChild(t4));
        }), ge = true), o2 || (ge || be(), 1 < he.length ? (o2 = de, r2._showClone(n2), r2.options.animation && !de && o2 && fe.forEach(function(t4) {
          r2.addAnimationState({ target: t4, rect: ue }), t4.fromRect = ue, t4.thisAnimationDuration = null;
        })) : r2._showClone(n2)));
      }, dragOverAnimationCapture: function(t3) {
        var { dragRect: e2, isOwner: n2, activeSortable: t3 } = t3;
        he.forEach(function(t4) {
          t4.thisAnimationDuration = null;
        }), t3.options.animation && !n2 && t3.multiDrag.isMultiDrag && (ue = a({}, e2), e2 = D(ce, true), ue.top -= e2.f, ue.left -= e2.e);
      }, dragOverAnimationComplete: function() {
        ge && (ge = false, be());
      }, drop: function(t3) {
        var o2, i2, r2, a2, n2, e2, l2, s2 = t3.originalEvent, c2 = t3.rootEl, u2 = t3.parentEl, d2 = t3.sortable, h2 = t3.dispatchSortableEvent, f2 = t3.oldIndex, t3 = t3.putSortable, p2 = t3 || this.sortable;
        s2 && (o2 = this.options, i2 = u2.children, me || (o2.multiDragKey && !this.multiDragKeyDown && this._deselectMultiDrag(), k(ce, o2.selectedClass, !~he.indexOf(ce)), ~he.indexOf(ce) ? (he.splice(he.indexOf(ce), 1), le = null, U({ sortable: d2, rootEl: c2, name: "deselect", targetEl: ce, originalEvent: s2 })) : (he.push(ce), U({ sortable: d2, rootEl: c2, name: "select", targetEl: ce, originalEvent: s2 }), s2.shiftKey && le && d2.el.contains(le) ? (r2 = j(le), a2 = j(ce), ~r2 && ~a2 && r2 !== a2 && function() {
          for (var e3, t4 = r2 < a2 ? (e3 = r2, a2) : (e3 = a2, r2 + 1), n3 = o2.filter;e3 < t4; e3++)
            ~he.indexOf(i2[e3]) || P(i2[e3], o2.draggable, u2, false) && (n3 && (typeof n3 == "function" ? n3.call(d2, s2, i2[e3], d2) : n3.split(",").some(function(t5) {
              return P(i2[e3], t5.trim(), u2, false);
            })) || (k(i2[e3], o2.selectedClass, true), he.push(i2[e3]), U({ sortable: d2, rootEl: c2, name: "select", targetEl: i2[e3], originalEvent: s2 })));
        }()) : le = ce, se = p2)), me && this.isMultiDrag && (ge = false, (u2[K].options.sort || u2 !== c2) && 1 < he.length && (n2 = X(ce), e2 = j(ce, ":not(." + this.options.selectedClass + ")"), !pe && o2.animation && (ce.thisAnimationDuration = null), p2.captureAnimationState(), pe || (o2.animation && (ce.fromRect = n2, he.forEach(function(t4) {
          var e3;
          t4.thisAnimationDuration = null, t4 !== ce && (e3 = ge ? X(t4) : n2, t4.fromRect = e3, p2.addAnimationState({ target: t4, rect: e3 }));
        })), be(), he.forEach(function(t4) {
          i2[e2] ? u2.insertBefore(t4, i2[e2]) : u2.appendChild(t4), e2++;
        }), f2 === j(ce) && (l2 = false, he.forEach(function(t4) {
          t4.sortableIndex !== j(t4) && (l2 = true);
        }), l2 && (h2("update"), h2("sort")))), he.forEach(function(t4) {
          A(t4);
        }), p2.animateAll()), se = p2), (c2 === u2 || t3 && t3.lastPutMode !== "clone") && fe.forEach(function(t4) {
          t4.parentNode && t4.parentNode.removeChild(t4);
        }));
      }, nullingGlobal: function() {
        this.isMultiDrag = me = false, fe.length = 0;
      }, destroyGlobal: function() {
        this._deselectMultiDrag(), p(document, "pointerup", this._deselectMultiDrag), p(document, "mouseup", this._deselectMultiDrag), p(document, "touchend", this._deselectMultiDrag), p(document, "keydown", this._checkKeyDown), p(document, "keyup", this._checkKeyUp);
      }, _deselectMultiDrag: function(t3) {
        if (!(me !== undefined && me || se !== this.sortable || t3 && P(t3.target, this.options.draggable, this.sortable.el, false) || t3 && t3.button !== 0))
          for (;he.length; ) {
            var e2 = he[0];
            k(e2, this.options.selectedClass, false), he.shift(), U({ sortable: this.sortable, rootEl: this.sortable.el, name: "deselect", targetEl: e2, originalEvent: t3 });
          }
      }, _checkKeyDown: function(t3) {
        t3.key === this.options.multiDragKey && (this.multiDragKeyDown = true);
      }, _checkKeyUp: function(t3) {
        t3.key === this.options.multiDragKey && (this.multiDragKeyDown = false);
      } }, a(t2, { pluginName: "multiDrag", utils: { select: function(t3) {
        var e2 = t3.parentNode[K];
        e2 && e2.options.multiDrag && !~he.indexOf(t3) && (se && se !== e2 && (se.multiDrag._deselectMultiDrag(), se = e2), k(t3, e2.options.selectedClass, true), he.push(t3));
      }, deselect: function(t3) {
        var e2 = t3.parentNode[K], n2 = he.indexOf(t3);
        e2 && e2.options.multiDrag && ~n2 && (k(t3, e2.options.selectedClass, false), he.splice(n2, 1));
      } }, eventProperties: function() {
        var n2 = this, o2 = [], i2 = [];
        return he.forEach(function(t3) {
          var e2;
          o2.push({ multiDragElement: t3, index: t3.sortableIndex }), e2 = ge && t3 !== ce ? -1 : ge ? j(t3, ":not(." + n2.options.selectedClass + ")") : j(t3), i2.push({ multiDragElement: t3, index: e2 });
        }), { items: e(he), clones: [].concat(fe), oldIndicies: o2, newIndicies: i2 };
      }, optionListeners: { multiDragKey: function(t3) {
        return (t3 = t3.toLowerCase()) === "ctrl" ? t3 = "Control" : 1 < t3.length && (t3 = t3.charAt(0).toUpperCase() + t3.substr(1)), t3;
      } } });
    }), Ht;
  });
});

// src/main.ts
var exports_main = {};
__export(exports_main, {
  default: () => VukiKanbanPlugin
});
module.exports = __toCommonJS(exports_main);

// node_modules/monkey-around/dist/index.mjs
function around(obj, factories) {
  const removers = Object.keys(factories).map((key) => around1(obj, key, factories[key]));
  return removers.length === 1 ? removers[0] : function() {
    removers.forEach((r) => r());
  };
}
function around1(obj, method, createWrapper) {
  const inherited = obj[method], hadOwn = obj.hasOwnProperty(method), original = hadOwn ? inherited : function() {
    return Object.getPrototypeOf(obj)[method].apply(this, arguments);
  };
  let current = createWrapper(original);
  if (inherited)
    Object.setPrototypeOf(current, inherited);
  Object.setPrototypeOf(wrapper, current);
  obj[method] = wrapper;
  return remove;
  function wrapper(...args) {
    if (current === original && obj[method] === wrapper)
      remove();
    return current.apply(this, args);
  }
  function remove() {
    if (obj[method] === wrapper) {
      if (hadOwn)
        obj[method] = original;
      else
        delete obj[method];
    }
    if (current === original)
      return;
    current = original;
    Object.setPrototypeOf(wrapper, inherited || Function);
  }
}

// src/plugin/plugin.ts
var import_obsidian11 = require("obsidian");

// src/shared/constants.ts
var BRAT_REPO = "vuki656/brain";
var PLUGIN_ID = "obsidian-vuki-kanban";
var PROJECT_COLORS = [
  "#5b7a9d",
  "#7b68a8",
  "#5a9a6e",
  "#c0873a",
  "#b85c5c",
  "#c4a43a",
  "#4a9a9a",
  "#b06a8f",
  "#6a8a5a",
  "#8a7a5a",
  "#5a7a8a",
  "#9a6a7a",
  "#7a8a6a",
  "#6a6a9a",
  "#9a7a5a",
  "#5a8a7a"
];
var PROJECT_COLOR_LABELS = {
  "#4a9a9a": "Teal",
  "#5a7a8a": "Steel",
  "#5a8a7a": "Sage",
  "#5a9a6e": "Green",
  "#5b7a9d": "Blue",
  "#6a6a9a": "Indigo",
  "#6a8a5a": "Olive",
  "#7a8a6a": "Moss",
  "#7b68a8": "Purple",
  "#8a7a5a": "Tan",
  "#9a6a7a": "Mauve",
  "#9a7a5a": "Amber",
  "#b06a8f": "Rose",
  "#b85c5c": "Red",
  "#c0873a": "Orange",
  "#c4a43a": "Gold"
};
// node_modules/date-fns/constants.js
var daysInYear = 365.2425;
var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1000;
var minTime = -maxTime;
var millisecondsInWeek = 604800000;
var millisecondsInDay = 86400000;
var secondsInHour = 3600;
var secondsInDay = secondsInHour * 24;
var secondsInWeek = secondsInDay * 7;
var secondsInYear = secondsInDay * daysInYear;
var secondsInMonth = secondsInYear / 12;
var secondsInQuarter = secondsInMonth * 3;
var constructFromSymbol = Symbol.for("constructDateFrom");

// node_modules/date-fns/constructFrom.js
function constructFrom(date, value) {
  if (typeof date === "function")
    return date(value);
  if (date && typeof date === "object" && constructFromSymbol in date)
    return date[constructFromSymbol](value);
  if (date instanceof Date)
    return new date.constructor(value);
  return new Date(value);
}

// node_modules/date-fns/toDate.js
function toDate(argument, context) {
  return constructFrom(context || argument, argument);
}

// node_modules/date-fns/addDays.js
function addDays(date, amount, options) {
  const _date = toDate(date, options?.in);
  if (isNaN(amount))
    return constructFrom(options?.in || date, NaN);
  if (!amount)
    return _date;
  _date.setDate(_date.getDate() + amount);
  return _date;
}

// node_modules/date-fns/_lib/defaultOptions.js
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// node_modules/date-fns/startOfWeek.js
function startOfWeek(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date, options?.in);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/startOfISOWeek.js
function startOfISOWeek(date, options) {
  return startOfWeek(date, { ...options, weekStartsOn: 1 });
}

// node_modules/date-fns/getISOWeekYear.js
function getISOWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
  const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
function getTimezoneOffsetInMilliseconds(date) {
  const _date = toDate(date);
  const utcDate = new Date(Date.UTC(_date.getFullYear(), _date.getMonth(), _date.getDate(), _date.getHours(), _date.getMinutes(), _date.getSeconds(), _date.getMilliseconds()));
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}

// node_modules/date-fns/_lib/normalizeDates.js
function normalizeDates(context, ...dates) {
  const normalize = constructFrom.bind(null, context || dates.find((date) => typeof date === "object"));
  return dates.map(normalize);
}

// node_modules/date-fns/startOfDay.js
function startOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/differenceInCalendarDays.js
function differenceInCalendarDays(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(options?.in, laterDate, earlierDate);
  const laterStartOfDay = startOfDay(laterDate_);
  const earlierStartOfDay = startOfDay(earlierDate_);
  const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
  const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
  return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
}

// node_modules/date-fns/startOfISOWeekYear.js
function startOfISOWeekYear(date, options) {
  const year = getISOWeekYear(date, options);
  const fourthOfJanuary = constructFrom(options?.in || date, 0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  return startOfISOWeek(fourthOfJanuary);
}

// node_modules/date-fns/isDate.js
function isDate(value) {
  return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
}

// node_modules/date-fns/isValid.js
function isValid(date) {
  return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
}

// node_modules/date-fns/startOfMonth.js
function startOfMonth(date, options) {
  const _date = toDate(date, options?.in);
  _date.setDate(1);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/startOfYear.js
function startOfYear(date, options) {
  const date_ = toDate(date, options?.in);
  date_.setFullYear(date_.getFullYear(), 0, 1);
  date_.setHours(0, 0, 0, 0);
  return date_;
}

// node_modules/date-fns/locale/en-US/_lib/formatDistance.js
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
var formatDistance = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};

// node_modules/date-fns/locale/_lib/buildFormatLongFn.js
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}

// node_modules/date-fns/locale/en-US/_lib/formatLong.js
var dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
var timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};

// node_modules/date-fns/locale/en-US/_lib/formatRelative.js
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

// node_modules/date-fns/locale/_lib/buildLocalizeFn.js
function buildLocalizeFn(args) {
  return (value, options) => {
    const context = options?.context ? String(options.context) : "standalone";
    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = options?.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = options?.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;
    return valuesArray[index];
  };
}

// node_modules/date-fns/locale/en-US/_lib/localize.js
var eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
var monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
};
var dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
var ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};

// node_modules/date-fns/locale/_lib/buildMatchFn.js
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;
    const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];
    const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : findKey(parsePatterns, (pattern) => pattern.test(matchedString));
    let value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
function findKey(object, predicate) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
      return key;
    }
  }
  return;
}
function findIndex(array, predicate) {
  for (let key = 0;key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return;
}

// node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult)
      return null;
    const matchedString = matchResult[0];
    const parseResult = string.match(args.parsePattern);
    if (!parseResult)
      return null;
    let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}

// node_modules/date-fns/locale/en-US/_lib/match.js
var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};

// node_modules/date-fns/locale/en-US.js
var enUS = {
  code: "en-US",
  formatDistance,
  formatLong,
  formatRelative,
  localize,
  match,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};
// node_modules/date-fns/getDayOfYear.js
function getDayOfYear(date, options) {
  const _date = toDate(date, options?.in);
  const diff = differenceInCalendarDays(_date, startOfYear(_date));
  const dayOfYear = diff + 1;
  return dayOfYear;
}

// node_modules/date-fns/getISOWeek.js
function getISOWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/getWeekYear.js
function getWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
  firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
  const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
  firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
  if (+_date >= +startOfNextYear) {
    return year + 1;
  } else if (+_date >= +startOfThisYear) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/startOfWeekYear.js
function startOfWeekYear(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const year = getWeekYear(date, options);
  const firstWeek = constructFrom(options?.in || date, 0);
  firstWeek.setFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setHours(0, 0, 0, 0);
  const _date = startOfWeek(firstWeek, options);
  return _date;
}

// node_modules/date-fns/getWeek.js
function getWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/_lib/addLeadingZeros.js
function addLeadingZeros(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  const output = Math.abs(number).toString().padStart(targetLength, "0");
  return sign + output;
}

// node_modules/date-fns/_lib/format/lightFormatters.js
var lightFormatters = {
  y(date, token) {
    const signedYear = date.getFullYear();
    const year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },
  M(date, token) {
    const month = date.getMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  d(date, token) {
    return addLeadingZeros(date.getDate(), token.length);
  },
  a(date, token) {
    const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaa":
        return dayPeriodEnumValue;
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },
  h(date, token) {
    return addLeadingZeros(date.getHours() % 12 || 12, token.length);
  },
  H(date, token) {
    return addLeadingZeros(date.getHours(), token.length);
  },
  m(date, token) {
    return addLeadingZeros(date.getMinutes(), token.length);
  },
  s(date, token) {
    return addLeadingZeros(date.getSeconds(), token.length);
  },
  S(date, token) {
    const numberOfDigits = token.length;
    const milliseconds = date.getMilliseconds();
    const fractionalSeconds = Math.trunc(milliseconds * Math.pow(10, numberOfDigits - 3));
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};

// node_modules/date-fns/_lib/format/formatters.js
var dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
};
var formatters = {
  G: function(date, token, localize2) {
    const era = date.getFullYear() > 0 ? 1 : 0;
    switch (token) {
      case "G":
      case "GG":
      case "GGG":
        return localize2.era(era, { width: "abbreviated" });
      case "GGGGG":
        return localize2.era(era, { width: "narrow" });
      case "GGGG":
      default:
        return localize2.era(era, { width: "wide" });
    }
  },
  y: function(date, token, localize2) {
    if (token === "yo") {
      const signedYear = date.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize2.ordinalNumber(year, { unit: "year" });
    }
    return lightFormatters.y(date, token);
  },
  Y: function(date, token, localize2, options) {
    const signedWeekYear = getWeekYear(date, options);
    const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
    if (token === "YY") {
      const twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }
    if (token === "Yo") {
      return localize2.ordinalNumber(weekYear, { unit: "year" });
    }
    return addLeadingZeros(weekYear, token.length);
  },
  R: function(date, token) {
    const isoWeekYear = getISOWeekYear(date);
    return addLeadingZeros(isoWeekYear, token.length);
  },
  u: function(date, token) {
    const year = date.getFullYear();
    return addLeadingZeros(year, token.length);
  },
  Q: function(date, token, localize2) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      case "Q":
        return String(quarter);
      case "QQ":
        return addLeadingZeros(quarter, 2);
      case "Qo":
        return localize2.ordinalNumber(quarter, { unit: "quarter" });
      case "QQQ":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "formatting"
        });
      case "QQQQQ":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "formatting"
        });
      case "QQQQ":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  q: function(date, token, localize2) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      case "q":
        return String(quarter);
      case "qq":
        return addLeadingZeros(quarter, 2);
      case "qo":
        return localize2.ordinalNumber(quarter, { unit: "quarter" });
      case "qqq":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "standalone"
        });
      case "qqqqq":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "standalone"
        });
      case "qqqq":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  M: function(date, token, localize2) {
    const month = date.getMonth();
    switch (token) {
      case "M":
      case "MM":
        return lightFormatters.M(date, token);
      case "Mo":
        return localize2.ordinalNumber(month + 1, { unit: "month" });
      case "MMM":
        return localize2.month(month, {
          width: "abbreviated",
          context: "formatting"
        });
      case "MMMMM":
        return localize2.month(month, {
          width: "narrow",
          context: "formatting"
        });
      case "MMMM":
      default:
        return localize2.month(month, { width: "wide", context: "formatting" });
    }
  },
  L: function(date, token, localize2) {
    const month = date.getMonth();
    switch (token) {
      case "L":
        return String(month + 1);
      case "LL":
        return addLeadingZeros(month + 1, 2);
      case "Lo":
        return localize2.ordinalNumber(month + 1, { unit: "month" });
      case "LLL":
        return localize2.month(month, {
          width: "abbreviated",
          context: "standalone"
        });
      case "LLLLL":
        return localize2.month(month, {
          width: "narrow",
          context: "standalone"
        });
      case "LLLL":
      default:
        return localize2.month(month, { width: "wide", context: "standalone" });
    }
  },
  w: function(date, token, localize2, options) {
    const week = getWeek(date, options);
    if (token === "wo") {
      return localize2.ordinalNumber(week, { unit: "week" });
    }
    return addLeadingZeros(week, token.length);
  },
  I: function(date, token, localize2) {
    const isoWeek = getISOWeek(date);
    if (token === "Io") {
      return localize2.ordinalNumber(isoWeek, { unit: "week" });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  d: function(date, token, localize2) {
    if (token === "do") {
      return localize2.ordinalNumber(date.getDate(), { unit: "date" });
    }
    return lightFormatters.d(date, token);
  },
  D: function(date, token, localize2) {
    const dayOfYear = getDayOfYear(date);
    if (token === "Do") {
      return localize2.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
    }
    return addLeadingZeros(dayOfYear, token.length);
  },
  E: function(date, token, localize2) {
    const dayOfWeek = date.getDay();
    switch (token) {
      case "E":
      case "EE":
      case "EEE":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "EEEEE":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "EEEEEE":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "EEEE":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  e: function(date, token, localize2, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "e":
        return String(localDayOfWeek);
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      case "eo":
        return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "eee":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "eeeee":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "eeeeee":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "eeee":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  c: function(date, token, localize2, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "c":
        return String(localDayOfWeek);
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      case "co":
        return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "ccc":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone"
        });
      case "ccccc":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "standalone"
        });
      case "cccccc":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "standalone"
        });
      case "cccc":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  i: function(date, token, localize2) {
    const dayOfWeek = date.getDay();
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      case "i":
        return String(isoDayOfWeek);
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      case "io":
        return localize2.ordinalNumber(isoDayOfWeek, { unit: "day" });
      case "iii":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "iiiii":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "iiiiii":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "iiii":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  a: function(date, token, localize2) {
    const hours = date.getHours();
    const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "aaaaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  b: function(date, token, localize2) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }
    switch (token) {
      case "b":
      case "bb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "bbbbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  B: function(date, token, localize2) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  h: function(date, token, localize2) {
    if (token === "ho") {
      let hours = date.getHours() % 12;
      if (hours === 0)
        hours = 12;
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return lightFormatters.h(date, token);
  },
  H: function(date, token, localize2) {
    if (token === "Ho") {
      return localize2.ordinalNumber(date.getHours(), { unit: "hour" });
    }
    return lightFormatters.H(date, token);
  },
  K: function(date, token, localize2) {
    const hours = date.getHours() % 12;
    if (token === "Ko") {
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  k: function(date, token, localize2) {
    let hours = date.getHours();
    if (hours === 0)
      hours = 24;
    if (token === "ko") {
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  m: function(date, token, localize2) {
    if (token === "mo") {
      return localize2.ordinalNumber(date.getMinutes(), { unit: "minute" });
    }
    return lightFormatters.m(date, token);
  },
  s: function(date, token, localize2) {
    if (token === "so") {
      return localize2.ordinalNumber(date.getSeconds(), { unit: "second" });
    }
    return lightFormatters.s(date, token);
  },
  S: function(date, token) {
    return lightFormatters.S(date, token);
  },
  X: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    if (timezoneOffset === 0) {
      return "Z";
    }
    switch (token) {
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      case "XXXX":
      case "XX":
        return formatTimezone(timezoneOffset);
      case "XXXXX":
      case "XXX":
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  x: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      case "xxxx":
      case "xx":
        return formatTimezone(timezoneOffset);
      case "xxxxx":
      case "xxx":
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  O: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  z: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  t: function(date, token, _localize) {
    const timestamp = Math.trunc(+date / 1000);
    return addLeadingZeros(timestamp, token.length);
  },
  T: function(date, token, _localize) {
    return addLeadingZeros(+date, token.length);
  }
};
function formatTimezoneShort(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.trunc(absOffset / 60);
  const minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, delimiter) {
  if (offset % 60 === 0) {
    const sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, delimiter);
}
function formatTimezone(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
  const minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

// node_modules/date-fns/_lib/format/longFormatters.js
var dateLongFormatter = (pattern, formatLong2) => {
  switch (pattern) {
    case "P":
      return formatLong2.date({ width: "short" });
    case "PP":
      return formatLong2.date({ width: "medium" });
    case "PPP":
      return formatLong2.date({ width: "long" });
    case "PPPP":
    default:
      return formatLong2.date({ width: "full" });
  }
};
var timeLongFormatter = (pattern, formatLong2) => {
  switch (pattern) {
    case "p":
      return formatLong2.time({ width: "short" });
    case "pp":
      return formatLong2.time({ width: "medium" });
    case "ppp":
      return formatLong2.time({ width: "long" });
    case "pppp":
    default:
      return formatLong2.time({ width: "full" });
  }
};
var dateTimeLongFormatter = (pattern, formatLong2) => {
  const matchResult = pattern.match(/(P+)(p+)?/) || [];
  const datePattern = matchResult[1];
  const timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong2);
  }
  let dateTimeFormat;
  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong2.dateTime({ width: "short" });
      break;
    case "PP":
      dateTimeFormat = formatLong2.dateTime({ width: "medium" });
      break;
    case "PPP":
      dateTimeFormat = formatLong2.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong2.dateTime({ width: "full" });
      break;
  }
  return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
};
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};

// node_modules/date-fns/_lib/protectedTokens.js
var dayOfYearTokenRE = /^D+$/;
var weekYearTokenRE = /^Y+$/;
var throwTokens = ["D", "DD", "YY", "YYYY"];
function isProtectedDayOfYearToken(token) {
  return dayOfYearTokenRE.test(token);
}
function isProtectedWeekYearToken(token) {
  return weekYearTokenRE.test(token);
}
function warnOrThrowProtectedError(token, format, input) {
  const _message = message(token, format, input);
  console.warn(_message);
  if (throwTokens.includes(token))
    throw new RangeError(_message);
}
function message(token, format, input) {
  const subject = token[0] === "Y" ? "years" : "days of the month";
  return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}

// node_modules/date-fns/format.js
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
function format(date, formatStr, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const originalDate = toDate(date, options?.in);
  if (!isValid(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
    const firstCharacter = substring[0];
    if (firstCharacter === "p" || firstCharacter === "P") {
      const longFormatter = longFormatters[firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp).map((substring) => {
    if (substring === "''") {
      return { isToken: false, value: "'" };
    }
    const firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return { isToken: false, value: cleanEscapedString(substring) };
    }
    if (formatters[firstCharacter]) {
      return { isToken: true, value: substring };
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError("Format string contains an unescaped latin alphabet character `" + firstCharacter + "`");
    }
    return { isToken: false, value: substring };
  });
  if (locale.localize.preprocessor) {
    parts = locale.localize.preprocessor(originalDate, parts);
  }
  const formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale
  };
  return parts.map((part) => {
    if (!part.isToken)
      return part.value;
    const token = part.value;
    if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
      warnOrThrowProtectedError(token, formatStr, String(date));
    }
    const formatter = formatters[token[0]];
    return formatter(originalDate, token, locale.localize, formatterOptions);
  }).join("");
}
function cleanEscapedString(input) {
  const matched = input.match(escapedStringRegExp);
  if (!matched) {
    return input;
  }
  return matched[1].replace(doubleQuoteRegExp, "'");
}

// node_modules/date-fns/getDay.js
function getDay(date, options) {
  return toDate(date, options?.in).getDay();
}

// node_modules/date-fns/lastDayOfMonth.js
function lastDayOfMonth(date, options) {
  const _date = toDate(date, options?.in);
  const month = _date.getMonth();
  _date.setFullYear(_date.getFullYear(), month + 1, 0);
  _date.setHours(0, 0, 0, 0);
  return toDate(_date, options?.in);
}

// node_modules/date-fns/nextDay.js
function nextDay(date, day, options) {
  let delta = day - getDay(date, options);
  if (delta <= 0)
    delta += 7;
  return addDays(date, delta, options);
}

// node_modules/date-fns/nextMonday.js
function nextMonday(date, options) {
  return nextDay(date, 1, options);
}

// src/shared/date.utils.ts
function toDateString(date) {
  return format(date, "yyyy-MM-dd");
}
function getNextMonday() {
  return nextMonday(new Date);
}
function getTomorrowDate() {
  return addDays(new Date, 1);
}
function getDayDifference(dateString) {
  const cardDate = startOfDay(new Date(`${dateString}T00:00:00`));
  const today = startOfDay(new Date);
  return differenceInCalendarDays(cardDate, today);
}
function formatDate(dateString) {
  const dayDifference = getDayDifference(dateString);
  if (dayDifference === 0) {
    return "Today";
  }
  if (dayDifference === 1) {
    return "Tomorrow";
  }
  if (dayDifference === -1) {
    return "Yesterday";
  }
  if (dayDifference < -1) {
    return `${Math.abs(dayDifference)} days ago`;
  }
  if (dayDifference <= 7) {
    return `In ${dayDifference} days`;
  }
  return dateString;
}
// src/shared/id.utils.ts
function generateId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let index = 0;index < 6; index++) {
    result = result + chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
// src/shared/plugin.types.ts
var DEFAULT_PLUGIN_SETTINGS = {
  notePathPrefix: "Projects"
};
var KANBAN_VIEW_TYPE = "vuki-kanban-view";
var FRONTMATTER_KEY = "vuki-kanban";
// src/plugin/settings.ts
var import_obsidian = require("obsidian");

class VukiKanbanSettingTab extends import_obsidian.PluginSettingTab {
  plugin;
  constructor(app, plugin2) {
    super(app, plugin2);
    this.plugin = plugin2;
  }
  display() {
    const { containerEl } = this;
    const { plugin: plugin2 } = this;
    const { settings } = plugin2;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Note path prefix").setDesc("Base folder path for notes created via 'Create linked note' (e.g. Projects)").addText((text) => {
      return text.setPlaceholder("Projects").setValue(settings.notePathPrefix).onChange(async (value) => {
        settings.notePathPrefix = value;
        await plugin2.saveSettings();
      });
    });
  }
}

// src/plugin/view.ts
var import_obsidian10 = require("obsidian");

// src/parser/parser.ts
var TODAY_REGEX = /\s@today/g;
var DATE_REGEX = /\s@{(\d{4}-\d{2}-\d{2})}/g;
var PRIORITY_IMPORTANT_REGEX = /\s!important/g;
var LINKED_NOTE_REGEX = /(?:^|\s)\[\[(.+?)]]/g;
var ID_REGEX = /\s@id:([\da-z]+)/g;
var CHECKBOX_UNCHECKED_REGEX = /^- \[ ] /;
var CHECKBOX_CHECKED_REGEX = /^- \[x] /;
var PROJECT_HEADING_REGEX = /^## (.+)$/;
var SETTINGS_START = "%% kanban:settings";
var SETTINGS_END = "%%";
function parseCard(line) {
  const isChecked = line.startsWith("- [x] ");
  const isUnchecked = line.startsWith("- [ ] ");
  if (!isChecked && !isUnchecked) {
    return null;
  }
  let text = line.replace(CHECKBOX_CHECKED_REGEX, "").replace(CHECKBOX_UNCHECKED_REGEX, "");
  let priority = null;
  let date2 = null;
  let linkedNote = null;
  let id2 = null;
  const idMatch = ID_REGEX.exec(text);
  if (idMatch) {
    id2 = idMatch[1] ?? null;
    text = text.replace(ID_REGEX, "");
  }
  ID_REGEX.lastIndex = 0;
  const todayMatch = TODAY_REGEX.exec(text);
  if (todayMatch) {
    date2 = toDateString(new Date);
    text = text.replace(TODAY_REGEX, "");
  }
  TODAY_REGEX.lastIndex = 0;
  const dateMatch = DATE_REGEX.exec(text);
  if (dateMatch) {
    date2 = dateMatch[1] ?? null;
    text = text.replace(DATE_REGEX, "");
  }
  DATE_REGEX.lastIndex = 0;
  const importantMatch = PRIORITY_IMPORTANT_REGEX.exec(text);
  if (importantMatch) {
    priority = "important";
    text = text.replace(PRIORITY_IMPORTANT_REGEX, "");
  }
  PRIORITY_IMPORTANT_REGEX.lastIndex = 0;
  const linkedNoteMatch = LINKED_NOTE_REGEX.exec(text);
  if (linkedNoteMatch) {
    linkedNote = linkedNoteMatch[1] ?? null;
    text = text.replace(LINKED_NOTE_REGEX, "");
  }
  LINKED_NOTE_REGEX.lastIndex = 0;
  return {
    completed: isChecked,
    date: date2,
    description: null,
    id: id2 ?? generateId(),
    linkedNote,
    priority,
    title: text.trim()
  };
}
function parseSettings(lines) {
  const settingsStartIndex = lines.findIndex((line) => {
    return line.trim() === SETTINGS_START;
  });
  if (settingsStartIndex === -1) {
    return { collapsedProjects: [], projectColors: {}, projectIcons: {}, todayOrder: {} };
  }
  const jsonLines = [];
  let capturing = false;
  for (let index = settingsStartIndex + 1;index < lines.length; index++) {
    const rawLine = lines[index];
    if (rawLine === undefined) {
      continue;
    }
    const line = rawLine.trim();
    if (line === "```" || line.startsWith("```")) {
      if (capturing) {
        break;
      }
      capturing = true;
      continue;
    }
    if (line === SETTINGS_END) {
      break;
    }
    if (capturing) {
      jsonLines.push(line);
    }
  }
  const jsonString = jsonLines.join(`
`);
  if (!jsonString) {
    return { collapsedProjects: [], projectColors: {}, projectIcons: {}, todayOrder: {} };
  }
  try {
    const parsed = JSON.parse(jsonString);
    const rawTodayOrder = parsed["today-order"];
    let todayOrder = {};
    if (rawTodayOrder && typeof rawTodayOrder === "object") {
      todayOrder = rawTodayOrder;
    }
    return {
      collapsedProjects: parsed["collapsed-projects"] ?? [],
      projectColors: parsed["project-colors"] ?? {},
      projectIcons: parsed["project-icons"] ?? {},
      todayOrder
    };
  } catch {
    return { collapsedProjects: [], projectColors: {}, projectIcons: {}, todayOrder: {} };
  }
}
function collectDescription(lines, cardLineIndex) {
  const descriptionLines = [];
  for (let nextIndex = cardLineIndex + 1;nextIndex < lines.length; nextIndex++) {
    const nextLine = lines[nextIndex];
    if (nextLine === undefined) {
      break;
    }
    if (!nextLine.startsWith("  ") || nextLine.trim() === "") {
      break;
    }
    const nextTrimmed = nextLine.trim();
    if (nextTrimmed.startsWith("- [ ] ") || nextTrimmed.startsWith("- [x] ")) {
      break;
    }
    if (PROJECT_HEADING_REGEX.test(nextTrimmed)) {
      break;
    }
    if (nextTrimmed === SETTINGS_START) {
      break;
    }
    descriptionLines.push(nextTrimmed);
  }
  return descriptionLines.length > 0 ? descriptionLines.join(`
`) : null;
}
function serializeCard(card) {
  const checkbox = card.completed ? "- [x] " : "- [ ] ";
  let line = checkbox;
  line = line + (card.linkedNote ? `[[${card.linkedNote}]]` : card.title);
  const isToday = card.date === toDateString(new Date);
  if (isToday) {
    line = `${line} @today`;
  }
  if (card.priority) {
    line = `${line} !${card.priority}`;
  }
  if (card.date && !isToday) {
    line = `${line} @{${card.date}}`;
  }
  line = `${line} @id:${card.id}`;
  return line;
}
function parseBoard(markdown) {
  const lines = markdown.split(`
`);
  const projects = [];
  let currentProject = null;
  let pastFrontmatter = false;
  let inFrontmatter = false;
  for (let lineIndex = 0;lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex];
    if (rawLine === undefined) {
      continue;
    }
    const trimmed = rawLine.trim();
    if (!pastFrontmatter) {
      if (trimmed === "---" && !inFrontmatter) {
        inFrontmatter = true;
        continue;
      }
      if (trimmed === "---" && inFrontmatter) {
        pastFrontmatter = true;
        continue;
      }
      continue;
    }
    if (trimmed === SETTINGS_START) {
      break;
    }
    const headingMatch = PROJECT_HEADING_REGEX.exec(trimmed);
    if (headingMatch) {
      currentProject = { cards: [], title: headingMatch[1] ?? "" };
      projects.push(currentProject);
      continue;
    }
    if (currentProject && (trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] "))) {
      const card = parseCard(trimmed);
      if (card) {
        card.description = collectDescription(lines, lineIndex);
        currentProject.cards.push(card);
      }
    }
  }
  const settings = parseSettings(lines);
  return { projects, settings };
}
function serializeBoard(board) {
  const lines = ["---", "", `kanban-plugin: ${FRONTMATTER_KEY}`, "", "---", ""];
  for (const project of board.projects) {
    lines.push(`## ${project.title}`, "");
    for (const card of project.cards) {
      lines.push(serializeCard(card));
      if (card.description) {
        const indentedLines = card.description.split(`
`).map((descriptionLine) => {
          return `  ${descriptionLine}`;
        });
        lines.push(...indentedLines);
      }
    }
    lines.push("", "");
  }
  const settingsObject = {};
  if (board.settings.collapsedProjects.length > 0) {
    settingsObject["collapsed-projects"] = board.settings.collapsedProjects;
  }
  if (Object.keys(board.settings.todayOrder).length > 0) {
    settingsObject["today-order"] = board.settings.todayOrder;
  }
  if (Object.keys(board.settings.projectColors).length > 0) {
    settingsObject["project-colors"] = board.settings.projectColors;
  }
  if (Object.keys(board.settings.projectIcons).length > 0) {
    settingsObject["project-icons"] = board.settings.projectIcons;
  }
  lines.push("%% kanban:settings", "```json", JSON.stringify(settingsObject), "```", "%%");
  return lines.join(`
`);
}
// src/ui/board/board.ts
var import_sortablejs2 = __toESM(require_Sortable_min(), 1);

// src/ui/project/project.ts
var import_obsidian6 = require("obsidian");

// src/ui/card/card.ts
var import_obsidian4 = require("obsidian");

// src/ui/context-menu/context-menu.ts
var import_obsidian3 = require("obsidian");

// src/ui/date-picker/date-picker.ts
var MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
function renderCalendar(options) {
  const { currentSelectedDate, modal, onSelect, viewMonth, viewYear } = options;
  modal.empty();
  const header = document.createElement("div");
  header.className = "kanban-date-picker__header";
  const prevButton = document.createElement("span");
  prevButton.className = "kanban-date-picker__nav";
  prevButton.textContent = "‹";
  const nextButton = document.createElement("span");
  nextButton.className = "kanban-date-picker__nav";
  nextButton.textContent = "›";
  const monthLabel = document.createElement("span");
  monthLabel.className = "kanban-date-picker__month-label";
  monthLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  header.append(prevButton, monthLabel, nextButton);
  modal.append(header);
  const grid = document.createElement("div");
  grid.className = "kanban-date-picker__grid";
  for (const dayLabel of DAY_LABELS) {
    const cell = document.createElement("div");
    cell.className = "kanban-date-picker__day-label";
    cell.textContent = dayLabel;
    grid.append(cell);
  }
  const firstDay = startOfMonth(new Date(viewYear, viewMonth, 1));
  const lastDay = lastDayOfMonth(firstDay);
  const startDayOfWeek = (getDay(firstDay) + 6) % 7;
  const todayString = toDateString(new Date);
  for (let padding = 0;padding < startDayOfWeek; padding++) {
    const empty = document.createElement("div");
    empty.className = "kanban-date-picker__cell kanban-date-picker__cell--empty";
    grid.append(empty);
  }
  for (let day = 1;day <= lastDay.getDate(); day++) {
    const cell = document.createElement("div");
    const cellDate = new Date(viewYear, viewMonth, day);
    const cellDateString = toDateString(cellDate);
    cell.className = "kanban-date-picker__cell";
    cell.textContent = String(day);
    if (cellDateString === todayString) {
      cell.classList.add("kanban-date-picker__cell--today");
    }
    if (currentSelectedDate && cellDateString === currentSelectedDate) {
      cell.classList.add("kanban-date-picker__cell--selected");
    }
    cell.addEventListener("click", () => {
      onSelect(cellDateString);
    });
    grid.append(cell);
  }
  modal.append(grid);
  return { nextButton, prevButton };
}
function createCalendarWithNavigation(options) {
  const state = { viewMonth: options.viewMonth, viewYear: options.viewYear };
  const rerender = () => {
    const { nextButton, prevButton } = renderCalendar({
      currentSelectedDate: options.currentSelectedDate,
      modal: options.modal,
      onSelect: options.onSelect,
      viewMonth: state.viewMonth,
      viewYear: state.viewYear
    });
    prevButton.addEventListener("click", () => {
      state.viewMonth--;
      if (state.viewMonth < 0) {
        state.viewMonth = 11;
        state.viewYear--;
      }
      rerender();
    });
    nextButton.addEventListener("click", () => {
      state.viewMonth++;
      if (state.viewMonth > 11) {
        state.viewMonth = 0;
        state.viewYear++;
      }
      rerender();
    });
  };
  rerender();
}
function showDatePicker(options) {
  const { board, card, cardIndex, onMutation, projectIndex } = options;
  const selectedDate = card.date ? new Date(`${card.date}T00:00:00`) : new Date;
  const overlay = document.createElement("div");
  overlay.className = "kanban-date-picker-overlay";
  const modal = document.createElement("div");
  modal.className = "kanban-date-picker-modal";
  const cleanup = () => {
    overlay.remove();
    modal.remove();
  };
  overlay.addEventListener("click", cleanup);
  createCalendarWithNavigation({
    currentSelectedDate: card.date,
    modal,
    onSelect: (dateString) => {
      const newProjects = immutableUpdateCard({
        cardIndex,
        projectIndex,
        projects: board.projects,
        update: { date: dateString }
      });
      onMutation({ ...board, projects: newProjects });
      cleanup();
    },
    viewMonth: selectedDate.getMonth(),
    viewYear: selectedDate.getFullYear()
  });
  document.body.append(overlay, modal);
}
function showQuickAddDatePicker(onSelect) {
  const now = new Date;
  const overlay = document.createElement("div");
  overlay.className = "kanban-date-picker-overlay";
  const modal = document.createElement("div");
  modal.className = "kanban-date-picker-modal";
  const cleanup = () => {
    overlay.remove();
    modal.remove();
  };
  overlay.addEventListener("click", cleanup);
  createCalendarWithNavigation({
    currentSelectedDate: null,
    modal,
    onSelect: (dateString) => {
      onSelect(dateString);
      cleanup();
    },
    viewMonth: now.getMonth(),
    viewYear: now.getFullYear()
  });
  document.body.append(overlay, modal);
}
// src/ui/quick-add/quick-add.ts
var import_obsidian2 = require("obsidian");
function openQuickAddDialog(options) {
  const { board, editContext, onMutation, prefillDate } = options;
  const isEditMode = editContext !== undefined;
  let selectedDate = isEditMode ? editContext.card.date : prefillDate ?? null;
  let selectedPriority = isEditMode ? editContext.card.priority : null;
  const overlay = document.createElement("div");
  overlay.className = "kanban-quick-add-overlay";
  const cleanup = () => {
    overlay.remove();
  };
  overlay.addEventListener("click", () => {
    cleanup();
  });
  const dialog = document.createElement("div");
  dialog.className = "kanban-quick-add-dialog";
  dialog.addEventListener("click", (dialogClickEvent) => {
    dialogClickEvent.stopPropagation();
  });
  const titleInput = document.createElement("input");
  titleInput.className = "kanban-quick-add__input";
  titleInput.type = "text";
  titleInput.placeholder = "Task title...";
  if (isEditMode) {
    titleInput.value = editContext.card.linkedNote ?? editContext.card.title;
  }
  dialog.append(titleInput);
  const descriptionInput = document.createElement("textarea");
  descriptionInput.className = "kanban-quick-add__input kanban-quick-add__description";
  descriptionInput.placeholder = "Description (optional)...";
  descriptionInput.rows = 3;
  if (isEditMode && editContext.card.description) {
    descriptionInput.value = editContext.card.description;
  }
  dialog.append(descriptionInput);
  const projectRow = document.createElement("div");
  projectRow.className = "kanban-quick-add__row";
  const projectLabel = document.createElement("span");
  projectLabel.className = "kanban-quick-add__label";
  projectLabel.textContent = "Project";
  projectRow.append(projectLabel);
  let selectedProjectIndex = isEditMode ? editContext.projectIndex : null;
  const projectChips = document.createElement("div");
  projectChips.className = "kanban-quick-add__dates";
  const updateProjectChipStates = () => {
    for (const chip of Array.from(projectChips.querySelectorAll(".kanban-quick-add__date-button"))) {
      const chipValue = chip.dataset.projectValue;
      chip.classList.toggle("kanban-quick-add__date-button--active", chipValue !== undefined && Number(chipValue) === selectedProjectIndex);
    }
  };
  for (const [loopProjectIndex, project] of board.projects.entries()) {
    const chip = document.createElement("span");
    chip.className = "kanban-quick-add__date-button";
    chip.dataset.projectValue = String(loopProjectIndex);
    const chipIcon = getProjectIcon(project.title, board);
    if (chipIcon) {
      const chipIconSpan = document.createElement("span");
      chipIconSpan.className = "kanban-quick-add__chip-icon";
      chipIconSpan.style.color = getProjectColor(project.title, loopProjectIndex, board);
      import_obsidian2.setIcon(chipIconSpan, chipIcon);
      chip.append(chipIconSpan);
    }
    chip.append(document.createTextNode(project.title));
    if (isEditMode && loopProjectIndex === editContext.projectIndex) {
      chip.classList.add("kanban-quick-add__date-button--active");
    }
    const capturedProjectIndex = loopProjectIndex;
    chip.addEventListener("click", () => {
      selectedProjectIndex = selectedProjectIndex === capturedProjectIndex ? null : capturedProjectIndex;
      updateProjectChipStates();
    });
    projectChips.append(chip);
  }
  projectRow.append(projectChips);
  dialog.append(projectRow);
  const dateRow = document.createElement("div");
  dateRow.className = "kanban-quick-add__row";
  const dateLabel = document.createElement("span");
  dateLabel.className = "kanban-quick-add__label";
  dateLabel.textContent = "Date";
  dateRow.append(dateLabel);
  const dateButtons = document.createElement("div");
  dateButtons.className = "kanban-quick-add__dates";
  const today = new Date;
  const tomorrow = getTomorrowDate();
  const dateOptions = [
    { label: "Today", value: toDateString(today) },
    { label: "Tomorrow", value: toDateString(tomorrow) },
    { label: "Next Monday", value: toDateString(getNextMonday()) },
    { label: "Pick date", pickDate: true, value: null }
  ];
  const updateDateButtonStates = () => {
    for (const button of Array.from(dateButtons.querySelectorAll(".kanban-quick-add__date-button"))) {
      const buttonValue = button.dataset.dateValue ?? null;
      const isPickDate = button.dataset.pickDate === "true";
      if (isPickDate) {
        button.classList.toggle("kanban-quick-add__date-button--active", selectedDate !== null && !dateOptions.some((option) => {
          return !option.pickDate && option.value === selectedDate;
        }));
      } else {
        button.classList.toggle("kanban-quick-add__date-button--active", selectedDate === buttonValue);
      }
    }
  };
  for (const dateOption of dateOptions) {
    const dateButton = document.createElement("span");
    dateButton.className = "kanban-quick-add__date-button";
    dateButton.textContent = dateOption.label;
    if (dateOption.pickDate) {
      dateButton.dataset.pickDate = "true";
      dateButton.addEventListener("click", () => {
        showQuickAddDatePicker((dateString) => {
          selectedDate = dateString;
          updateDateButtonStates();
        });
      });
    } else {
      dateButton.dataset.dateValue = dateOption.value ?? "";
      const capturedValue = dateOption.value;
      dateButton.addEventListener("click", () => {
        selectedDate = selectedDate === capturedValue ? null : capturedValue;
        updateDateButtonStates();
      });
    }
    dateButtons.append(dateButton);
  }
  updateDateButtonStates();
  dateRow.append(dateButtons);
  dialog.append(dateRow);
  const priorityRow = document.createElement("div");
  priorityRow.className = "kanban-quick-add__row";
  const priorityLabel = document.createElement("span");
  priorityLabel.className = "kanban-quick-add__label";
  priorityLabel.textContent = "Priority";
  priorityRow.append(priorityLabel);
  const priorityButton = document.createElement("span");
  priorityButton.className = "kanban-quick-add__priority";
  const priorityIcon = document.createElement("span");
  priorityIcon.className = "kanban-quick-add__priority-icon";
  import_obsidian2.setIcon(priorityIcon, "alert-circle");
  priorityButton.append(priorityIcon, document.createTextNode("Important"));
  if (isEditMode && selectedPriority === "important") {
    priorityButton.classList.add("kanban-quick-add__priority--active");
  }
  priorityButton.addEventListener("click", () => {
    selectedPriority = selectedPriority === "important" ? null : "important";
    priorityButton.classList.toggle("kanban-quick-add__priority--active", selectedPriority === "important");
  });
  priorityRow.append(priorityButton);
  dialog.append(priorityRow);
  const submitButton = document.createElement("span");
  submitButton.className = "kanban-quick-add__submit";
  submitButton.textContent = isEditMode ? "Save task" : "Add task";
  const submit = () => {
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }
    if (selectedProjectIndex === null) {
      return;
    }
    const projectIndex = selectedProjectIndex;
    const descriptionValue = descriptionInput.value.trim() || null;
    if (isEditMode) {
      const update = {
        date: selectedDate,
        description: descriptionValue,
        priority: selectedPriority
      };
      if (editContext.card.linkedNote) {
        update.linkedNote = title;
      } else {
        update.title = title;
      }
      let newProjects = immutableUpdateCard({
        cardIndex: editContext.cardIndex,
        projectIndex: editContext.projectIndex,
        projects: board.projects,
        update
      });
      if (projectIndex !== editContext.projectIndex) {
        const updatedProject = newProjects[editContext.projectIndex];
        const updatedCard = updatedProject?.cards[editContext.cardIndex];
        if (!updatedCard) {
          return;
        }
        newProjects = immutableSpliceCard({
          cardIndex: editContext.cardIndex,
          deleteCount: 1,
          projectIndex: editContext.projectIndex,
          projects: newProjects
        });
        newProjects = immutableSpliceCard({
          cardIndex: 0,
          deleteCount: 0,
          insertCards: [updatedCard],
          projectIndex,
          projects: newProjects
        });
      }
      onMutation({ ...board, projects: newProjects });
    } else {
      const newCard = {
        completed: false,
        date: selectedDate,
        description: descriptionValue,
        id: generateId(),
        linkedNote: null,
        priority: selectedPriority,
        title
      };
      const newProjects = immutableSpliceCard({
        cardIndex: 0,
        deleteCount: 0,
        insertCards: [newCard],
        projectIndex,
        projects: board.projects
      });
      onMutation({ ...board, projects: newProjects });
    }
    cleanup();
  };
  submitButton.addEventListener("click", submit);
  dialog.append(submitButton);
  titleInput.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key === "Enter") {
      keyboardEvent.preventDefault();
      submit();
    }
    if (keyboardEvent.key === "Escape") {
      cleanup();
    }
  });
  dialog.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key === "Escape") {
      cleanup();
    }
  });
  overlay.append(dialog);
  document.body.append(overlay);
  titleInput.focus();
}
// src/ui/context-menu/context-menu.ts
function showPriorityMenu(options) {
  const { board, cardIndex, event, onMutation, projectIndex } = options;
  const menu = new import_obsidian3.Menu;
  menu.addItem((item) => {
    return item.setIcon("circle").setTitle("None").onClick(() => {
      const newProjects = immutableUpdateCard({
        cardIndex,
        projectIndex,
        projects: board.projects,
        update: { priority: null }
      });
      onMutation({ ...board, projects: newProjects });
    });
  });
  menu.addItem((item) => {
    return item.setIcon("alert-circle").setTitle("Important").onClick(() => {
      const newProjects = immutableUpdateCard({
        cardIndex,
        projectIndex,
        projects: board.projects,
        update: { priority: "important" }
      });
      onMutation({ ...board, projects: newProjects });
    });
  });
  menu.showAtMouseEvent(event);
}
function showCardContextMenu(options) {
  const { board, card, cardIndex, event, onMutation, pluginSettings, projectIndex, vault } = options;
  const menu = new import_obsidian3.Menu;
  const todayString = toDateString(new Date);
  if (card.date === todayString) {
    menu.addItem((item) => {
      return item.setIcon("sun-dim").setTitle("Remove from today").onClick(() => {
        const newProjects = immutableUpdateCard({
          cardIndex,
          projectIndex,
          projects: board.projects,
          update: { date: null }
        });
        onMutation({ ...board, projects: newProjects });
      });
    });
  } else {
    menu.addItem((item) => {
      return item.setIcon("sun").setTitle("Add to today").onClick(() => {
        const newProjects = immutableUpdateCard({
          cardIndex,
          projectIndex,
          projects: board.projects,
          update: { date: todayString }
        });
        onMutation({ ...board, projects: newProjects });
      });
    });
  }
  menu.addItem((item) => {
    return item.setIcon("pencil").setTitle("Edit").onClick(() => {
      openQuickAddDialog({
        board,
        editContext: { card, cardIndex, projectIndex },
        onMutation
      });
    });
  });
  menu.addSeparator();
  menu.addItem((item) => {
    return item.setIcon("circle").setTitle("Priority: None").onClick(() => {
      const newProjects = immutableUpdateCard({
        cardIndex,
        projectIndex,
        projects: board.projects,
        update: { priority: null }
      });
      onMutation({ ...board, projects: newProjects });
    });
  });
  menu.addItem((item) => {
    return item.setIcon("alert-circle").setTitle("Priority: Important").onClick(() => {
      const newProjects = immutableUpdateCard({
        cardIndex,
        projectIndex,
        projects: board.projects,
        update: { priority: "important" }
      });
      onMutation({ ...board, projects: newProjects });
    });
  });
  menu.addSeparator();
  const todayDate = new Date;
  const tomorrowDate = getTomorrowDate();
  menu.addItem((item) => {
    return item.setIcon("calendar").setTitle("Date: Today").onClick(() => {
      const newProjects = immutableUpdateCard({
        cardIndex,
        projectIndex,
        projects: board.projects,
        update: { date: toDateString(todayDate) }
      });
      onMutation({ ...board, projects: newProjects });
    });
  });
  menu.addItem((item) => {
    return item.setIcon("calendar-plus").setTitle("Date: Tomorrow").onClick(() => {
      const newProjects = immutableUpdateCard({
        cardIndex,
        projectIndex,
        projects: board.projects,
        update: { date: toDateString(tomorrowDate) }
      });
      onMutation({ ...board, projects: newProjects });
    });
  });
  menu.addItem((item) => {
    return item.setIcon("calendar-range").setTitle("Date: Next Monday").onClick(() => {
      const newProjects = immutableUpdateCard({
        cardIndex,
        projectIndex,
        projects: board.projects,
        update: { date: toDateString(getNextMonday()) }
      });
      onMutation({ ...board, projects: newProjects });
    });
  });
  menu.addItem((item) => {
    return item.setIcon("calendar-search").setTitle("Date: Pick...").onClick(() => {
      showDatePicker({ board, card, cardIndex, onMutation, projectIndex });
    });
  });
  if (card.date) {
    menu.addItem((item) => {
      return item.setIcon("calendar-x").setTitle("Date: Remove").onClick(() => {
        const newProjects = immutableUpdateCard({
          cardIndex,
          projectIndex,
          projects: board.projects,
          update: { date: null }
        });
        onMutation({ ...board, projects: newProjects });
      });
    });
  }
  menu.addSeparator();
  if (!card.linkedNote) {
    menu.addItem((item) => {
      return item.setIcon("file-plus").setTitle("Create linked note").onClick(async () => {
        const project = board.projects[projectIndex];
        if (!project) {
          return;
        }
        const projectTitle = project.title;
        const cardTitle = card.title;
        const notePath = `${pluginSettings.notePathPrefix}/${projectTitle}/Tasks/${cardTitle}.md`;
        const folderPath = notePath.slice(0, Math.max(0, notePath.lastIndexOf("/")));
        try {
          if (!vault.getAbstractFileByPath(folderPath)) {
            await vault.createFolder(folderPath);
          }
          await vault.create(notePath, `# ${cardTitle}
`);
          const newProjects = immutableUpdateCard({
            cardIndex,
            projectIndex,
            projects: board.projects,
            update: {
              linkedNote: `${pluginSettings.notePathPrefix}/${projectTitle}/Tasks/${cardTitle}`,
              title: ""
            }
          });
          onMutation({ ...board, projects: newProjects });
          new import_obsidian3.Notice(`Created note: ${notePath}`);
        } catch (error) {
          new import_obsidian3.Notice(`Failed to create note: ${error}`);
        }
      });
    });
  } else {
    menu.addItem((item) => {
      return item.setIcon("file-x").setTitle("Delete linked note").setWarning(true).onClick(async () => {
        const notePath = `${card.linkedNote}.md`;
        const file = vault.getAbstractFileByPath(notePath);
        if (file && file instanceof import_obsidian3.TFile) {
          try {
            await vault.trash(file, true);
            const linkedNote = card.linkedNote;
            const noteName = linkedNote ? linkedNote.split("/").pop() ?? linkedNote : "";
            const newProjects = immutableUpdateCard({
              cardIndex,
              projectIndex,
              projects: board.projects,
              update: {
                linkedNote: null,
                title: noteName
              }
            });
            onMutation({ ...board, projects: newProjects });
            new import_obsidian3.Notice(`Deleted note: ${notePath}`);
          } catch (error) {
            new import_obsidian3.Notice(`Failed to delete note: ${error}`);
          }
        } else {
          new import_obsidian3.Notice(`Note not found: ${notePath}`);
        }
      });
    });
  }
  menu.addSeparator();
  menu.addItem((item) => {
    return item.setIcon("trash-2").setTitle("Delete card").setWarning(true).onClick(() => {
      const newProjects = immutableSpliceCard({
        cardIndex,
        deleteCount: 1,
        projectIndex,
        projects: board.projects
      });
      onMutation({ ...board, projects: newProjects });
    });
  });
  menu.showAtMouseEvent(event);
}
// src/ui/inline-edit/inline-edit.ts
function startInlineEdit(element, currentValue, onConfirm) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "kanban-inline-edit";
  input.value = currentValue;
  const originalChildren = [];
  while (element.firstChild) {
    const child = element.firstChild;
    child.remove();
    originalChildren.push(child);
  }
  element.append(input);
  input.focus();
  input.select();
  const restoreOriginal = () => {
    input.remove();
    for (const child of originalChildren) {
      element.append(child);
    }
  };
  const commit = () => {
    const newValue = input.value.trim();
    if (newValue && newValue !== currentValue) {
      onConfirm(newValue);
    } else {
      restoreOriginal();
    }
  };
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key === "Enter") {
      keyboardEvent.preventDefault();
      input.blur();
    }
    if (keyboardEvent.key === "Escape") {
      input.removeEventListener("blur", commit);
      restoreOriginal();
    }
  });
}
// src/ui/card/card-mutations.ts
function immutableSpliceCard(options) {
  const { cardIndex, deleteCount, insertCards = [], projectIndex, projects } = options;
  return projects.map((project, index) => {
    if (index !== projectIndex) {
      return project;
    }
    const newCards = [...project.cards];
    newCards.splice(cardIndex, deleteCount, ...insertCards);
    return { ...project, cards: newCards };
  });
}
function immutableUpdateCard(options) {
  const { cardIndex, projectIndex, projects, update } = options;
  return projects.map((project, projIndex) => {
    if (projIndex !== projectIndex) {
      return project;
    }
    return {
      ...project,
      cards: project.cards.map((card, cIndex) => {
        if (cIndex !== cardIndex) {
          return card;
        }
        return { ...card, ...update };
      })
    };
  });
}

// src/ui/card/card.ts
function createCardElement(options) {
  const { board, card, cardIndex, onMutation, pluginSettings, projectIndex, projectPill, vault } = options;
  const cardElement = document.createElement("div");
  cardElement.className = "kanban-card";
  cardElement.dataset.projectIndex = String(projectIndex);
  cardElement.dataset.cardIndex = String(cardIndex);
  cardElement.dataset.cardId = card.id;
  if (card.completed) {
    cardElement.classList.add("kanban-card--completed");
  }
  if (card.priority) {
    cardElement.dataset.priority = card.priority;
  }
  const cardContent = document.createElement("div");
  cardContent.className = "kanban-card__content";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "kanban-card__checkbox task-list-item-checkbox";
  checkbox.checked = card.completed;
  checkbox.addEventListener("change", () => {
    const newProjects = immutableUpdateCard({
      cardIndex,
      projectIndex,
      projects: board.projects,
      update: { completed: checkbox.checked }
    });
    onMutation({ ...board, projects: newProjects });
  });
  const titleElement = document.createElement("span");
  titleElement.className = "kanban-card__title";
  if (card.linkedNote) {
    const link = document.createElement("a");
    link.className = "internal-link";
    link.href = card.linkedNote;
    link.textContent = card.linkedNote.split("/").pop() ?? card.linkedNote;
    link.dataset.href = card.linkedNote;
    link.addEventListener("click", (clickEvent) => {
      clickEvent.preventDefault();
      const file = vault.getAbstractFileByPath(`${card.linkedNote}.md`);
      if (file && file instanceof import_obsidian4.TFile) {
        window.app.workspace.getLeaf(false).openFile(file);
      }
    });
    titleElement.append(link);
  } else {
    titleElement.textContent = card.title;
  }
  titleElement.addEventListener("dblclick", () => {
    startInlineEdit(titleElement, card.linkedNote ?? card.title, (newValue) => {
      const update = card.linkedNote ? { linkedNote: newValue } : { title: newValue };
      const newProjects = immutableUpdateCard({
        cardIndex,
        projectIndex,
        projects: board.projects,
        update
      });
      onMutation({ ...board, projects: newProjects });
    });
  });
  const dragHandle = document.createElement("span");
  dragHandle.className = "kanban-card__drag-handle";
  import_obsidian4.setIcon(dragHandle, "grip-vertical");
  dragHandle.addEventListener("contextmenu", (handleEvent) => {
    handleEvent.stopPropagation();
    handleEvent.preventDefault();
  });
  cardContent.append(dragHandle, checkbox, titleElement);
  const priorityButton = document.createElement("span");
  priorityButton.className = "kanban-card__priority-dot";
  priorityButton.dataset.priority = card.priority ?? "none";
  priorityButton.addEventListener("click", (priorityClickEvent) => {
    priorityClickEvent.stopPropagation();
    showPriorityMenu({
      board,
      card,
      cardIndex,
      event: priorityClickEvent,
      onMutation,
      projectIndex
    });
  });
  cardContent.append(priorityButton);
  cardElement.append(cardContent);
  if (card.description) {
    const descriptionElement = document.createElement("div");
    descriptionElement.className = "kanban-card__description";
    descriptionElement.textContent = card.description;
    cardElement.append(descriptionElement);
  }
  const metaRow = document.createElement("div");
  metaRow.className = "kanban-card__meta";
  if (projectPill) {
    const pillElement = document.createElement("span");
    pillElement.className = "kanban-card__project-pill";
    pillElement.style.borderColor = projectPill.color;
    if (projectPill.icon) {
      const pillIcon = document.createElement("span");
      pillIcon.className = "kanban-pill-icon";
      pillIcon.style.color = projectPill.color;
      import_obsidian4.setIcon(pillIcon, projectPill.icon);
      pillElement.append(pillIcon);
    }
    pillElement.append(document.createTextNode(projectPill.title));
    metaRow.append(pillElement);
  }
  if (card.date && !projectPill) {
    const dateBadge = document.createElement("span");
    const isToday = card.date === toDateString(new Date);
    const isOverdue = getDayDifference(card.date) < 0 && !card.completed;
    dateBadge.className = isToday ? "kanban-card__badge kanban-card__badge--today" : "kanban-card__badge kanban-card__badge--date";
    if (isOverdue) {
      dateBadge.classList.add("kanban-card__badge--overdue");
    }
    dateBadge.textContent = isToday ? "Today" : formatDate(card.date);
    metaRow.append(dateBadge);
  }
  if (metaRow.children.length > 0) {
    cardElement.append(metaRow);
  }
  cardElement.addEventListener("contextmenu", (contextMenuEvent) => {
    contextMenuEvent.preventDefault();
    showCardContextMenu({
      board,
      card,
      cardIndex,
      event: contextMenuEvent,
      onMutation,
      pluginSettings,
      projectIndex,
      vault
    });
  });
  return cardElement;
}
function createAddCardForm(projectIndex, board, onMutation) {
  const wrapper = document.createElement("div");
  wrapper.className = "kanban-add-card";
  const button = document.createElement("button");
  button.className = "kanban-add-card__button";
  button.textContent = "+ Add a card";
  button.addEventListener("click", () => {
    button.style.display = "none";
    const textarea = document.createElement("textarea");
    textarea.className = "kanban-add-card__input";
    textarea.placeholder = "Card title...";
    wrapper.append(textarea);
    textarea.focus();
    const confirm = () => {
      const text = textarea.value.trim();
      if (text) {
        const newCard = {
          completed: false,
          date: null,
          description: null,
          id: generateId(),
          linkedNote: null,
          priority: null,
          title: text
        };
        const newProjects = immutableSpliceCard({
          cardIndex: 0,
          deleteCount: 0,
          insertCards: [newCard],
          projectIndex,
          projects: board.projects
        });
        onMutation({ ...board, projects: newProjects });
      }
      textarea.remove();
      button.style.display = "";
    };
    textarea.addEventListener("blur", confirm);
    textarea.addEventListener("keydown", (keyboardEvent) => {
      if (keyboardEvent.key === "Enter" && !keyboardEvent.shiftKey) {
        keyboardEvent.preventDefault();
        textarea.blur();
      }
      if (keyboardEvent.key === "Escape") {
        textarea.remove();
        button.style.display = "";
      }
    });
  });
  wrapper.append(button);
  return wrapper;
}
// src/ui/icon-picker/icon-picker.ts
var import_obsidian5 = require("obsidian");

// src/ui/icon-picker/icon-picker.constants.ts
var ICON_PICKER_ICONS = [
  "activity",
  "anchor",
  "archive",
  "award",
  "battery-charging",
  "bell",
  "bluetooth",
  "book",
  "bookmark",
  "box",
  "briefcase",
  "bug",
  "building",
  "cake",
  "camera",
  "clipboard",
  "clock",
  "cloud",
  "code",
  "coffee",
  "compass",
  "cpu",
  "crown",
  "database",
  "diamond",
  "dollar-sign",
  "download",
  "droplet",
  "feather",
  "film",
  "flag",
  "flame",
  "flask-conical",
  "flower",
  "folder",
  "gamepad-2",
  "gem",
  "gift",
  "globe",
  "graduation-cap",
  "hammer",
  "headphones",
  "heart",
  "home",
  "key",
  "lamp",
  "layers",
  "leaf",
  "lightbulb",
  "link",
  "lock",
  "map",
  "megaphone",
  "message-circle",
  "monitor",
  "mountain",
  "music",
  "package",
  "palette",
  "pen-tool",
  "plane",
  "puzzle",
  "rocket",
  "scissors",
  "server",
  "shield",
  "shopping-cart",
  "smartphone",
  "sparkles",
  "star",
  "sun",
  "target",
  "terminal",
  "trophy",
  "truck",
  "umbrella",
  "users",
  "wand",
  "wrench",
  "zap"
];

// src/ui/icon-picker/icon-picker.ts
function showIconPicker(options) {
  const { currentIcon, onSelect } = options;
  const overlay = document.createElement("div");
  overlay.className = "kanban-icon-picker-overlay";
  const modal = document.createElement("div");
  modal.className = "kanban-icon-picker-modal";
  const cleanup = () => {
    overlay.remove();
    modal.remove();
  };
  overlay.addEventListener("click", cleanup);
  const searchInput = document.createElement("input");
  searchInput.className = "kanban-icon-picker__search";
  searchInput.type = "text";
  searchInput.placeholder = "Search icons...";
  modal.append(searchInput);
  const grid = document.createElement("div");
  grid.className = "kanban-icon-picker__grid";
  modal.append(grid);
  const renderGrid = (filter) => {
    grid.empty();
    const normalizedFilter = filter.toLowerCase();
    const filteredIcons = normalizedFilter ? ICON_PICKER_ICONS.filter((iconName) => {
      return iconName.includes(normalizedFilter);
    }) : ICON_PICKER_ICONS;
    for (const iconName of filteredIcons) {
      const cell = document.createElement("div");
      cell.className = "kanban-icon-picker__cell";
      if (iconName === currentIcon) {
        cell.classList.add("kanban-icon-picker__cell--active");
      }
      import_obsidian5.setIcon(cell, iconName);
      cell.title = iconName;
      cell.addEventListener("click", () => {
        onSelect(iconName);
        cleanup();
      });
      grid.append(cell);
    }
  };
  renderGrid("");
  searchInput.addEventListener("input", () => {
    renderGrid(searchInput.value.trim());
  });
  const removeButton = document.createElement("div");
  removeButton.className = "kanban-icon-picker__remove";
  import_obsidian5.setIcon(removeButton, "rotate-ccw");
  removeButton.append(document.createTextNode(" Remove icon"));
  removeButton.addEventListener("click", () => {
    onSelect(null);
    cleanup();
  });
  modal.append(removeButton);
  modal.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key === "Escape") {
      cleanup();
    }
  });
  document.body.append(overlay, modal);
  searchInput.focus();
}
// src/ui/project/project.utils.ts
function getProjectColor(projectTitle, projectIndex, board) {
  const customColor = board.settings.projectColors[projectTitle];
  if (customColor) {
    return customColor;
  }
  return PROJECT_COLORS[projectIndex % PROJECT_COLORS.length] ?? "var(--color-blue)";
}
function getProjectIcon(projectTitle, board) {
  return board.settings.projectIcons[projectTitle] ?? null;
}

// src/ui/project/project.ts
function createProjectElement(options) {
  const { board, onMutation, pluginSettings, project, projectIndex, vault, viewState } = options;
  const isCollapsed = board.settings.collapsedProjects.includes(project.title);
  const projectElement = document.createElement("div");
  projectElement.className = "kanban-project";
  projectElement.dataset.projectIndex = String(projectIndex);
  if (isCollapsed) {
    projectElement.classList.add("kanban-project--collapsed");
    projectElement.addEventListener("click", () => {
      const newCollapsed = board.settings.collapsedProjects.filter((name) => {
        return name !== project.title;
      });
      onMutation({
        ...board,
        settings: { ...board.settings, collapsedProjects: newCollapsed }
      });
    });
  }
  const header = document.createElement("div");
  header.className = "kanban-project__header";
  const titleElement = document.createElement("div");
  titleElement.className = "kanban-project__title";
  titleElement.textContent = project.title;
  titleElement.addEventListener("dblclick", () => {
    startInlineEdit(titleElement, project.title, (newTitle) => {
      const wasCollapsed = board.settings.collapsedProjects.includes(project.title);
      const newProjects = board.projects.map((proj, index) => {
        return index === projectIndex ? { ...proj, title: newTitle } : proj;
      });
      let newCollapsedProjects = [...board.settings.collapsedProjects];
      if (wasCollapsed) {
        newCollapsedProjects = newCollapsedProjects.map((name) => {
          return name === project.title ? newTitle : name;
        });
      }
      onMutation({
        ...board,
        projects: newProjects,
        settings: { ...board.settings, collapsedProjects: newCollapsedProjects }
      });
    });
  });
  const visibleCardCount = viewState.hideCompletedActive ? project.cards.filter((card2) => {
    return !card2.completed;
  }).length : project.cards.length;
  const countBadge = document.createElement("span");
  countBadge.className = "kanban-project__count";
  countBadge.textContent = String(visibleCardCount);
  const dragHandle = document.createElement("span");
  dragHandle.className = "kanban-project__drag-handle";
  import_obsidian6.setIcon(dragHandle, "grip-vertical");
  const colorDot = document.createElement("span");
  colorDot.className = "kanban-project__color-dot";
  colorDot.style.background = getProjectColor(project.title, projectIndex, board);
  const projectIcon = getProjectIcon(project.title, board);
  if (projectIcon) {
    const iconSpan = document.createElement("span");
    iconSpan.className = "kanban-project__icon";
    import_obsidian6.setIcon(iconSpan, projectIcon);
    header.append(dragHandle, colorDot, iconSpan, titleElement, countBadge);
  } else {
    header.append(dragHandle, colorDot, titleElement, countBadge);
  }
  header.addEventListener("contextmenu", (headerEvent) => {
    headerEvent.preventDefault();
    const menu = new import_obsidian6.Menu;
    menu.addItem((item) => {
      return item.setIcon("eye-off").setTitle("Hide project").onClick(() => {
        const newCollapsed = [...board.settings.collapsedProjects, project.title];
        onMutation({
          ...board,
          settings: { ...board.settings, collapsedProjects: newCollapsed }
        });
      });
    });
    menu.addItem((item) => {
      return item.setIcon("palette").setTitle("Color").onClick((colorMenuEvent) => {
        const colorMenu = new import_obsidian6.Menu;
        for (const color of PROJECT_COLORS) {
          const label = PROJECT_COLOR_LABELS[color] ?? color;
          const isActive = board.settings.projectColors[project.title] === color;
          colorMenu.addItem((colorItem) => {
            const fragment = document.createDocumentFragment();
            const dot = document.createElement("span");
            dot.className = "kanban-menu__color-dot";
            dot.style.background = color;
            const text = document.createElement("span");
            text.textContent = label;
            fragment.append(dot, text);
            colorItem.setTitle(fragment);
            if (isActive) {
              colorItem.setChecked(true);
            }
            colorItem.onClick(() => {
              const newProjectColors = {
                ...board.settings.projectColors,
                [project.title]: color
              };
              onMutation({
                ...board,
                settings: {
                  ...board.settings,
                  projectColors: newProjectColors
                }
              });
            });
          });
        }
        colorMenu.addSeparator();
        colorMenu.addItem((colorItem) => {
          return colorItem.setIcon("rotate-ccw").setTitle("Reset color").onClick(() => {
            const { [project.title]: _removedColor, ...remainingColors } = board.settings.projectColors;
            onMutation({
              ...board,
              settings: { ...board.settings, projectColors: remainingColors }
            });
          });
        });
        colorMenu.showAtMouseEvent(colorMenuEvent);
      });
    });
    menu.addItem((item) => {
      return item.setIcon("smile").setTitle("Icon").onClick(() => {
        showIconPicker({
          currentIcon: getProjectIcon(project.title, board),
          onSelect: (iconName) => {
            if (iconName === null) {
              const { [project.title]: _removed, ...remainingIcons } = board.settings.projectIcons;
              onMutation({
                ...board,
                settings: { ...board.settings, projectIcons: remainingIcons }
              });
            } else {
              const newProjectIcons = {
                ...board.settings.projectIcons,
                [project.title]: iconName
              };
              onMutation({
                ...board,
                settings: { ...board.settings, projectIcons: newProjectIcons }
              });
            }
          }
        });
      });
    });
    menu.addSeparator();
    menu.addItem((item) => {
      return item.setIcon("trash-2").setTitle("Delete project").setWarning(true).onClick(() => {
        if (project.cards.length > 0) {
          new import_obsidian6.Notice("Cannot delete a project that still has cards.");
          return;
        }
        const newProjects = board.projects.filter((_project, index) => {
          return index !== projectIndex;
        });
        const newCollapsed = board.settings.collapsedProjects.filter((name) => {
          return name !== project.title;
        });
        onMutation({
          ...board,
          projects: newProjects,
          settings: { ...board.settings, collapsedProjects: newCollapsed }
        });
      });
    });
    menu.showAtMouseEvent(headerEvent);
  });
  projectElement.append(header);
  if (!isCollapsed) {
    const cardList = document.createElement("div");
    cardList.className = "kanban-project__cards";
    cardList.dataset.projectIndex = String(projectIndex);
    const sortedCardIndices = project.cards.map((_card, index) => {
      return index;
    }).sort((indexA, indexB) => {
      const completedA = project.cards[indexA]?.completed ?? false ? 1 : 0;
      const completedB = project.cards[indexB]?.completed ?? false ? 1 : 0;
      return completedA - completedB;
    });
    for (const cardIndex of sortedCardIndices) {
      const card2 = project.cards[cardIndex];
      if (!card2) {
        continue;
      }
      cardList.append(createCardElement({
        board,
        card: card2,
        cardIndex,
        onMutation,
        pluginSettings,
        projectIndex,
        projectPill: null,
        vault
      }));
    }
    projectElement.append(cardList);
    projectElement.append(createAddCardForm(projectIndex, board, onMutation));
  }
  return projectElement;
}
function createAddProjectButton(board, onMutation) {
  const button = document.createElement("button");
  button.className = "kanban-add-project__button";
  button.textContent = "+ Add project";
  button.addEventListener("click", () => {
    const name = "New Project";
    const newProject = { cards: [], title: name };
    onMutation({
      ...board,
      projects: [...board.projects, newProject]
    });
  });
  return button;
}
// src/ui/sortable/sortable.ts
function createCardSortableOptions(onEnd, group) {
  return {
    animation: 150,
    dragClass: "kanban-card--drag",
    fallbackClass: "kanban-card--dragging",
    fallbackOnBody: true,
    forceFallback: true,
    ghostClass: "kanban-card--ghost",
    group: group ?? "kanban-cards",
    handle: ".kanban-card__drag-handle",
    onEnd
  };
}
function createProjectCardMoveHandler(board, onMutation) {
  return (event) => {
    const fromProjectIndex = Number(event.from.dataset.projectIndex);
    const toProjectIndex = Number(event.to.dataset.projectIndex);
    const draggedCardId = event.item.dataset.cardId;
    if (!draggedCardId) {
      return;
    }
    const sourceProject = board.projects[fromProjectIndex];
    if (!sourceProject) {
      return;
    }
    const sourceCardIndex = sourceProject.cards.findIndex((card3) => {
      return card3.id === draggedCardId;
    });
    if (sourceCardIndex === -1) {
      return;
    }
    const card2 = sourceProject.cards[sourceCardIndex];
    if (!card2) {
      return;
    }
    let newProjects = immutableSpliceCard({
      cardIndex: sourceCardIndex,
      deleteCount: 1,
      projectIndex: fromProjectIndex,
      projects: board.projects
    });
    const targetCardElements = event.to.querySelectorAll(".kanban-card");
    const targetProject = newProjects[toProjectIndex];
    if (!targetProject) {
      return;
    }
    let insertIndex = targetProject.cards.length;
    for (let domIndex = 0;domIndex < targetCardElements.length; domIndex++) {
      const currentElement = targetCardElements[domIndex];
      if (!currentElement) {
        continue;
      }
      if (currentElement.dataset.cardId !== draggedCardId) {
        continue;
      }
      const nextElement = targetCardElements[domIndex + 1];
      if (nextElement) {
        const nextCardId = nextElement.dataset.cardId;
        const nextDataIndex = targetProject.cards.findIndex((searchCard) => {
          return searchCard.id === nextCardId;
        });
        if (nextDataIndex !== -1) {
          insertIndex = nextDataIndex;
        }
      }
      break;
    }
    newProjects = immutableSpliceCard({
      cardIndex: insertIndex,
      deleteCount: 0,
      insertCards: [card2],
      projectIndex: toProjectIndex,
      projects: newProjects
    });
    onMutation({ ...board, projects: newProjects });
  };
}
// src/ui/today-view/today-view.ts
var import_sortablejs = __toESM(require_Sortable_min(), 1);

// src/ui/today-view/today-view.utils.ts
function isCardVisibleInTodayFilter(card2) {
  if (card2.completed) {
    return false;
  }
  if (card2.date) {
    return true;
  }
  return false;
}
function sortCardsByOrder(cards, savedOrder) {
  if (savedOrder.length === 0) {
    return cards;
  }
  const sorted = [...cards];
  sorted.sort((first, second) => {
    const indexOfFirst = savedOrder.indexOf(first.card.id);
    const indexOfSecond = savedOrder.indexOf(second.card.id);
    const effectiveFirst = indexOfFirst === -1 ? savedOrder.length : indexOfFirst;
    const effectiveSecond = indexOfSecond === -1 ? savedOrder.length : indexOfSecond;
    return effectiveFirst - effectiveSecond;
  });
  return sorted;
}
function formatDateGroupLabel(dateString) {
  const dayDifference = getDayDifference(dateString);
  if (dayDifference === 1) {
    return "Tomorrow";
  }
  if (dayDifference <= 7) {
    return `In ${dayDifference} days`;
  }
  const cardDate = new Date(`${dateString}T00:00:00`);
  return cardDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short"
  });
}
function formatDateGroupSubtitle(dateKey) {
  if (dateKey === "today" || dateKey === "overdue") {
    return "";
  }
  const dayDifference = getDayDifference(dateKey);
  if (dayDifference < 1 || dayDifference > 7) {
    return "";
  }
  const date2 = new Date(`${dateKey}T00:00:00`);
  return date2.toLocaleDateString("en-US", { day: "numeric", month: "short", weekday: "short" });
}
function addCardToFutureBucket(futureBuckets, dateKey, todayCard) {
  const existing = futureBuckets.get(dateKey);
  if (existing) {
    existing.push(todayCard);
  } else {
    futureBuckets.set(dateKey, [todayCard]);
  }
}
function collectCardsByDateGroup(board) {
  const todayString = toDateString(new Date);
  const overdueCards = [];
  const todayCards = [];
  const futureBuckets = new Map;
  for (let projectIndex = 0;projectIndex < board.projects.length; projectIndex++) {
    const project3 = board.projects[projectIndex];
    if (!project3) {
      continue;
    }
    for (let cardIndex = 0;cardIndex < project3.cards.length; cardIndex++) {
      const card2 = project3.cards[cardIndex];
      if (!card2) {
        continue;
      }
      if (!isCardVisibleInTodayFilter(card2)) {
        continue;
      }
      if (!card2.date) {
        continue;
      }
      const todayCard = {
        card: card2,
        cardIndex,
        projectIndex,
        projectTitle: project3.title
      };
      if (card2.date.localeCompare(todayString) < 0) {
        overdueCards.push(todayCard);
        continue;
      }
      if (card2.date === todayString) {
        todayCards.push(todayCard);
        continue;
      }
      addCardToFutureBucket(futureBuckets, card2.date, todayCard);
    }
  }
  const savedOrder = board.settings.todayOrder;
  const groups = [];
  if (overdueCards.length > 0) {
    groups.push({
      cards: sortCardsByOrder(overdueCards, savedOrder.overdue ?? []),
      dateKey: "overdue",
      label: "Overdue"
    });
  }
  groups.push({
    cards: sortCardsByOrder(todayCards, savedOrder.today ?? []),
    dateKey: "today",
    label: "Today"
  });
  const sortedFutureDates = [...futureBuckets.keys()].sort((first, second) => {
    return first.localeCompare(second);
  });
  for (const dateKey of sortedFutureDates) {
    const cards = futureBuckets.get(dateKey);
    if (!cards) {
      continue;
    }
    groups.push({
      cards: sortCardsByOrder(cards, savedOrder[dateKey] ?? []),
      dateKey,
      label: formatDateGroupLabel(dateKey)
    });
  }
  return groups;
}
function getDateForSection(dateKey) {
  if (dateKey === "today") {
    return toDateString(new Date);
  }
  if (dateKey === "overdue") {
    return null;
  }
  return dateKey;
}
function collectTodayOrderFromSections(sectionCardLists) {
  const newTodayOrder = {};
  for (const listItem of sectionCardLists) {
    const cardElements = listItem.element.querySelectorAll(".kanban-card");
    const orderIds = [];
    for (const element of Array.from(cardElements)) {
      const elementCardId = element.dataset.cardId;
      if (elementCardId) {
        orderIds.push(elementCardId);
      }
    }
    if (orderIds.length > 0) {
      newTodayOrder[listItem.dateKey] = orderIds;
    }
  }
  return newTodayOrder;
}

// src/ui/today-view/today-view.ts
function renderTodayView(options) {
  const { board, container, onMutation, pluginSettings, vault, viewState } = options;
  const dateGroups = collectCardsByDateGroup(board);
  const todayPanel = document.createElement("div");
  todayPanel.className = "kanban-today";
  const sortableInstances = [];
  const sectionCardLists = [];
  for (const group of dateGroups) {
    const section = document.createElement("div");
    section.className = "kanban-today__section";
    if (group.dateKey === "overdue") {
      section.classList.add("kanban-today__section--overdue");
    }
    const header = document.createElement("div");
    header.className = "kanban-today__header";
    const title = document.createElement("div");
    title.className = "kanban-today__title";
    if (group.dateKey === "overdue") {
      title.classList.add("kanban-today__title--overdue");
    }
    title.textContent = group.label;
    const count = document.createElement("span");
    count.className = "kanban-today__count";
    count.textContent = String(group.cards.length);
    header.append(title, count);
    const subtitle = formatDateGroupSubtitle(group.dateKey);
    if (subtitle) {
      const subtitleSpan = document.createElement("span");
      subtitleSpan.className = "kanban-today__title-date";
      subtitleSpan.textContent = subtitle;
      header.append(subtitleSpan);
    }
    if (group.dateKey !== "overdue") {
      const addButton = document.createElement("span");
      addButton.className = "kanban-today__add-button";
      addButton.textContent = "+";
      addButton.addEventListener("click", () => {
        openQuickAddDialog({
          board,
          onMutation,
          prefillDate: getDateForSection(group.dateKey)
        });
      });
      header.append(addButton);
    }
    section.append(header);
    const cardListElement = document.createElement("div");
    cardListElement.className = "kanban-today__cards";
    cardListElement.dataset.dateKey = group.dateKey;
    for (const todayCard of group.cards) {
      const pill = {
        color: getProjectColor(todayCard.projectTitle, todayCard.projectIndex, board),
        icon: getProjectIcon(todayCard.projectTitle, board),
        title: todayCard.projectTitle
      };
      const cardElement = createCardElement({
        board,
        card: todayCard.card,
        cardIndex: todayCard.cardIndex,
        onMutation,
        pluginSettings,
        projectIndex: todayCard.projectIndex,
        projectPill: pill,
        vault
      });
      cardListElement.append(cardElement);
    }
    if (group.cards.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "kanban-today__empty";
      emptyMessage.textContent = "No tasks for today";
      cardListElement.append(emptyMessage);
    }
    section.append(cardListElement);
    todayPanel.append(section);
    sectionCardLists.push({ dateKey: group.dateKey, element: cardListElement });
  }
  const layout = document.createElement("div");
  layout.className = "kanban-today-layout";
  layout.append(todayPanel);
  const projectsPanel = document.createElement("div");
  projectsPanel.className = "kanban-today-layout__projects";
  for (let projectIndex = 0;projectIndex < board.projects.length; projectIndex++) {
    const project3 = board.projects[projectIndex];
    if (!project3) {
      continue;
    }
    const projectElement = createProjectElement({
      board,
      onMutation,
      pluginSettings,
      project: project3,
      projectIndex,
      vault,
      viewState
    });
    projectsPanel.append(projectElement);
  }
  layout.append(projectsPanel);
  container.append(layout);
  for (const { element: cardListElement } of sectionCardLists) {
    const sectionSortable = import_sortablejs.default.create(cardListElement, createCardSortableOptions((sortableEvent) => {
      const targetDateKey = sortableEvent.to.dataset.dateKey;
      const sourceDateKey = sortableEvent.from.dataset.dateKey;
      const cardId = sortableEvent.item.dataset.cardId;
      const movedCardIndex = Number(sortableEvent.item.dataset.cardIndex);
      const movedProjectIndex = Number(sortableEvent.item.dataset.projectIndex);
      if (cardId && targetDateKey && sourceDateKey !== targetDateKey) {
        const targetDate = getDateForSection(targetDateKey);
        if (targetDate) {
          const newProjects = immutableUpdateCard({
            cardIndex: movedCardIndex,
            projectIndex: movedProjectIndex,
            projects: board.projects,
            update: { date: targetDate }
          });
          const newTodayOrder2 = collectTodayOrderFromSections(sectionCardLists);
          onMutation({
            ...board,
            projects: newProjects,
            settings: { ...board.settings, todayOrder: newTodayOrder2 }
          });
          return;
        }
      }
      const newTodayOrder = collectTodayOrderFromSections(sectionCardLists);
      onMutation({
        ...board,
        settings: { ...board.settings, todayOrder: newTodayOrder }
      });
    }, "kanban-today-cards"));
    sortableInstances.push(sectionSortable);
  }
  const cardLists = projectsPanel.querySelectorAll(".kanban-project__cards");
  for (const cardList of Array.from(cardLists)) {
    const instance = import_sortablejs.default.create(cardList, createCardSortableOptions(createProjectCardMoveHandler(board, onMutation)));
    sortableInstances.push(instance);
  }
  return sortableInstances;
}
// src/ui/toolbar/toolbar.ts
var import_obsidian9 = require("obsidian");

// src/plugin/self-update/self-update.ts
var import_obsidian7 = require("obsidian");
async function selfUpdate(app) {
  const pluginDirectory = `${app.vault.configDir}/plugins/${PLUGIN_ID}`;
  const files = ["main.js", "manifest.json", "styles.css"];
  const currentManifestResponse = await app.vault.adapter.read(`${pluginDirectory}/manifest.json`);
  const currentVersion = JSON.parse(currentManifestResponse).version;
  const manifestResponse = await import_obsidian7.requestUrl({
    url: `https://github.com/${BRAT_REPO}/releases/latest/download/manifest.json?cb=${Date.now()}`
  });
  const latestVersion = JSON.parse(manifestResponse.text).version;
  if (currentVersion === latestVersion) {
    new import_obsidian7.Notice(`Already on latest version (${currentVersion}).`);
    return;
  }
  const downloadBase = `https://github.com/${BRAT_REPO}/releases/download/${latestVersion}`;
  const downloads = await Promise.all(files.map(async (fileName) => {
    const response = await import_obsidian7.requestUrl({ url: `${downloadBase}/${fileName}` });
    return { content: response.text, fileName };
  }));
  for (const download of downloads) {
    await app.vault.adapter.write(`${pluginDirectory}/${download.fileName}`, download.content);
  }
  const kanbanFilePaths = [];
  app.workspace.iterateAllLeaves((leaf) => {
    if (leaf.view.getViewType() === KANBAN_VIEW_TYPE && leaf.view instanceof import_obsidian7.TextFileView && leaf.view.file) {
      kanbanFilePaths.push(leaf.view.file.path);
    }
  });
  await app.plugins.disablePlugin(PLUGIN_ID);
  await app.plugins.enablePlugin(PLUGIN_ID);
  const leavesToRestore = [];
  for (const filePath of kanbanFilePaths) {
    app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof import_obsidian7.MarkdownView && leaf.view.file?.path === filePath) {
        leavesToRestore.push({ filePath, leaf });
      }
    });
  }
  for (const { filePath, leaf } of leavesToRestore) {
    await leaf.setViewState({ state: { file: filePath }, type: "markdown" });
  }
  new import_obsidian7.Notice(`Updated to ${latestVersion}. Plugin reloaded.`);
}
// src/ui/toolbar/toolbar.utils.ts
var import_obsidian8 = require("obsidian");
function setButtonContent(button, iconName, label) {
  button.empty();
  const iconSpan = button.createSpan({ cls: "kanban-toolbar__button-icon" });
  import_obsidian8.setIcon(iconSpan, iconName);
  button.createSpan({ text: label });
}

// src/ui/toolbar/toolbar.ts
function createToolbar(options) {
  const { app, board, onMutation, onViewStateChange, viewState } = options;
  const toolbar = document.createElement("div");
  toolbar.className = "kanban-toolbar";
  const addTaskButton = document.createElement("button");
  addTaskButton.className = "kanban-toolbar__button";
  setButtonContent(addTaskButton, "plus", "Add task");
  addTaskButton.addEventListener("click", () => {
    openQuickAddDialog({ board, onMutation });
  });
  const todayButton = document.createElement("button");
  todayButton.className = "kanban-toolbar__button";
  if (viewState.todayFilterActive) {
    todayButton.classList.add("kanban-toolbar__button--active");
  }
  setButtonContent(todayButton, viewState.todayFilterActive ? "calendar-check" : "sun", "Today");
  todayButton.addEventListener("click", () => {
    onViewStateChange({ ...viewState, todayFilterActive: !viewState.todayFilterActive });
  });
  const hideCompletedButton = document.createElement("button");
  hideCompletedButton.className = "kanban-toolbar__button";
  if (viewState.hideCompletedActive) {
    hideCompletedButton.classList.add("kanban-toolbar__button--active");
  }
  setButtonContent(hideCompletedButton, viewState.hideCompletedActive ? "eye-off" : "eye", "Hide completed");
  hideCompletedButton.addEventListener("click", () => {
    onViewStateChange({ ...viewState, hideCompletedActive: !viewState.hideCompletedActive });
  });
  const toolbarSpacer = document.createElement("div");
  toolbarSpacer.className = "kanban-toolbar__spacer";
  const pluginManifest = app.plugins.plugins["obsidian-vuki-kanban"]?.manifest;
  const versionLabel = document.createElement("span");
  versionLabel.className = "kanban-toolbar__version";
  versionLabel.textContent = pluginManifest ? `v${pluginManifest.version}` : "";
  const updateButton = document.createElement("button");
  updateButton.className = "kanban-toolbar__button";
  setButtonContent(updateButton, "download", "Update");
  updateButton.addEventListener("click", async () => {
    setButtonContent(updateButton, "loader-2", "Updating...");
    updateButton.disabled = true;
    try {
      await selfUpdate(app);
    } catch (error) {
      new import_obsidian9.Notice(`Update failed: ${error}`);
    }
    setButtonContent(updateButton, "download", "Update");
    updateButton.disabled = false;
  });
  toolbar.append(addTaskButton, todayButton, hideCompletedButton, toolbarSpacer, versionLabel, updateButton);
  return toolbar;
}
// src/ui/board/board.ts
function renderBoardProjects(options) {
  const { board, container, onMutation, pluginSettings, vault, viewState } = options;
  const boardElement = document.createElement("div");
  boardElement.className = "kanban-board";
  container.append(boardElement);
  for (let projectIndex = 0;projectIndex < board.projects.length; projectIndex++) {
    const project3 = board.projects[projectIndex];
    if (!project3) {
      continue;
    }
    const projectElement = createProjectElement({
      board,
      onMutation,
      pluginSettings,
      project: project3,
      projectIndex,
      vault,
      viewState
    });
    boardElement.append(projectElement);
  }
  boardElement.append(createAddProjectButton(board, onMutation));
  const sortableInstances = [];
  const projectSortable = import_sortablejs2.default.create(boardElement, {
    animation: 150,
    draggable: ".kanban-project",
    fallbackClass: "kanban-project--dragging",
    fallbackOnBody: true,
    forceFallback: true,
    ghostClass: "kanban-project--ghost",
    handle: ".kanban-project__drag-handle",
    onEnd: (sortableEvent) => {
      const { newIndex, oldIndex } = sortableEvent;
      if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
        return;
      }
      const newProjects = [...board.projects];
      const [moved] = newProjects.splice(oldIndex, 1);
      if (!moved) {
        return;
      }
      newProjects.splice(newIndex, 0, moved);
      onMutation({ ...board, projects: newProjects });
    }
  });
  sortableInstances.push(projectSortable);
  const cardLists = boardElement.querySelectorAll(".kanban-project__cards");
  for (const cardList of Array.from(cardLists)) {
    const instance = import_sortablejs2.default.create(cardList, createCardSortableOptions(createProjectCardMoveHandler(board, onMutation)));
    sortableInstances.push(instance);
  }
  return sortableInstances;
}
function renderBoard(options) {
  const {
    app,
    board,
    container,
    onMutation,
    onViewStateChange,
    pluginSettings,
    vault,
    viewState
  } = options;
  const previousBoard = container.querySelector(".kanban-board");
  const savedScrollLeft = previousBoard ? previousBoard.scrollLeft : 0;
  const previousTodayList = container.querySelector(".kanban-today");
  const savedTodayScroll = previousTodayList ? previousTodayList.scrollTop : 0;
  const previousProjectsPanel = container.querySelector(".kanban-today-layout__projects");
  const savedProjectsPanelScroll = previousProjectsPanel ? previousProjectsPanel.scrollTop : 0;
  container.style.visibility = "hidden";
  container.empty();
  if (viewState.hideCompletedActive) {
    container.dataset.hideCompleted = "true";
  } else {
    delete container.dataset.hideCompleted;
  }
  const toolbar2 = createToolbar({ app, board, onMutation, onViewStateChange, viewState });
  container.append(toolbar2);
  if (viewState.todayFilterActive) {
    const sortableInstances2 = renderTodayView({
      board,
      container,
      onMutation,
      pluginSettings,
      vault,
      viewState
    });
    const newTodayList = container.querySelector(".kanban-today");
    const newProjectsPanel = container.querySelector(".kanban-today-layout__projects");
    if (newTodayList) {
      newTodayList.scrollTop = savedTodayScroll;
    }
    if (newProjectsPanel) {
      newProjectsPanel.scrollTop = savedProjectsPanelScroll;
    }
    container.style.visibility = "";
    return sortableInstances2;
  }
  const sortableInstances = renderBoardProjects({
    board,
    container,
    onMutation,
    pluginSettings,
    vault,
    viewState
  });
  const newBoard = container.querySelector(".kanban-board");
  if (newBoard) {
    newBoard.scrollLeft = savedScrollLeft;
  }
  container.style.visibility = "";
  return sortableInstances;
}
// src/plugin/view.ts
class KanbanView extends import_obsidian10.TextFileView {
  board = {
    projects: [],
    settings: { collapsedProjects: [], projectColors: {}, projectIcons: {}, todayOrder: {} }
  };
  boardContainer;
  plugin;
  sortableInstances = [];
  viewState = { hideCompletedActive: true, todayFilterActive: true };
  constructor(leaf, plugin2) {
    super(leaf);
    this.plugin = plugin2;
    this.boardContainer = this.contentEl.createDiv({ cls: "kanban-container" });
  }
  clear() {
    this.board = {
      projects: [],
      settings: {
        collapsedProjects: [],
        projectColors: {},
        projectIcons: {},
        todayOrder: {}
      }
    };
    this.boardContainer.empty();
  }
  getDisplayText() {
    return this.file?.basename ?? "Kanban";
  }
  getViewData() {
    return serializeBoard(this.board);
  }
  getViewType() {
    return KANBAN_VIEW_TYPE;
  }
  async onClose() {
    this.destroySortable();
  }
  setViewData(data, clear) {
    this.board = parseBoard(data);
    if (clear) {
      this.viewState = { hideCompletedActive: true, todayFilterActive: true };
    }
    this.render();
  }
  destroySortable() {
    for (const instance of this.sortableInstances) {
      instance.destroy();
    }
    this.sortableInstances = [];
  }
  render() {
    this.destroySortable();
    this.sortableInstances = renderBoard({
      app: this.app,
      board: this.board,
      container: this.boardContainer,
      onMutation: (newBoard) => {
        this.board = newBoard;
        this.requestSave();
        this.render();
      },
      onViewStateChange: (newViewState) => {
        this.viewState = newViewState;
        this.render();
      },
      pluginSettings: this.plugin.settings,
      vault: this.app.vault,
      viewState: this.viewState
    });
  }
}

// src/plugin/plugin.ts
class VukiKanbanPlugin extends import_obsidian11.Plugin {
  settings = DEFAULT_PLUGIN_SETTINGS;
  uninstallMonkeyPatch = null;
  async loadSettings() {
    this.settings = { ...DEFAULT_PLUGIN_SETTINGS, ...await this.loadData() };
  }
  async onload() {
    await this.loadSettings();
    this.registerView(KANBAN_VIEW_TYPE, (leaf) => {
      return new KanbanView(leaf, this);
    });
    this.addSettingTab(new VukiKanbanSettingTab(this.app, this));
    this.patchWorkspaceLeaf();
  }
  onunload() {
    if (this.uninstallMonkeyPatch) {
      this.uninstallMonkeyPatch();
      this.uninstallMonkeyPatch = null;
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  patchWorkspaceLeaf() {
    const pluginInstance = this;
    this.uninstallMonkeyPatch = around(import_obsidian11.WorkspaceLeaf.prototype, {
      setViewState(original) {
        return async function(state, ...rest) {
          if (state.type === "markdown" && state.state?.file) {
            const fileCache = pluginInstance.app.metadataCache.getCache(state.state.file);
            if (fileCache?.frontmatter?.["kanban-plugin"] === FRONTMATTER_KEY) {
              const kanbanState = {
                ...state,
                type: KANBAN_VIEW_TYPE
              };
              return original.call(this, kanbanState, ...rest);
            }
          }
          return original.call(this, state, ...rest);
        };
      }
    });
    this.register(() => {
      if (this.uninstallMonkeyPatch) {
        this.uninstallMonkeyPatch();
        this.uninstallMonkeyPatch = null;
      }
    });
  }
}
