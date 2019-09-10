# dx-systemjs-vue-browser
SystemJS plugin to load .vue single file components

```js
/* global System */

System.config({
  transpiler: "plugin-babel",
  paths: {
    "npm:": "https://unpkg.com/"
  },
  map: {
    vue: "npm:vue@2.5.16/dist/vue.esm.browser.js",

    "vue-loader": "npm:dx-systemjs-vue-browser@1.0.5/index.js",

    "plugin-babel": "npm:systemjs-plugin-babel@0/plugin-babel.js",
    "systemjs-babel-build":
      "npm:systemjs-plugin-babel@0/systemjs-babel-browser.js"
  },
  meta: {
    "*.vue": { loader: "vue-loader" }
  }
});

```
