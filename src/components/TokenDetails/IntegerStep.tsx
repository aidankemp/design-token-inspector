import { Col, Form, InputNumber, Row, Slider } from "antd";

export const IntegerStep = ({
  name,
  defaultValue,
  onChange,
}: {
  name: string;
  defaultValue: string;
  onChange: (name: string, value: string) => void;
}) => {
  const form = Form.useFormInstance();
  const inputValue = Form.useWatch(name, { form, preserve: true });

  const parseStringValue = (stringValue: string) => {
    const valueAsInteger = parseFloat(stringValue.replace(/^[^\d.-]+/, "")); // Replace all leading non-digits (except decimal points and dashes) with nothing
    const valueSuffix = stringValue.replace(/^[\d.-]+/, "").trim(); // Replace all leading digits (and decimal points and dashes) with nothing

    return { value: valueAsInteger, suffix: valueSuffix };
  };

  const { value: numberCurrentValue, suffix } = parseStringValue(
    inputValue || defaultValue
  );

  const { value: numberDefaultValue } = parseStringValue(defaultValue);

  const onStepChange = (value: number | null) => {
    if (value === null) return; // Handle null case for InputNumber

    const valueAsString = `${value}${suffix || ""}`;
    if (inputValue !== valueAsString) {
      form.setFieldValue(name, valueAsString);
    }

    if (onChange) {
      onChange(name, valueAsString);
    }
  };

  return (
    <Row>
      <Col span={14}>
        <Slider
          min={numberDefaultValue / 2}
          max={numberDefaultValue * 2}
          step={(numberDefaultValue * 2 - numberDefaultValue / 2) / 100}
          value={numberCurrentValue}
          onChange={onStepChange}
        />
      </Col>
      <Col span={10}>
        <InputNumber
          style={{ margin: "0 16px" }}
          addonAfter={suffix}
          value={numberCurrentValue}
          onChange={onStepChange}
        />
      </Col>
    </Row>
  );
};
