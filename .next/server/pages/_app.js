/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @rainbow-me/rainbowkit */ \"@rainbow-me/rainbowkit\");\n/* harmony import */ var wagmi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! wagmi */ \"wagmi\");\n/* harmony import */ var viem_chains__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! viem/chains */ \"viem/chains\");\n/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! viem */ \"viem\");\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var _rainbow_me_rainbowkit_styles_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @rainbow-me/rainbowkit/styles.css */ \"./node_modules/@rainbow-me/rainbowkit/dist/index.css\");\n/* harmony import */ var _rainbow_me_rainbowkit_styles_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_rainbow_me_rainbowkit_styles_css__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_7__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_1__, wagmi__WEBPACK_IMPORTED_MODULE_2__, viem_chains__WEBPACK_IMPORTED_MODULE_3__, viem__WEBPACK_IMPORTED_MODULE_4__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_5__]);\n([_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_1__, wagmi__WEBPACK_IMPORTED_MODULE_2__, viem_chains__WEBPACK_IMPORTED_MODULE_3__, viem__WEBPACK_IMPORTED_MODULE_4__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_5__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n\n\n// WalletConnect Cloud Project ID\nconst projectId = \"1dd9135e45cf4362afb13efa00ae3148\";\nconst isMainnet = process.env.NEXT_PUBLIC_NETWORK === \"mainnet\";\nconst queryClient = new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_5__.QueryClient({\n    defaultOptions: {\n        queries: {\n            refetchOnWindowFocus: false\n        }\n    }\n});\nconst config = (0,_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_1__.getDefaultConfig)({\n    appName: \"Crypto Puzzles App\",\n    projectId: projectId,\n    chains: [\n        viem_chains__WEBPACK_IMPORTED_MODULE_3__.base,\n        viem_chains__WEBPACK_IMPORTED_MODULE_3__.baseSepolia\n    ],\n    ssr: true,\n    transports: {\n        [viem_chains__WEBPACK_IMPORTED_MODULE_3__.base.id]: (0,viem__WEBPACK_IMPORTED_MODULE_4__.http)(\"https://mainnet.base.org\"),\n        [viem_chains__WEBPACK_IMPORTED_MODULE_3__.baseSepolia.id]: (0,viem__WEBPACK_IMPORTED_MODULE_4__.http)(\"https://sepolia.base.org\") // Testnet RPC\n    }\n});\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(wagmi__WEBPACK_IMPORTED_MODULE_2__.WagmiProvider, {\n        config: config,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_5__.QueryClientProvider, {\n            client: queryClient,\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_1__.RainbowKitProvider, {\n                initialChain: isMainnet ? viem_chains__WEBPACK_IMPORTED_MODULE_3__.base : viem_chains__WEBPACK_IMPORTED_MODULE_3__.baseSepolia,\n                coolMode: true,\n                showRecentTransactions: true,\n                appInfo: {\n                    appName: \"Puzzle NFT Generator\"\n                },\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                    ...pageProps\n                }, void 0, false, {\n                    fileName: \"/Users/fuzzyghost/cpuzzles/pages/_app.js\",\n                    lineNumber: 45,\n                    columnNumber: 11\n                }, this)\n            }, void 0, false, {\n                fileName: \"/Users/fuzzyghost/cpuzzles/pages/_app.js\",\n                lineNumber: 37,\n                columnNumber: 7\n            }, this)\n        }, void 0, false, {\n            fileName: \"/Users/fuzzyghost/cpuzzles/pages/_app.js\",\n            lineNumber: 36,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/fuzzyghost/cpuzzles/pages/_app.js\",\n        lineNumber: 35,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBOEU7QUFDeEM7QUFDVTtBQUNwQjtBQUM2QztBQUM5QjtBQUNaO0FBRS9CLGlDQUFpQztBQUNqQyxNQUFNUSxZQUFZO0FBQ2xCLE1BQU1DLFlBQVlDLFFBQVFDLEdBQUcsQ0FBQ0MsbUJBQW1CLEtBQUs7QUFFdEQsTUFBTUMsY0FBYyxJQUFJUCw4REFBV0EsQ0FBQztJQUNsQ1EsZ0JBQWdCO1FBQ2RDLFNBQVM7WUFDUEMsc0JBQXNCO1FBQ3hCO0lBQ0Y7QUFDRjtBQUdBLE1BQU1DLFNBQVNoQix3RUFBZ0JBLENBQUM7SUFDOUJpQixTQUFTO0lBQ1RWLFdBQVdBO0lBQ1hXLFFBQVE7UUFBQ2hCLDZDQUFJQTtRQUFFQyxvREFBV0E7S0FBQztJQUMzQmdCLEtBQUs7SUFDTEMsWUFBWTtRQUNWLENBQUNsQiw2Q0FBSUEsQ0FBQ21CLEVBQUUsQ0FBQyxFQUFFakIsMENBQUlBLENBQUM7UUFDaEIsQ0FBQ0Qsb0RBQVdBLENBQUNrQixFQUFFLENBQUMsRUFBRWpCLDBDQUFJQSxDQUFDLDRCQUE0QixjQUFjO0lBQ25FO0FBQ0Y7QUFFQSxTQUFTa0IsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRTtJQUNyQyxxQkFDRSw4REFBQ3ZCLGdEQUFhQTtRQUFDZSxRQUFRQTtrQkFDckIsNEVBQUNWLHNFQUFtQkE7WUFBQ21CLFFBQVFiO3NCQUM3Qiw0RUFBQ2Isc0VBQWtCQTtnQkFDZjJCLGNBQWNsQixZQUFZTiw2Q0FBSUEsR0FBR0Msb0RBQVdBO2dCQUM1Q3dCLFFBQVE7Z0JBQ1JDLHdCQUF3QjtnQkFDeEJDLFNBQVM7b0JBQ1BaLFNBQVM7Z0JBQ1g7MEJBRUEsNEVBQUNNO29CQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtsQztBQUVBLGlFQUFlRixLQUFLQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcHV6emxlLW5mdC1hcHAvLi9wYWdlcy9fYXBwLmpzP2UwYWQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmFpbmJvd0tpdFByb3ZpZGVyLCBnZXREZWZhdWx0Q29uZmlnIH0gZnJvbSAnQHJhaW5ib3ctbWUvcmFpbmJvd2tpdCc7XG5pbXBvcnQgeyBXYWdtaVByb3ZpZGVyIH0gZnJvbSAnd2FnbWknO1xuaW1wb3J0IHsgYmFzZSwgYmFzZVNlcG9saWEgfSBmcm9tICd2aWVtL2NoYWlucyc7XG5pbXBvcnQgeyBodHRwIH0gZnJvbSAndmllbSc7XG5pbXBvcnQgeyBRdWVyeUNsaWVudCwgUXVlcnlDbGllbnRQcm92aWRlciB9IGZyb20gJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSc7XG5pbXBvcnQgJ0ByYWluYm93LW1lL3JhaW5ib3draXQvc3R5bGVzLmNzcyc7XG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XG5cbi8vIFdhbGxldENvbm5lY3QgQ2xvdWQgUHJvamVjdCBJRFxuY29uc3QgcHJvamVjdElkID0gJzFkZDkxMzVlNDVjZjQzNjJhZmIxM2VmYTAwYWUzMTQ4JztcbmNvbnN0IGlzTWFpbm5ldCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX05FVFdPUksgPT09ICdtYWlubmV0JztcblxuY29uc3QgcXVlcnlDbGllbnQgPSBuZXcgUXVlcnlDbGllbnQoe1xuICBkZWZhdWx0T3B0aW9uczoge1xuICAgIHF1ZXJpZXM6IHtcbiAgICAgIHJlZmV0Y2hPbldpbmRvd0ZvY3VzOiBmYWxzZSxcbiAgICB9LFxuICB9LFxufSk7XG5cblxuY29uc3QgY29uZmlnID0gZ2V0RGVmYXVsdENvbmZpZyh7XG4gIGFwcE5hbWU6ICdDcnlwdG8gUHV6emxlcyBBcHAnLFxuICBwcm9qZWN0SWQ6IHByb2plY3RJZCxcbiAgY2hhaW5zOiBbYmFzZSwgYmFzZVNlcG9saWFdLCAvLyBCb3RoIGNoYWluc1xuICBzc3I6IHRydWUsXG4gIHRyYW5zcG9ydHM6IHtcbiAgICBbYmFzZS5pZF06IGh0dHAoJ2h0dHBzOi8vbWFpbm5ldC5iYXNlLm9yZycpLCAvLyBNYWlubmV0IFJQQ1xuICAgIFtiYXNlU2Vwb2xpYS5pZF06IGh0dHAoJ2h0dHBzOi8vc2Vwb2xpYS5iYXNlLm9yZycpIC8vIFRlc3RuZXQgUlBDXG4gIH0sXG59KTtcblxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9KSB7XG4gIHJldHVybiAoXG4gICAgPFdhZ21pUHJvdmlkZXIgY29uZmlnPXtjb25maWd9PlxuICAgICAgPFF1ZXJ5Q2xpZW50UHJvdmlkZXIgY2xpZW50PXtxdWVyeUNsaWVudH0+XG4gICAgICA8UmFpbmJvd0tpdFByb3ZpZGVyIFxuICAgICAgICAgIGluaXRpYWxDaGFpbj17aXNNYWlubmV0ID8gYmFzZSA6IGJhc2VTZXBvbGlhfSAvLyBEZWZhdWx0IHRvIHRlc3RuZXRcbiAgICAgICAgICBjb29sTW9kZVxuICAgICAgICAgIHNob3dSZWNlbnRUcmFuc2FjdGlvbnM9e3RydWV9XG4gICAgICAgICAgYXBwSW5mbz17e1xuICAgICAgICAgICAgYXBwTmFtZTogJ1B1enpsZSBORlQgR2VuZXJhdG9yJyxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgICAgICA8L1JhaW5ib3dLaXRQcm92aWRlcj5cbiAgICAgIDwvUXVlcnlDbGllbnRQcm92aWRlcj5cbiAgICA8L1dhZ21pUHJvdmlkZXI+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IE15QXBwOyJdLCJuYW1lcyI6WyJSYWluYm93S2l0UHJvdmlkZXIiLCJnZXREZWZhdWx0Q29uZmlnIiwiV2FnbWlQcm92aWRlciIsImJhc2UiLCJiYXNlU2Vwb2xpYSIsImh0dHAiLCJRdWVyeUNsaWVudCIsIlF1ZXJ5Q2xpZW50UHJvdmlkZXIiLCJwcm9qZWN0SWQiLCJpc01haW5uZXQiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfTkVUV09SSyIsInF1ZXJ5Q2xpZW50IiwiZGVmYXVsdE9wdGlvbnMiLCJxdWVyaWVzIiwicmVmZXRjaE9uV2luZG93Rm9jdXMiLCJjb25maWciLCJhcHBOYW1lIiwiY2hhaW5zIiwic3NyIiwidHJhbnNwb3J0cyIsImlkIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJjbGllbnQiLCJpbml0aWFsQ2hhaW4iLCJjb29sTW9kZSIsInNob3dSZWNlbnRUcmFuc2FjdGlvbnMiLCJhcHBJbmZvIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "@rainbow-me/rainbowkit":
/*!*****************************************!*\
  !*** external "@rainbow-me/rainbowkit" ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@rainbow-me/rainbowkit");;

/***/ }),

/***/ "@tanstack/react-query":
/*!****************************************!*\
  !*** external "@tanstack/react-query" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@tanstack/react-query");;

/***/ }),

/***/ "viem":
/*!***********************!*\
  !*** external "viem" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = import("viem");;

/***/ }),

/***/ "viem/chains":
/*!******************************!*\
  !*** external "viem/chains" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = import("viem/chains");;

/***/ }),

/***/ "wagmi":
/*!************************!*\
  !*** external "wagmi" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = import("wagmi");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@rainbow-me"], () => (__webpack_exec__("./pages/_app.js")));
module.exports = __webpack_exports__;

})();