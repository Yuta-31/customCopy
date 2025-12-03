export const create_reference_for_mail = (title: string, url: string, selectionText: string) => {
  return `
<参考情報>
Title: ${title}
URL: ${url}
該当部分:
${selectionText}  
---
`;
};

export const create_reference_for_markdown = (title: string, url: string, selectionText: string) => {
  return `
[${title}](${url})
> ${selectionText}
`;
};
