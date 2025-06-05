export const getCSSVariableValue = (variable: string, selector: string) => {
  const el = document.querySelector(selector);
  if (!el) return "";
  return getComputedStyle(el).getPropertyValue(variable);
};
