import type { Variable } from "../../types/variables";
import { getCssUsedByElement } from "../css-parsing/getCssUsedByElement";
import { findVariablesInCssRule } from "../css-parsing/findVariablesInCssRule";
import { transformCssRuleIntoVariables } from "../css-parsing/transformCssRuleIntoVariables";
import { filterUnusedVariables } from "./filterUnusedVariables";
import { removeDuplicateVariables } from "./removeDuplicateVariables";

export const variablesUsedByElement = (el: Element): Variable[] => {
  // Get all the CSS that applies to the element
  const rules = getCssUsedByElement(el);

  // For each CSS rule, find the names of all the variables within it
  const variablesInRules = rules
    .map(findVariablesInCssRule)
    .filter((x) => x !== null)
    .flat();

  // If there are no variables found in the CSS rules, return an empty array
  if (variablesInRules.length <= 0) {
    return [];
  }

  // Pull out all the variables and their values from the found CSS rules.
  // Note: We also want to determine which selector was used to apply the variable to the given element,
  // so that we can later determine the specificity of the variable.
  const variableMap = variablesInRules.flatMap((rule) =>
    transformCssRuleIntoVariables(rule, el)
  );

  // Remove unused and duplicate variables
  const filteredVariables = filterUnusedVariables(variableMap, el);

  const uniqueVariables = removeDuplicateVariables(filteredVariables);

  return uniqueVariables;
};
