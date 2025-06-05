import type { CssRuleWithVariableNames } from "../../types/css";
import type { Variable } from "../../types/variables";
import { getCSSVariableValue } from "./getCssVariableValue";

/**
 * Transforms a hydrated CSS rule into an array of CSS variables.
 *
 * @param rule A CSS rule that contains variable names and selectors.
 * @param element The element which the CSS rule applies to.
 * @returns Variable[]
 */
export const transformCssRuleIntoVariables = (
  rule: CssRuleWithVariableNames,
  element: Element
) => {
  const variableArray: Variable[] = [];

  for (const variable of rule.variables) {
    for (const selector of rule.selectors) {
      if (element.matches(selector) || element.closest(selector)) {
        const value = getCSSVariableValue(variable.variableName, selector);
        variableArray.push({
          name: variable.variableName,
          value,
          property: variable.property,
          selector: { text: selector, index: rule.indexInStylesheet },
        });
      }
    }
  }

  return variableArray;
};
