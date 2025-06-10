import type { ReactNode } from "react";
import type { Variable } from "../../types/variables";
import { Typography } from "antd";
import { variableToFormInput } from "./variableToFormInput";

const { Text } = Typography;

export const transformVariableToReact = (
  variable: Variable,
  editable: boolean = false,
  onChange?: (name: string, value: string) => void
): ReactNode => {
  const usedIn = (
    <>
      (used in <Text strong>{variable.property}</Text>)
    </>
  );
  return (
    <div>
      {variable.formattedName ?? variable.name}:{" "}
      {editable && onChange ? (
        <>
          {usedIn} <br />
          {variableToFormInput(variable, onChange)}
        </>
      ) : (
        <>
          <code>{variable.value}</code> {usedIn}
        </>
      )}
      <br />
    </div>
  );
};
