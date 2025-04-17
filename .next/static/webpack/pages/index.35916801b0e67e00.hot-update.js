"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/index",{

/***/ "(pages-dir-browser)/./components/FivePillars.tsx":
/*!************************************!*\
  !*** ./components/FivePillars.tsx ***!
  \************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FivePillars)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(pages-dir-browser)/./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var framer_motion__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! framer-motion */ \"(pages-dir-browser)/./node_modules/framer-motion/dist/es/index.mjs\");\n/* harmony import */ var _Tooltip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Tooltip */ \"(pages-dir-browser)/./components/Tooltip.tsx\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \n\n\nconst signals = [\n    {\n        title: 'Impact Severity',\n        description: 'How consequential the event is if it occurs.',\n        tooltip: 'Score = Base (by topic tag) + Scope Modifier + Phrasing Boost. Range: 0.3 – 1.0'\n    },\n    {\n        title: 'Time Horizon',\n        description: 'How soon the event will resolve.aaaaaaaaaaa',\n        tooltip: 'Score based on time to expiry: <30d = 1.0, >1y = 0.2. Shorter = more tension.'\n    },\n    {\n        title: 'Volatility',\n        description: 'How much the market’s belief has fluctuated recently.',\n        tooltip: 'Score from 0.5 – 1.0 using std deviation over 48–72h. More swing = higher signal.'\n    },\n    {\n        title: 'Liquidity',\n        description: 'How much money or forecasting activity is in the market.',\n        tooltip: 'Percentile rank of YES+NO shares across all markets. Top 10% = 1.0. Bottom 50% = 0.5.'\n    },\n    {\n        title: 'Platform Diversity',\n        description: 'Whether this market is mirrored across platforms.',\n        tooltip: 'Multiplier: 1.0 (1 platform), 1.1 (2), 1.2 (3+). Reflects cross-community consensus.'\n    }\n];\nfunction FivePillars() {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"section\", {\n        className: \"bg-bg text-faded px-4 py-24\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch\",\n            children: signals.map((signal, i)=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(framer_motion__WEBPACK_IMPORTED_MODULE_2__.motion.div, {\n                    className: \"flex\",\n                    initial: {\n                        opacity: 0,\n                        y: 20\n                    },\n                    whileInView: {\n                        opacity: 1,\n                        y: 0\n                    },\n                    viewport: {\n                        once: true\n                    },\n                    transition: {\n                        delay: i * 0.05,\n                        duration: 0.4\n                    },\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_Tooltip__WEBPACK_IMPORTED_MODULE_1__[\"default\"], {\n                        content: signal.tooltip,\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"flex flex-col justify-center h-full min-h-[140px] border border-highlight bg-gray-950 rounded-xl p-4 text-center hover:shadow-[0_0_10px_#00ff99] transition-all cursor-help\",\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h3\", {\n                                    className: \"text-neon text-sm font-bold mb-1\",\n                                    children: signal.title\n                                }, void 0, false, {\n                                    fileName: \"/Users/galinaglis/Downloads/rvi-site/components/FivePillars.tsx\",\n                                    lineNumber: 53,\n                                    columnNumber: 17\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                                    className: \"text-xs text-gray-400 font-mono\",\n                                    children: signal.description\n                                }, void 0, false, {\n                                    fileName: \"/Users/galinaglis/Downloads/rvi-site/components/FivePillars.tsx\",\n                                    lineNumber: 56,\n                                    columnNumber: 17\n                                }, this)\n                            ]\n                        }, void 0, true, {\n                            fileName: \"/Users/galinaglis/Downloads/rvi-site/components/FivePillars.tsx\",\n                            lineNumber: 52,\n                            columnNumber: 15\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"/Users/galinaglis/Downloads/rvi-site/components/FivePillars.tsx\",\n                        lineNumber: 51,\n                        columnNumber: 13\n                    }, this)\n                }, signal.title, false, {\n                    fileName: \"/Users/galinaglis/Downloads/rvi-site/components/FivePillars.tsx\",\n                    lineNumber: 43,\n                    columnNumber: 11\n                }, this))\n        }, void 0, false, {\n            fileName: \"/Users/galinaglis/Downloads/rvi-site/components/FivePillars.tsx\",\n            lineNumber: 41,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/galinaglis/Downloads/rvi-site/components/FivePillars.tsx\",\n        lineNumber: 40,\n        columnNumber: 5\n    }, this);\n}\n_c = FivePillars;\nvar _c;\n$RefreshReg$(_c, \"FivePillars\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1icm93c2VyKS8uL2NvbXBvbmVudHMvRml2ZVBpbGxhcnMudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNzQztBQUNQO0FBRS9CLE1BQU1FLFVBQVU7SUFDZDtRQUNFQyxPQUFPO1FBQ1BDLGFBQWE7UUFDYkMsU0FDRTtJQUNKO0lBQ0E7UUFDRUYsT0FBTztRQUNQQyxhQUFhO1FBQ2JDLFNBQ0U7SUFDSjtJQUNBO1FBQ0VGLE9BQU87UUFDUEMsYUFBYTtRQUNiQyxTQUNFO0lBQ0o7SUFDQTtRQUNFRixPQUFPO1FBQ1BDLGFBQWE7UUFDYkMsU0FDRTtJQUNKO0lBQ0E7UUFDRUYsT0FBTztRQUNQQyxhQUFhO1FBQ2JDLFNBQ0U7SUFDSjtDQUNEO0FBRWMsU0FBU0M7SUFDdEIscUJBQ0UsOERBQUNDO1FBQVFDLFdBQVU7a0JBQ2pCLDRFQUFDQztZQUFJRCxXQUFVO3NCQUNaTixRQUFRUSxHQUFHLENBQUMsQ0FBQ0MsUUFBUUMsa0JBQ3BCLDhEQUFDWixpREFBTUEsQ0FBQ1MsR0FBRztvQkFFVEQsV0FBVTtvQkFDVkssU0FBUzt3QkFBRUMsU0FBUzt3QkFBR0MsR0FBRztvQkFBRztvQkFDN0JDLGFBQWE7d0JBQUVGLFNBQVM7d0JBQUdDLEdBQUc7b0JBQUU7b0JBQ2hDRSxVQUFVO3dCQUFFQyxNQUFNO29CQUFLO29CQUN2QkMsWUFBWTt3QkFBRUMsT0FBT1IsSUFBSTt3QkFBTVMsVUFBVTtvQkFBSTs4QkFFN0MsNEVBQUNwQixnREFBT0E7d0JBQUNxQixTQUFTWCxPQUFPTixPQUFPO2tDQUM5Qiw0RUFBQ0k7NEJBQUlELFdBQVU7OzhDQUNiLDhEQUFDZTtvQ0FBR2YsV0FBVTs4Q0FDWEcsT0FBT1IsS0FBSzs7Ozs7OzhDQUVmLDhEQUFDcUI7b0NBQUVoQixXQUFVOzhDQUNWRyxPQUFPUCxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7OzttQkFicEJPLE9BQU9SLEtBQUs7Ozs7Ozs7Ozs7Ozs7OztBQXNCN0I7S0E1QndCRyIsInNvdXJjZXMiOlsiL1VzZXJzL2dhbGluYWdsaXMvRG93bmxvYWRzL3J2aS1zaXRlL2NvbXBvbmVudHMvRml2ZVBpbGxhcnMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuaW1wb3J0IHsgbW90aW9uIH0gZnJvbSAnZnJhbWVyLW1vdGlvbidcbmltcG9ydCBUb29sdGlwIGZyb20gJy4vVG9vbHRpcCdcblxuY29uc3Qgc2lnbmFscyA9IFtcbiAge1xuICAgIHRpdGxlOiAnSW1wYWN0IFNldmVyaXR5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0hvdyBjb25zZXF1ZW50aWFsIHRoZSBldmVudCBpcyBpZiBpdCBvY2N1cnMuJyxcbiAgICB0b29sdGlwOlxuICAgICAgJ1Njb3JlID0gQmFzZSAoYnkgdG9waWMgdGFnKSArIFNjb3BlIE1vZGlmaWVyICsgUGhyYXNpbmcgQm9vc3QuIFJhbmdlOiAwLjMg4oCTIDEuMCdcbiAgfSxcbiAge1xuICAgIHRpdGxlOiAnVGltZSBIb3Jpem9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ0hvdyBzb29uIHRoZSBldmVudCB3aWxsIHJlc29sdmUuYWFhYWFhYWFhYWEnLFxuICAgIHRvb2x0aXA6XG4gICAgICAnU2NvcmUgYmFzZWQgb24gdGltZSB0byBleHBpcnk6IDwzMGQgPSAxLjAsID4xeSA9IDAuMi4gU2hvcnRlciA9IG1vcmUgdGVuc2lvbi4nXG4gIH0sXG4gIHtcbiAgICB0aXRsZTogJ1ZvbGF0aWxpdHknLFxuICAgIGRlc2NyaXB0aW9uOiAnSG93IG11Y2ggdGhlIG1hcmtldOKAmXMgYmVsaWVmIGhhcyBmbHVjdHVhdGVkIHJlY2VudGx5LicsXG4gICAgdG9vbHRpcDpcbiAgICAgICdTY29yZSBmcm9tIDAuNSDigJMgMS4wIHVzaW5nIHN0ZCBkZXZpYXRpb24gb3ZlciA0OOKAkzcyaC4gTW9yZSBzd2luZyA9IGhpZ2hlciBzaWduYWwuJ1xuICB9LFxuICB7XG4gICAgdGl0bGU6ICdMaXF1aWRpdHknLFxuICAgIGRlc2NyaXB0aW9uOiAnSG93IG11Y2ggbW9uZXkgb3IgZm9yZWNhc3RpbmcgYWN0aXZpdHkgaXMgaW4gdGhlIG1hcmtldC4nLFxuICAgIHRvb2x0aXA6XG4gICAgICAnUGVyY2VudGlsZSByYW5rIG9mIFlFUytOTyBzaGFyZXMgYWNyb3NzIGFsbCBtYXJrZXRzLiBUb3AgMTAlID0gMS4wLiBCb3R0b20gNTAlID0gMC41LidcbiAgfSxcbiAge1xuICAgIHRpdGxlOiAnUGxhdGZvcm0gRGl2ZXJzaXR5JyxcbiAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhpcyBtYXJrZXQgaXMgbWlycm9yZWQgYWNyb3NzIHBsYXRmb3Jtcy4nLFxuICAgIHRvb2x0aXA6XG4gICAgICAnTXVsdGlwbGllcjogMS4wICgxIHBsYXRmb3JtKSwgMS4xICgyKSwgMS4yICgzKykuIFJlZmxlY3RzIGNyb3NzLWNvbW11bml0eSBjb25zZW5zdXMuJ1xuICB9XG5dXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZpdmVQaWxsYXJzKCkge1xuICByZXR1cm4gKFxuICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImJnLWJnIHRleHQtZmFkZWQgcHgtNCBweS0yNFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIHNtOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy01IGdhcC00IGl0ZW1zLXN0cmV0Y2hcIj5cbiAgICAgICAge3NpZ25hbHMubWFwKChzaWduYWwsIGkpID0+IChcbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAga2V5PXtzaWduYWwudGl0bGV9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4XCJcbiAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMjAgfX1cbiAgICAgICAgICAgIHdoaWxlSW5WaWV3PXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgIHZpZXdwb3J0PXt7IG9uY2U6IHRydWUgfX1cbiAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IGkgKiAwLjA1LCBkdXJhdGlvbjogMC40IH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2x0aXAgY29udGVudD17c2lnbmFsLnRvb2x0aXB9PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wganVzdGlmeS1jZW50ZXIgaC1mdWxsIG1pbi1oLVsxNDBweF0gYm9yZGVyIGJvcmRlci1oaWdobGlnaHQgYmctZ3JheS05NTAgcm91bmRlZC14bCBwLTQgdGV4dC1jZW50ZXIgaG92ZXI6c2hhZG93LVswXzBfMTBweF8jMDBmZjk5XSB0cmFuc2l0aW9uLWFsbCBjdXJzb3ItaGVscFwiPlxuICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LW5lb24gdGV4dC1zbSBmb250LWJvbGQgbWItMVwiPlxuICAgICAgICAgICAgICAgICAge3NpZ25hbC50aXRsZX1cbiAgICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1ncmF5LTQwMCBmb250LW1vbm9cIj5cbiAgICAgICAgICAgICAgICAgIHtzaWduYWwuZGVzY3JpcHRpb259XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvVG9vbHRpcD5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG4gICAgPC9zZWN0aW9uPlxuICApXG59XG4iXSwibmFtZXMiOlsibW90aW9uIiwiVG9vbHRpcCIsInNpZ25hbHMiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwidG9vbHRpcCIsIkZpdmVQaWxsYXJzIiwic2VjdGlvbiIsImNsYXNzTmFtZSIsImRpdiIsIm1hcCIsInNpZ25hbCIsImkiLCJpbml0aWFsIiwib3BhY2l0eSIsInkiLCJ3aGlsZUluVmlldyIsInZpZXdwb3J0Iiwib25jZSIsInRyYW5zaXRpb24iLCJkZWxheSIsImR1cmF0aW9uIiwiY29udGVudCIsImgzIiwicCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-browser)/./components/FivePillars.tsx\n"));

/***/ })

});