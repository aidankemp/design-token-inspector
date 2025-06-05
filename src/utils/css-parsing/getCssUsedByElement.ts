import type { RawCssRuleWithIndex } from "../../types/css";

/**
 * Function to get all the CSS style rules that apply to a given element.
 *
 * Note: This is ALL the CSS rules that apply for an element, not the variables,
 * and not just the ones that are actually used for rendering the element (i.e.,
 * this does not filter out rules that are overridden by more specific rules).
 *
 * @param el Element to fetch CSS rules for
 * @returns An array of objects containing the CSSStyleRule and its index in the stylesheet
 *          that applies to the element.
 *          Each object has the structure: { rule: CSSStyleRule, indexInStylesheet: number }
 */
export const getCssUsedByElement = (el: Element): RawCssRuleWithIndex[] => {
  const sheets = document.styleSheets,
    ret: RawCssRuleWithIndex[] = [];

  let index = 0;
  for (const i in sheets) {
    const rules = sheets[i].cssRules;
    for (const r in rules) {
      const rule = rules[r] as CSSStyleRule;
      if (el.matches(rule.selectorText) || el.closest(rule.selectorText)) {
        ret.push({ rule, indexInStylesheet: index });
        index += 1;
      }
    }
  }
  return ret;
};
