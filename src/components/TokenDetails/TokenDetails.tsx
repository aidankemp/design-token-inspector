import _ from "lodash";
import { type ReactNode, useEffect, useState } from "react";
import { Button, Flex, Form, Typography } from "antd";
import { variablesUsedByElement } from "../../utils/variable-parsing/findVariablesUsedByElement";
import { transformVariableToReact } from "../../utils/variable-parsing/transformVariableToReact";
import "./TokenDetails.scss";
import { changeVariableValue } from "../../utils/variable-updates/changeVariableValue";
import type { Color } from "antd/es/color-picker";

const { Text } = Typography;

export const TokenDetails = () => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [frozen, setFrozen] = useState(false); // State to manage if the target is frozen
  const [editable, setEditable] = useState(false); // State to manage if the variable values should be editable
  const [tokenEditingForm] = Form.useForm();

  const onValuesChange = (values: Record<string, string | Color>) => {
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === "object") {
        if ("toCssString" in value) {
          // If the value is a ColorPicker, convert it to a CSS string
          changeVariableValue(key, value.toCssString());
          continue;
        }
      }
      changeVariableValue(key, value);
    }
  };

  const onFinish = () => {
    setEditable(false);
    setFrozen(false);
  };

  const targetTokenDetails = (target: HTMLElement | null): ReactNode => {
    if (!target) {
      return <h4>No target selected </h4>;
    }

    try {
      const elementName = target.tagName;
      const elementVariables = variablesUsedByElement(target);
      return (
        <>
          <Text strong>{_.lowerCase(elementName)}</Text>
          <br />
          <br />
          <Form
            form={tokenEditingForm}
            name="variableValues"
            onValuesChange={onValuesChange}
            onFinish={onFinish}
          >
            {elementVariables.map((variable) =>
              transformVariableToReact(
                variable,
                editable,
                (name: string, value: string) => {
                  changeVariableValue(name, value);
                }
              )
            )}
            <br />
            <Flex gap={8}>
              {editable ? (
                <Form.Item noStyle>
                  <Button type="primary" size="small" htmlType="submit">
                    Save
                  </Button>
                </Form.Item>
              ) : null}
              {editable ? null : (
                <Button
                  onClick={() => setEditable(true)}
                  type="primary"
                  size="small"
                >
                  Edit
                </Button>
              )}
              {frozen ? (
                <>
                  <br />
                  <Button
                    id="unfreeze-button"
                    onClick={() => {
                      setFrozen(false);
                    }}
                    color="cyan"
                    variant="solid"
                    size="small"
                  >
                    Unfreeze
                  </Button>
                </>
              ) : null}
            </Flex>
          </Form>
        </>
      );
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (target) {
      if (frozen) {
        target.classList.add("token-details__selected-target--frozen");
      } else {
        target.classList.remove("token-details__selected-target--frozen");
      }
    }
  }, [target, frozen]);

  useEffect(() => {
    const interceptClick = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }

      if (
        event.target.matches(".tokenInspector *") ||
        event.target.matches("#unfreeze-button *")
      ) {
        // If the click is not on the token inspector, do not freeze
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (frozen) {
        if (event.target.matches(".token-details__selected-target")) {
          // If the click is on the selected target, unfreeze it
          setFrozen(false);
          return;
        }
        // If the target is currently frozen, do not change anything
        return;
      }

      setFrozen(true);
    };

    const changeTarget = (
      currentTarget: HTMLElement | null,
      newTarget: HTMLElement | null,
      targetFrozen: boolean
    ) => {
      // If the target is frozen, do not change anything
      if (targetFrozen) {
        return;
      }

      if (currentTarget) {
        currentTarget.classList.remove("token-details__selected-target");
      }
      if (newTarget) {
        newTarget.classList.add("token-details__selected-target");
        document
          .querySelectorAll(".token-details__selected-target")
          .forEach((el) => {
            if (el !== newTarget) {
              el.classList.remove("token-details__selected-target");
            }
          });
        setTarget(newTarget);
      }
    };

    const handleMouseOver = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      if (targetElement) {
        if (
          !targetElement.matches(".tokenInspector") &&
          !targetElement.matches(".tokenInspector *")
        ) {
          changeTarget(target, targetElement, frozen);
        }
      }
    };

    const handleMouseOut = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      if (targetElement) {
        if (
          !targetElement.matches(".tokenInspector") &&
          !targetElement.matches(".tokenInspector *")
        ) {
          changeTarget(target, null, frozen);
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", interceptClick);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("click", interceptClick);
    };
  }, [frozen, target]);

  return targetTokenDetails(target);
};
