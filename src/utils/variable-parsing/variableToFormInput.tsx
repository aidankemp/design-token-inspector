import type { ReactNode } from "react";
import { ColorPicker, Form, Input, InputNumber } from "antd";
import type { Variable } from "../../types/variables";
import { IntegerStep } from "../../components/TokenDetails/IntegerStep";

const formItemWrapper = (
  formInput: ReactNode,
  variableName: string,
  initialValue: string | number
) => (
  <Form.Item name={variableName} initialValue={initialValue} noStyle>
    {formInput}
  </Form.Item>
);

export const variableToFormInput = (
  variable: Variable,
  onChange: (name: string, value: string) => void
): ReactNode => {
  const { value } = variable;

  let formInput: ReactNode | null = null;

  // Determine the type of input based on the value
  if (typeof value === "string") {
    if (value.startsWith("#") || value.startsWith("rgb")) {
      formInput = <ColorPicker showText size="small" />;
    } else if (
      !isNaN(parseFloat(value)) ||
      value.endsWith("px") ||
      value.endsWith("em") ||
      value.endsWith("rem") ||
      value.endsWith("vh") ||
      value.endsWith("vw")
    ) {
      // For values with units like px, em, rem, etc.
      return (
        <IntegerStep
          defaultValue={value}
          name={variable.name}
          onChange={onChange}
        />
      );
    } else {
      formInput = <Input defaultValue={value} />;
    }
  } else if (typeof value === "number") {
    formInput = <InputNumber />;
  }

  return formItemWrapper(formInput, variable.name, value);
};
