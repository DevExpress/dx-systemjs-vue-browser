require("./index.js");

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
    const result = `
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
    expect(translateSFC(componentSource)).toBe(result);
});

it("process template without styles", () => {
    const result = `
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
    expect(translateSFC(template)).toBe(result);
});

it("process styles", () => {
    translateSFC(componentSource)
    expect(document.head.children[0].outerHTML).toEqual('<style type="text/css">.my-class { color: red;}</style>');
});

it("process with standalone styles", () => {
    const componentWithStandaloneStyles = `${template}
    <style scoped anothershit src="./styles.css"></style>`;

    translateSFC(componentWithStandaloneStyles)
    expect(document.head.children[0].outerHTML).toEqual('<link type="text/css" href="./styles.css" rel="stylesheet">');
});


it("process with additional properties", () => {
  const result = `
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
  expect(translateSFC(templateWithAdditionalProperties)).toBe(result);
});
