// Function to calculate specificity of a CSS selector
export function getCSSSpecificity(selector: string) {
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
