(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["xxx"] = factory();
	else
		root["xxx"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../../node_modules/webpack-theme-set/dist/index.cjs.js":
/*!*********************************************!*\
  !*** (webpack)-theme-set/dist/index.cjs.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var t=function(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n};var e=function(e){if(Array.isArray(e))return t(e)};var r=function(t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)};var n=function(e,r){if(e){if("string"==typeof e)return t(e,r);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?t(e,r):void 0}};var o=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")};var i=function(t){return e(t)||r(t)||n(t)||o()};var a=function(t,e){return t(e={exports:{}},e.exports),e.exports}((function(t){var e=function(t){var e=Object.prototype,r=e.hasOwnProperty,n="function"==typeof Symbol?Symbol:{},o=n.iterator||"@@iterator",i=n.asyncIterator||"@@asyncIterator",a=n.toStringTag||"@@toStringTag";function s(t,e,r,n){var o=e&&e.prototype instanceof h?e:h,i=Object.create(o.prototype),a=new b(n||[]);return i._invoke=function(t,e,r){var n="suspendedStart";return function(o,i){if("executing"===n)throw new Error("Generator is already running");if("completed"===n){if("throw"===o)throw i;return L()}for(r.method=o,r.arg=i;;){var a=r.delegate;if(a){var s=T(a,r);if(s){if(s===u)continue;return s}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if("suspendedStart"===n)throw n="completed",r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n="executing";var h=c(t,e,r);if("normal"===h.type){if(n=r.done?"completed":"suspendedYield",h.arg===u)continue;return{value:h.arg,done:r.done}}"throw"===h.type&&(n="completed",r.method="throw",r.arg=h.arg)}}}(t,r,a),i}function c(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}t.wrap=s;var u={};function h(){}function f(){}function l(){}var m={};m[o]=function(){return this};var p=Object.getPrototypeOf,v=p&&p(p(E([])));v&&v!==e&&r.call(v,o)&&(m=v);var y=l.prototype=h.prototype=Object.create(m);function d(t){["next","throw","return"].forEach((function(e){t[e]=function(t){return this._invoke(e,t)}}))}function g(t,e){var n;this._invoke=function(o,i){function a(){return new e((function(n,a){!function n(o,i,a,s){var u=c(t[o],t,i);if("throw"!==u.type){var h=u.arg,f=h.value;return f&&"object"==typeof f&&r.call(f,"__await")?e.resolve(f.__await).then((function(t){n("next",t,a,s)}),(function(t){n("throw",t,a,s)})):e.resolve(f).then((function(t){h.value=t,a(h)}),(function(t){return n("throw",t,a,s)}))}s(u.arg)}(o,i,n,a)}))}return n=n?n.then(a,a):a()}}function T(t,e){var r=t.iterator[e.method];if(void 0===r){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=void 0,T(t,e),"throw"===e.method))return u;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return u}var n=c(r,t.iterator,e.arg);if("throw"===n.type)return e.method="throw",e.arg=n.arg,e.delegate=null,u;var o=n.arg;return o?o.done?(e[t.resultName]=o.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=void 0),e.delegate=null,u):o:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,u)}function w(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function x(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function b(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(w,this),this.reset(!0)}function E(t){if(t){var e=t[o];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var n=-1,i=function e(){for(;++n<t.length;)if(r.call(t,n))return e.value=t[n],e.done=!1,e;return e.value=void 0,e.done=!0,e};return i.next=i}}return{next:L}}function L(){return{value:void 0,done:!0}}return f.prototype=y.constructor=l,l.constructor=f,l[a]=f.displayName="GeneratorFunction",t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===f||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,l):(t.__proto__=l,a in t||(t[a]="GeneratorFunction")),t.prototype=Object.create(y),t},t.awrap=function(t){return{__await:t}},d(g.prototype),g.prototype[i]=function(){return this},t.AsyncIterator=g,t.async=function(e,r,n,o,i){void 0===i&&(i=Promise);var a=new g(s(e,r,n,o),i);return t.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},d(y),y[a]="Generator",y[o]=function(){return this},y.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},t.values=E,b.prototype={constructor:b,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(x),!t)for(var e in this)"t"===e.charAt(0)&&r.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function n(r,n){return a.type="throw",a.arg=t,e.next=r,n&&(e.method="next",e.arg=void 0),!!n}for(var o=this.tryEntries.length-1;o>=0;--o){var i=this.tryEntries[o],a=i.completion;if("root"===i.tryLoc)return n("end");if(i.tryLoc<=this.prev){var s=r.call(i,"catchLoc"),c=r.call(i,"finallyLoc");if(s&&c){if(this.prev<i.catchLoc)return n(i.catchLoc,!0);if(this.prev<i.finallyLoc)return n(i.finallyLoc)}else if(s){if(this.prev<i.catchLoc)return n(i.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return n(i.finallyLoc)}}}},abrupt:function(t,e){for(var n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n];if(o.tryLoc<=this.prev&&r.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,u):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),u},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),x(r),u}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;x(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,r){return this.delegate={iterator:E(t),resultName:e,nextLoc:r},"next"===this.method&&(this.arg=void 0),u}},t}(t.exports);try{regeneratorRuntime=e}catch(t){Function("r","regeneratorRuntime = r")(e)}}));function s(t,e,r,n,o,i,a){try{var s=t[i](a),c=s.value}catch(t){return void r(t)}s.done?e(c):Promise.resolve(c).then(n,o)}var c=function(t){return function(){var e=this,r=arguments;return new Promise((function(n,o){var i=t.apply(e,r);function a(t){s(i,n,o,a,c,"next",t)}function c(t){s(i,n,o,a,c,"throw",t)}a(void 0)}))}};var u=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")};function h(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var f=function(t,e,r){return e&&h(t.prototype,e),r&&h(t,r),t};var l=function(t){if(Array.isArray(t))return t};var m=function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var r=[],n=!0,o=!1,i=void 0;try{for(var a,s=t[Symbol.iterator]();!(n=(a=s.next()).done)&&(r.push(a.value),!e||r.length!==e);n=!0);}catch(t){o=!0,i=t}finally{try{n||null==s.return||s.return()}finally{if(o)throw i}}return r}};var p=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")};var v=function(t,e){return l(t)||m(t,e)||n(t,e)||p()};var y="app-",d="default",g=1,T="theme-css-name",w="switchable-theme",x=new(function(){function t(){u(this,t),this.cssThemePrefix=y,this.cssThemeName=d,this.cssThemeFileCount=g}var e,r;return f(t,[{key:"autoSetTheme",value:function(){if(window._pageThemeConfig)return this.cssThemeName=window._pageThemeConfig.cssThemeName,this.cssThemePrefix=window._pageThemeConfig.cssThemePrefix||this.cssThemePrefix,this.cssThemeFileCount=window._pageThemeConfig.cssThemeFileCount||this.cssThemeFileCount,this.setTheme(this.cssThemeName,{count:this.cssThemeFileCount,prefix:this.cssThemePrefix});var t=function(){var t=window.location.href.split("?")[1];if(t){t.indexOf("#")>-1&&(t=t.split("#")[0]);var e={};return t.split("&").forEach((function(t){var r=t.split("="),n=v(r,2),o=n[0],i=n[1],a=void 0===i?"":i;o&&(e[o.trim()]=a)})),e}return{}}();if(t.cssThemeName)return this.setInitThemeFromObj(t),this.setTheme(this.cssThemeName,{count:this.cssThemeFileCount,prefix:this.cssThemePrefix});var e=document.cookie.split(";").reduce((function(t,e){var r=e.split("="),n=v(r,2),o=n[0],i=n[1];return o&&i&&(t[o.trim()]=i.trim()),t}),{});return e.cssThemeName?(this.setInitThemeFromObj(e),this.setTheme(this.cssThemeName,{count:this.cssThemeFileCount,prefix:this.cssThemePrefix})):void 0}},{key:"setTheme",value:(r=c(a.mark((function t(e){var r,n,o,i=arguments;return a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return r=i.length>1&&void 0!==i[1]?i[1]:{},n=r.count,o=r.prefix,this.cssThemeName=e,this.cssThemeFileCount=n||g,this.cssThemePrefix=o||y,t.abrupt("return",this.setThemeStyleSheet());case 5:case"end":return t.stop()}}),t,this)}))),function(t){return r.apply(this,arguments)})},{key:"setInitThemeFromObj",value:function(t){(null==t?void 0:t.cssThemeName)&&(this.cssThemePrefix=t.cssThemeName),(null==t?void 0:t.cssThemePrefix)&&(this.cssThemeName=t.cssThemePrefix),(null==t?void 0:t.cssThemeFileCount)&&(this.cssThemeFileCount=t.cssThemeFileCount)}},{key:"setThemeStyleSheet",value:(e=c(a.mark((function t(){var e,r;return a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e=document.head,r=Array.from(document.getElementsByTagName("link")).filter((function(t){return t.getAttribute(T)===w})),t.next=4,Promise.all(this.themePaths.map((function(t){var r,n,o=new Promise((function(t){r=t})),i=document.createElement("link");i.setAttribute("rel","stylesheet"),i.setAttribute("type","text/css"),i.setAttribute("href",t),i.setAttribute(T,w);var a=setTimeout((function(){n({type:"timeout",target:i})}),12e4);return n=function(){n=function(){},i.onerror=null,i.onload=null,clearTimeout(a),r()},i.onerror=n,i.onload=n,e.appendChild(i),o})));case 4:r.forEach((function(t){var e;null===(e=t.parentNode)||void 0===e||e.removeChild(t)}));case 5:case"end":return t.stop()}}),t,this)}))),function(){return e.apply(this,arguments)})},{key:"currentTheme",get:function(){return{cssThemePrefix:this.cssThemePrefix,cssThemeName:this.cssThemeName,cssThemeFileCount:this.cssThemeFileCount}}},{key:"themePaths",get:function(){var t=this;return 1===this.cssThemeFileCount?["./".concat(this.cssThemePrefix).concat(this.cssThemeName,".css")]:i(Array(this.cssThemeFileCount)).map((function(e,r){return"./".concat(t.cssThemePrefix).concat(t.cssThemeName,"-").concat(r+1,".css")}))}}]),t}());module.exports=x;


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_less__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.less */ "./src/style.less");
/* harmony import */ var _style_less__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_less__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var webpack_theme_set__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! webpack-theme-set */ "../../../node_modules/webpack-theme-set/dist/index.cjs.js");
/* harmony import */ var webpack_theme_set__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(webpack_theme_set__WEBPACK_IMPORTED_MODULE_1__);



// inital set Theme
webpack_theme_set__WEBPACK_IMPORTED_MODULE_1___default.a.setTheme('default', {
  prefix: 'app-'
})


/***/ }),

/***/ "./src/style.less":
/*!************************!*\
  !*** ./src/style.less ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by webpack-css-theme-plugin

/***/ })

/******/ });
});