require("./index.js");
ts = require("typescript");
vueCompilerSFC = require("@vue/compiler-sfc");

const template = `
<template>
    <div class="my-class">
        <template>
            Content and { text }
        </template>
    </div>
</template>
<script>
let someObj = { name: {} };
export default {
  data() {
    return {
      text: "my-text",
    };
  }
};
</script>`;

const templateWithAdditionalProperties = `
<template>
    <div class="my-class">
    </div>
</template>
<script>
export default {
  filters: {
    custom: []
  },
  data() {
    return {
      text: "my-text",
    };
  }
};
</script>`;

const compositionApi = `
<template>
    <div class="my-class">
        <template>
            Content and { text }
        </template>
    </div>
</template>
<script setup>
 const text = ref('my-text');
</script>`;

const compositionApiWithImports = `
<template>
    <div class="my-class">
        <DxSomeComponent/>
    </div>
</template>
<script setup lang="ts">
 import { DxSomeComponent, type DxSomeType } from 'devextreme-vue/component';
 import type { DxSomeType2, DxSomeType3 } from 'devextreme-vue/component';

</script>`;

const componentSource = `${template}
<style>
.my-class {
    color: red;
}
</style>`;

beforeEach(() => {
    document.head.textContent = "";
});


it("process template", () => {
    const etalon = `
let someObj = { name: {} };
export default {
  template:  \`
    <div class=\"my-class\">
        <template>
            Content and { text }
        </template>
    </div>
\`,data() {
    return {
      text: \"my-text\",
    };
  }
};
`;
    const result = translateSFC(componentSource);
    expect(result).toBe(etalon);
});
it("process template without styles", () => {
    const etalon = `
let someObj = { name: {} };
export default {
  template:  \`
    <div class=\"my-class\">
        <template>
            Content and { text }
        </template>
    </div>
\`,data() {
    return {
      text: \"my-text\",
    };
  }
};
`;
    const result = translateSFC(template);

    expect(result).toBe(etalon);
});

it("process styles", () => {
    translateSFC(componentSource)
    expect(document.head.children[0].outerHTML).toEqual('<style type="text/css">.my-class { color: red;}</style>');
});

it("process with standalone styles", () => {
    const componentWithStandaloneStyles = `${template}
    <style scoped anothershit src="./styles.css"></style>`;

    translateSFC(componentWithStandaloneStyles);
    expect(document.head.children[0].outerHTML).toEqual('<link type="text/css" href="./styles.css" rel="stylesheet">');
});

it("process with addition properties", () => {
    const etalon = `
export default {
  template:  \`
    <div class=\"my-class\">
    </div>
\`,filters: {
    custom: []
  },
  data() {
    return {
      text: \"my-text\",
    };
  }
};
`;
    expect(translateSFC(templateWithAdditionalProperties)).toBe(etalon);
});

it("process composition API", () => {
    const etalon = `"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var _hoisted_1 = { class: "my-class" };
var _hoisted_2 = /*#__PURE__*/ (0, vue_1.createElementVNode)("template", null, [
    /*#__PURE__*/ (0, vue_1.createTextVNode)(" Content and { text } ")
], -1 /* HOISTED */);
var _hoisted_3 = [
    _hoisted_2
];
exports.default = {
    setup: function (__props, _a) {
        var __expose = _a.expose;
        __expose();
        var text = ref('my-text');
        var __returned__ = { text: text };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __assign({}, __returned__);
    }
};
`;

    const result = translateSFC(compositionApi);

    expect(etalon).toBe(result);
});

it("process composition API without TS converting", () => {
    const etalon = `import { createTextVNode as _createTextVNode, createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

const _hoisted_1 = { class: "my-class" }
const _hoisted_2 = /*#__PURE__*/_createElementVNode("template", null, [
  /*#__PURE__*/_createTextVNode(" Content and { text } ")
], -1 /* HOISTED */)
const _hoisted_3 = [
  _hoisted_2
]

export default {
  setup(__props, { expose: __expose }) {
  __expose();

 const text = ref('my-text');

const __returned__ = { text }
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
return {...__returned__};
}

}`;

    const result = translateSFC(compositionApi, false);

    expect(etalon).toBe(result);
})

it("type imports are not inserted as components in TS composition API", () => {
    const result = translateSFC(compositionApiWithImports);

    expect(result.includes('DxSomeType')).toBeFalsy();
    expect(result.includes('DxSomeComponent')).toBeTruthy();
});
