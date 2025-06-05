import type { ReactNode } from "react";
import { ColorPicker, Input, InputNumber } from "antd";
import type { Variable } from "../../types/variables";

export const variableToFormInput = (variable: Variable): ReactNode => {
  const { value } = variable;
  if (typeof value === "string") {
    if (value.startsWith("#") || value.startsWith("rgb")) {
      return <ColorPicker defaultValue={value} showText size="small" />;
    } else {
      return <Input defaultValue={value} />;
    }
  } else if (typeof value === "number") {
    return <InputNumber defaultValue={value} />;
  }
};
