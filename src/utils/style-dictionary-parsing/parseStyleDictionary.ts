import StyleDictionary from "style-dictionary";
import { formats, transformGroups } from "style-dictionary/enums";
import type { DesignTokens } from "style-dictionary/types";

export const parseStyleDictionary = async (tokens: DesignTokens) => {
  // Initialize Style Dictionary with the fetched tokens
  const sd = new StyleDictionary({
    tokens,
    platforms: {
      css: {
        transformGroup: transformGroups.css,
        files: [
          {
            destination: "variables.css",
            format: formats.cssVariables,
          },
        ],
      },
    },
  });

  return await sd.formatPlatform("css");
};

export const parseStyleDictionaryFromFile = async (tokenFileUrl: string) => {
  const tokenFile = await fetch(tokenFileUrl);
  if (!tokenFile.ok) {
    throw new Error(`Failed to fetch token file: ${tokenFile.statusText}`);
  }
  const tokenData = await tokenFile.json();
  if (!tokenData || typeof tokenData !== "object") {
    throw new Error("Invalid token data format");
  }
  return parseStyleDictionary(tokenData);
};
