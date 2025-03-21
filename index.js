"use strict";

(function () {
  window.translateSFC = function (source, convertTS = true, tsCompilerOptions ) {
    const scriptData = extract(source, "script");
    const template = extract(source, "template").content;
    const script = scriptData.content;

    let result;

    if (isCompositionApi(scriptData.attrs)) {
      result = getCompositionApiSFC(source, template, convertTS, tsCompilerOptions);
    } else {

      const pattern = "export default {\\s*(name ?:|extends ?:|watch ?:|methods ?:|props ?:|model ?:|computed ?:|components ?:|mixins ?:|filters ?:|(data|render) ?[:(](.*){)";
      const match = script.match(new RegExp(pattern, "im"));
      const componentRegistration = script.substr(match.index, script.length);
      const propertyName = match[1];
      const propertyIndex = componentRegistration.indexOf(propertyName);
      const content = setTemplate(componentRegistration, propertyIndex, template);

      result = script.substr(0, match.index) + content;
    }

    appendStyle(parseStyle(source));
    return result;
  };

  function isCompositionApi(attrs) {
    return attrs.trim().split(' ').includes('setup')
  }

  function setTemplate(content, propertyIndex, template) {
    return content.substr(0, propertyIndex) + "template:  `" + template + "`," + content.substr(propertyIndex);
  }

  function extract(text, tag) {
    var firstTagSymbols = "<" + tag;
    var start = text.indexOf(firstTagSymbols);
    var contentStart = findTagEnd(text, start);
    var contentEnd = text.lastIndexOf("</" + tag + ">");

    return {
      content: start !== -1 ? text.substring(contentStart, contentEnd) : null,
      attrs: text.substring(start + firstTagSymbols.length, contentStart - 1)
    }
  }

  function findTagEnd(text, start) {
    var i = start;
    while (i < text.length && text[i++] !== ">") {}
    return i;
  }

  function parseStyle(text) {
    var styleInfo = extract(text, "style");
    if (styleInfo.content) {
      styleInfo.content = styleInfo.content.replace(/[\n\r]+/g, "").replace(/ {2,20}/g, " ");
    }
    return styleInfo;
  }

  function appendStyle(styleInfo) {
    if (typeof document === "undefined") return;

    var css = styleInfo.content;
    var src = findSrc(styleInfo.attrs);

    if (!css && !src) return;

    var style = document.createElement(src ? "link" : "style");

    style.type = "text/css";

    if(src) {
      style.setAttribute("href", src);
      style.setAttribute("rel", "stylesheet");
    } else {
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var head = document.head || document.querySelector("head") || document.getElementsByTagName("head")[0];

    head.appendChild(style);
  }

  function findSrc(attrs) {
    if (!attrs) return "";
    var result = attrs.match(/src="(.*)"/i);

    return result ? result[1] : "";
  }

  function getComponentsList(imports) {
    if(!imports) {
      return [];
    }

    const dxComponents = Object.keys(imports).filter((cmp) => (cmp.startsWith('Dx') && !imports[cmp].isType));
    const appComponents = Object.keys(imports).filter((key) => imports[key].source.endsWith('.vue'));
    return [...dxComponents, ...appComponents];
  }

  function getCompositionApiSFC(source, template, convertTS = true, tsCompilerOptions) {
    const { vueCompilerSFC } = window;
    const { ts } = window;

    if(!vueCompilerSFC) {
      throw "Composition API is detected, but window.vueCompilerSFC is not defined!\nDefine window.vueCompilerSFC as result of import from @vue/compiler-sfc";
    }
    if(convertTS && !ts) {
      throw "TypeScript is required, but window.ts is not defined!\nInclude typescript.js to page";
    }

    const compiledScript = vueCompilerSFC.compileScript(vueCompilerSFC.parse(source).descriptor, {id: 'demo-'});
    const compiledTemplate = vueCompilerSFC.compileTemplate({source: template ,id: 'demo-'});
    const templateImports = compiledTemplate.code.replace(/export function.*/s, '');
    const templateRenderFn = compiledTemplate.code.replace(/^.*export function\s*/s, '');

    const componentsList = getComponentsList(compiledScript.imports);

    const compiledScriptContent = templateImports.trim()
        + '\n'
        + compiledScript.content
            .replace(
                /defineComponent\(\{/,
                `defineComponent({\n
        components: {
              ${componentsList.join(',\n').trim()}
         },
        ${templateRenderFn},
    `).replace(/return __returned__/, 'return {...__returned__};');

    return !convertTS
        ? compiledScriptContent
        : ts.transpileModule(
            compiledScriptContent,
            tsCompilerOptions || {
              target: ts.ScriptTarget.ES5,
              module: ts.ModuleKind.None
            }).outputText;
  }
})();

if (typeof exports !== 'undefined') {
  exports.translate = function () {
    return function (load) {
      return load.source = translateSFC(load.source);
    };
  }();
}
