const create_reference_for_mail = (title, url, selectionText) => {
  return `
<参考情報>
Title: ${title}
URL: ${url}
該当部分:
${selectionText}  
---
`;
};

const create_reference_for_markdown = (title, url, selectionText) => {
  return `
[${title}](${url})
> ${selectionText}
`;
};
