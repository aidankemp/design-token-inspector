import type { ReactNode } from "react";
import type { Variable } from "../../types/variables";
import { Typography } from "antd";
import { variableToFormInput } from "./variableToFormInput";

const { Text } = Typography;

export const transformVariableToReact = (
  variable: Variable,
  editable: boolean = false
): ReactNode => {
  return (
    <div>
      {variable.formattedName ?? variable.name}: <code>{variable.value}</code>{" "}
      (used in{" "}
      <Text strong>
        {editable ? variableToFormInput(variable) : variable.property}
      </Text>
      )
      <br />
    </div>
  );
};
