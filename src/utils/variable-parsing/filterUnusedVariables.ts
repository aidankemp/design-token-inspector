import _ from "lodash";
import type { Variable } from "../../types/variables";
import { getCSSSpecificity } from "../css-parsing/getCSSSpecificity";

export const filterUnusedVariables = (
  variables: Variable[],
  el: Element
): Variable[] => {
  const filteredVariables: Variable[] = [];
  const computedStyle = getComputedStyle(el);

  // Group variables by property
  const variablesByProperty = _.groupBy(variables, "property");
  for (const [property, propertyVariablesOriginal] of Object.entries(
    variablesByProperty
  )) {
    let propertyVariables = propertyVariablesOriginal;

    // Since there may be variables that are used to set the value of other variables,
    // ignore variables that are not used directly in the element.
    if (property.startsWith("--")) {
      continue;
    }

    // Additionally, try and ignore properties that are not actually used for the element styling.
    // Note: This is a workaround for the fact that computedStyle returns computed values for all properties,
    // but variables can use a variety of units to set the value of a property.
    if (computedStyle.getPropertyValue(property) == "") {
      continue;
    }

    // Furthermore, filter out variables that are used in pseduo-classes. We'll figure out a way to handle these later.
    propertyVariables = propertyVariables.filter((v) => {
      return !v.selector.text.includes(":");
    });
    if (propertyVariables.length === 0) {
      continue;
    }

    // Since there may be multiple variables with the same property,
    // compare the specificity of the selectors to determine which variable to use
    const temp = propertyVariables.map((v) => ({
      ...v,
      specificity: getCSSSpecificity(v.selector.text),
    }));

    const mostSpecificVariables = temp.sort(function (a, b) {
      return a.specificity - b.specificity === 0
        ? b.selector.index - a.selector.index
        : b.specificity - a.specificity;
    });

    const mostSpecificVariable = mostSpecificVariables.map((v) =>
      _.omit(v, "specificity")
    )[0];

    filteredVariables.push(mostSpecificVariable);
  }

  return filteredVariables;
};
