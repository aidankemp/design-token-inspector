export const applyParsedSDToDocument = async (parsedOutput: string) => {
  // Apply the CSS string to the document
  const styleElement = document.createElement("style");
  styleElement.textContent = parsedOutput;
  document.head.appendChild(styleElement);
};
