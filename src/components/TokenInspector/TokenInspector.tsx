import {
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  ColorPicker,
  Input,
  InputNumber,
  type NotificationArgsProps,
  Row,
  Typography,
  notification,
} from "antd";
import _ from "lodash";
import { type ReactNode, useEffect, useState } from "react";

const { Text } = Typography;

export type Variable = {
  name: string;
  formattedName?: string;
  value: string;
  property: string;
  selector: {
    text: string;
    index: number;
  };
};

const TokenDetails = () => {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  type AntVariables = {
    global: Variable[];
    component: { [componentName: string]: Variable[] };
  };

  const getCssUsedByElement = (
    el: Element
  ): { rule: CSSStyleRule; index: number }[] => {
    const sheets = document.styleSheets,
      ret: { rule: CSSStyleRule; index: number }[] = [];

    let index = 0;
    for (const i in sheets) {
      const rules = sheets[i].cssRules;
      for (const r in rules) {
        const rule = rules[r] as CSSStyleRule;
        if (el.matches(rule.selectorText) || el.closest(rule.selectorText)) {
          ret.push({ rule, index });
          index += 1;
        }
      }
    }
    return ret;
  };

  const getCSSVariableValue = (variable: string, selector: string) => {
    const el = document.querySelector(selector);
    if (!el) return "";
    return getComputedStyle(el).getPropertyValue(variable);
  };

  const findVariablesInRule = ({
    rule,
    index,
  }: {
    rule: CSSStyleRule;
    index: number;
  }): {
    variables: { property: string; variableName: string }[];
    selectors: string[];
    index: number;
  } | null => {
    if (rule.cssText && rule.cssText.includes("var(")) {
      const regex = /([\w-]+)\s*:\s*var\((--[\w-]+)\)/g;
      const matches = [...rule.cssText.matchAll(regex)].map((match) => ({
        property: match[1],
        variableName: match[2],
      }));

      return {
        variables: matches,
        selectors: rule.selectorText.split(","),
        index,
      };
    }
    return null;
  };

  // Function to calculate specificity of a CSS selector
  function getCSSSpecificity(selector: string) {
    const idCount = (selector.match(/#/g) || []).length;
    const classCount = (selector.match(/\.[\w-]+/g) || []).length;
    const attributeCount = (selector.match(/\[[^\]]+\]/g) || []).length;
    const pseudoClassCount = (selector.match(/:(?!:)[^(\s]+/g) || []).length;
    const elementCount = (selector.match(/(^|[\s>+~])\w+/g) || []).length;
    const pseudoElementCount = (selector.match(/::[^\s]+/g) || []).length;

    // Specificity formula: (ID * 100) + (Class/Attribute/Pseudo-class * 10) + (Element/Pseudo-element * 1)
    return (
      idCount * 100 +
      (classCount + attributeCount + pseudoClassCount) * 10 +
      (elementCount + pseudoElementCount) * 1
    );
  }

  const filterUnusedVariables = (
    variables: Variable[],
    el: Element
  ): Variable[] => {
    const filteredVariables: Variable[] = [];
    const computedStyle = getComputedStyle(el);

    // Group variables by property
    const variablesByProperty = _.groupBy(variables, "property");
    for (const [property, propertyVariables] of Object.entries(
      variablesByProperty
    )) {
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

      // Since there may be multiple variables with the same property,
      // compare the specificity of the selectors to determine which variable to use
      const mostSpecificVariables = propertyVariables
        .map((v) => ({
          ...v,
          specificity: getCSSSpecificity(v.selector.text),
        }))
        .sort(function (a, b) {
          return a.specificity - b.specificity === 0
            ? b.selector.index - a.selector.index
            : a.specificity - b.specificity;
        });

      const mostSpecificVariable = mostSpecificVariables.map((v) =>
        _.omit(v, "specificity")
      )[0];
      filteredVariables.push(mostSpecificVariable);
    }

    return filteredVariables;
  };

  const removeDuplicateVariables = (variableMap: Variable[]): Variable[] => {
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

  const sortVariableMap = (variableMap: Variable[]) => {
    const antVariables: AntVariables = {
      global: [],
      component: {},
    };
    const customVariables: Variable[] = [];

    for (let i = 0; i < variableMap.length; i += 1) {
      const variable = variableMap[i];
      const variableName = variable.name;

      if (variableName.startsWith("--ant-")) {
        // if (theme && theme.components) {
        if (variableName.startsWith("--ant-123")) {
          const componentName = _.startCase(
            variableName.substring(6).split("-")[0]
          );
          //   const isComponentVariable = Object.keys(theme.components).includes(
          //     componentName
          //   );
          const isComponentVariable = false;
          if (isComponentVariable) {
            if (!(componentName in antVariables.component)) {
              antVariables.component[componentName] = [];
            }
            antVariables.component[componentName].push(variable);
          } else {
            antVariables.global.push(variable);
          }
        }
      } else {
        customVariables.push(variable);
      }
    }

    return { antVariables, customVariables };
  };

  const formatAntVariables = (antVariables: AntVariables): AntVariables => {
    return {
      global: antVariables.global.map(({ name, ...args }) => ({
        name,
        formattedName: _.startCase(name).split(" ").splice(1).join(" "),
        ...args,
      })),
      component: Object.entries(antVariables.component).reduce(
        (acc, [componentName, variables]) => ({
          ...acc,
          [componentName]: variables.map(({ name, ...args }) => ({
            name,
            formattedName: _.startCase(name).split(" ").splice(2).join(" "),
            ...args,
          })),
        }),
        {}
      ),
    };
  };

  const variableToFormInput = (value: string | number): ReactNode => {
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

  const displayVariableMap = (variableMap: Variable[]) => {
    return variableMap.map((variable) => {
      return (
        <>
          {variable.formattedName ?? variable.name}:{" "}
          {variableToFormInput(variable.value)} (used in{" "}
          <Text strong>{variable.property}</Text>)
          <br />
        </>
      );
    });
  };

  const variablesUsedByElement = (el: Element | null): ReactNode => {
    if (el) {
      const rules = getCssUsedByElement(el);
      let appliedVariables: {
        variables: { property: string; variableName: string }[];
        selectors: string[];
        index: number;
      }[] = [];
      for (const rule of rules) {
        const variablesResult = findVariablesInRule(rule);
        if (variablesResult) {
          appliedVariables = appliedVariables.concat(variablesResult);
        }
      }

      if (appliedVariables.length > 0) {
        const variableMap: Variable[] = [];
        for (let i = 0; i < appliedVariables.length; i += 1) {
          const appliedVariable = appliedVariables[i];
          for (let k = 0; k < appliedVariable.variables.length; k += 1) {
            const variable = appliedVariable.variables[k];
            for (let j = 0; j < appliedVariable.selectors.length; j += 1) {
              const selector = appliedVariable.selectors[j];
              if (el.matches(selector) || el.closest(selector)) {
                const value = getCSSVariableValue(
                  variable.variableName,
                  selector
                );
                // if (variable.property === 'border-radius') {
                //   console.log(variable.variableName, value, selector);
                // }
                variableMap.push({
                  name: variable.variableName,
                  value,
                  property: variable.property,
                  selector: { text: selector, index: appliedVariable.index },
                });
              }
            }
          }
        }

        const filteredVariables = filterUnusedVariables(variableMap, el);

        const uniqueVariables = removeDuplicateVariables(filteredVariables);

        const { antVariables, customVariables } =
          sortVariableMap(uniqueVariables);

        const formattedAntVariables = formatAntVariables(antVariables);

        return (
          <>
            {(formattedAntVariables.global.length > 0 ||
              Object.keys(formattedAntVariables.component).length > 0) && (
              <>
                <Text strong>AntD</Text>
                <br />
                {formattedAntVariables.global.length > 0 && (
                  <>
                    <Text italic>Global</Text>
                    <br />
                    {displayVariableMap(formattedAntVariables.global)}
                  </>
                )}
                {formattedAntVariables.global.length > 0 &&
                  Object.keys(formattedAntVariables.component).length > 0 && (
                    <br />
                  )}
                {Object.keys(formattedAntVariables.component).length > 0 && (
                  <>
                    {Object.entries(formattedAntVariables.component).map(
                      ([key, value]: [string, Variable[]], index: number) => (
                        <>
                          <Text italic>{key}</Text>
                          <br />
                          {displayVariableMap(value)}
                          {index <
                            Object.entries(formattedAntVariables.component)
                              .length -
                              1 && <br />}
                        </>
                      )
                    )}
                  </>
                )}
              </>
            )}
            {(formattedAntVariables.global.length > 0 ||
              Object.keys(formattedAntVariables.component).length > 0) &&
              customVariables.length > 0 && <br />}
            {customVariables.length > 0 && (
              <>
                <Text strong>Custom</Text>
                <br />
                {displayVariableMap(customVariables)}
              </>
            )}
          </>
        );
      }
      return <h4>No variables found</h4>;
    }
    return <h4>No variables found</h4>;
  };

  const popoverContent = (target: HTMLElement | null): ReactNode => {
    if (target) {
      try {
        const elementName = target.tagName;
        const elementVariables = variablesUsedByElement(target);
        return (
          <>
            <Text strong>{_.lowerCase(elementName)}</Text>
            <br />
            <br />
            {elementVariables}
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
    const handleMouseOver = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      if (targetElement) {
        if (
          !targetElement.matches(".tokenInspector") &&
          !targetElement.matches(".tokenInspector *")
        ) {
          setTarget(targetElement);
          targetElement.style.border = "2px solid red";
          targetElement.setAttribute("onclick", "event.stopPropagation();");
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
          targetElement.style.border = "";
          targetElement.removeAttribute("onclick");
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      if (target) {
        target.style.border = "";
        target.removeAttribute("onclick");
      }
    };
  }, [target]);

  return popoverContent(target);
};

export const TokenInspector = ({ onClose }: { onClose: () => void }) => {
  const [api, contextHolder] = notification.useNotification();
  const [location, setLocation] =
    useState<NotificationArgsProps["placement"]>("bottomRight");

  const openNotification = (location: NotificationArgsProps["placement"]) => {
    api.open({
      message: "",
      description: (
        <Row
          align={
            location === "bottomLeft" || location === "bottomRight"
              ? "bottom"
              : "top"
          }
        >
          <Col span={22}>
            <TokenDetails />
          </Col>
          <Col span={2} style={{ paddingTop: "2rem" }}>
            <Button
              size="small"
              shape="circle"
              icon={
                location === "topLeft" ? (
                  <RightOutlined />
                ) : location === "topRight" ? (
                  <DownOutlined />
                ) : location === "bottomRight" ? (
                  <LeftOutlined />
                ) : (
                  <UpOutlined />
                )
              }
              onClick={() => handleClick(location)}
            />
          </Col>
        </Row>
      ),
      placement: location,
      key: location,
      duration: 0,
      onClose: onClose,
      className: "tokenInspector",
    });
  };

  const handleClick = (location: NotificationArgsProps["placement"]) => {
    api.destroy(location);
    let newLocation: NotificationArgsProps["placement"];
    switch (location) {
      case "topLeft":
        newLocation = "topRight";
        break;
      case "topRight":
        newLocation = "bottomRight";
        break;
      case "bottomRight":
        newLocation = "bottomLeft";
        break;
      case "bottomLeft":
        newLocation = "topLeft";
        break;
    }
    setLocation(newLocation);
    openNotification(newLocation);
  };

  useEffect(() => {
    openNotification(location);
  }, []);

  return contextHolder;
};
