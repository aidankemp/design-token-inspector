export const changeVariableValue = (
  variableName: string,
  variableValue: string
) => {
  const root = document.documentElement;
  root.style.setProperty(variableName, variableValue);
};
