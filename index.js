"use strict";

(function () {

  window.translateSFC = function (source) {
    var script = extract(source, "script").content;
    const pattern = "export default {\\s*(name ?:|extends ?:|watch ?:|methods ?:|props ?:|model ?:|computed ?:|components ?:|mixins ?:|filters ?:|data ?[:(](.*){)";
    var match = script.match(new RegExp(pattern, "im"));
    var componentRegistration = script.substr(match.index, script.length);
    var propertyName = match[1];
    var propertyIndex = componentRegistration.indexOf(propertyName);

    var template = extract(source, "template").content;
    var content = setTemplate(componentRegistration, propertyIndex, template);
    var result = script.substr(0, match.index) + content;

    appendStyle(parseStyle(source));

    return result;
  };

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

})();

if (typeof exports !== 'undefined') {
  exports.translate = function () {
    return function (load) {
      return load.source = translateSFC(load.source);
    };
  }();
}
