import _ from "lodash";
import { type ReactNode, useEffect, useState } from "react";
import { Button, Typography } from "antd";
import { variablesUsedByElement } from "../../utils/variable-parsing/findVariablesUsedByElement";
import { transformVariableToReact } from "../../utils/variable-parsing/transformVariableToReact";
import "./TokenDetails.scss";

const { Text } = Typography;

export const TokenDetails = () => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [frozen, setFrozen] = useState(false); // State to manage if the target is frozen
  const [editable, setEditable] = useState(false); // State to manage if the variable values should be editable

  const saveVariableValues = () => {
    setEditable(false);
  };

  const targetTokenDetails = (target: HTMLElement | null): ReactNode => {
    if (target) {
      try {
        const elementName = target.tagName;
        const elementVariables = variablesUsedByElement(target);
        return (
          <>
            <Text strong>{_.lowerCase(elementName)}</Text>
            <br />
            <br />
            {elementVariables.map((variable) =>
              transformVariableToReact(variable, editable)
            )}
            <br />
            <Button
              onClick={() =>
                editable ? saveVariableValues() : setEditable(true)
              }
              type="primary"
              size="small"
            >
              {editable ? "Save" : "Edit"}
            </Button>
            <br />
            <br />
            <Button
              onClick={() => setFrozen(false)}
              color="cyan"
              variant="solid"
              size="small"
            >
              Unfreeze
            </Button>
          </>
        );
      } catch (e) {
        console.log(e);
      }
    } else {
      return <h4>No target selected </h4>;
    }
  };

  useEffect(() => {
    const interceptClick = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }

      if (event.target.matches(".tokenInspector *")) {
        console.log("Click on token inspector, NOT freezing target");
        // If the click is not on the token inspector, do not freeze
        return;
      }

      event.preventDefault();
      event.stopPropagation();

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
        console.log("Changing target!");
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
