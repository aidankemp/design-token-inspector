import type {
  CssRuleWithVariableNames,
  RawCssRuleWithIndex,
} from "../../types/css";

/**
 * Searches through a raw CSS rule to find all the references to CSS variables within it.
 * Note: Since this is just parsing the raw CSS text, it cannot fetch the actual values of the variables.
 * Instead, it will return the name of the variable and the property it is applied to.
 *
 * @param {RawCssRuleWithIndex} rule - The CSS rule to search through for variables.
 *
 * @returns {CssRuleWithVariableNames | null} The given rule parameter,
 * but with the name and property of any variables within it added in,
 * as well as all the selectors that are used to define this rule,
 * or null if no variables are found.
 */
export const findVariablesInCssRule = ({
  rule,
  indexInStylesheet,
}: RawCssRuleWithIndex): CssRuleWithVariableNames | null => {
  if (!rule.cssText || !rule.cssText.includes("var(")) {
    return null;
  }

  const regex = /([\w-]+)\s*:\s*var\((--[\w-]+)\)/g;
  const matches = [...rule.cssText.matchAll(regex)].map((match) => ({
    property: match[1],
    variableName: match[2],
  }));

  return {
    rule,
    indexInStylesheet,
    variables: matches,
    selectors: rule.selectorText.split(","),
  };
};
