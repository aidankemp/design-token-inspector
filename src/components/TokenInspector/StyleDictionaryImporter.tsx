import { Button, Flex, Input } from "antd";
import { useState } from "react";
import { parseStyleDictionary } from "../../utils/style-dictionary-parsing/parseStyleDictionary";
import { applyParsedSDToDocument } from "../../utils/style-dictionary-parsing/applyParsedSDToDocument";

const { TextArea } = Input;

export const StyleDictionaryImporter = () => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");

  const onSave = async () => {
    try {
      // Logic to save the tokens from the TextArea
      const tokens = JSON.parse(inputValue);
      const formattedTokens = await parseStyleDictionary(tokens);
      const tokensAsCssString = formattedTokens[0].output as string;
      console.log("Tokens created:", tokensAsCssString);

      // Apply the tokens to the document
      applyParsedSDToDocument(tokensAsCssString);
      console.log("Tokens applied to the document.");
    } catch (error) {
      console.error("Invalid JSON format:", error);
    }

    setEditing(!editing);
  };

  return (
    <Flex vertical gap={8} align="start">
      {!editing ? (
        <Button
          color="purple"
          variant="outlined"
          size="small"
          onClick={() => setEditing(!editing)}
        >
          Import
        </Button>
      ) : null}
      {editing ? (
        <>
          <TextArea
            rows={4}
            placeholder="Insert Style Dictionary tokens"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button color="purple" variant="solid" size="small" onClick={onSave}>
            Save Tokens
          </Button>
        </>
      ) : null}
    </Flex>
  );
};
