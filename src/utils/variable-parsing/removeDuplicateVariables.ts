import _ from "lodash";
import type { Variable } from "../../types/variables";

export const removeDuplicateVariables = (
  variableMap: Variable[]
): Variable[] => {
  const uniqueVariables: Variable[] = [];
  const variableMapByName = _.groupBy(variableMap, "name");
  for (const [name, variables] of Object.entries(variableMapByName)) {
    const mergedVariable = variables.reduce(
      (acc, variable) => {
        acc.value = variable.value;
        acc.property =
          acc.property && acc.property !== variable.property
            ? `${acc.property}, ${variable.property}`
            : variable.property;
        return acc;
      },
      { name, value: "", property: "", selector: { text: "", index: 0 } }
    );
    uniqueVariables.push(mergedVariable);
  }
  return uniqueVariables;
};
