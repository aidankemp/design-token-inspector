export type RawCssRuleWithIndex = {
  rule: CSSStyleRule;
  indexInStylesheet: number;
};

export type CssRuleWithVariableNames = RawCssRuleWithIndex & {
  variables: { property: string; variableName: string }[];
  selectors: string[];
};
