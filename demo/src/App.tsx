import { TokenInspector } from "../../src/components";

function App() {
  const params = new URLSearchParams(window.location.search);
  const tokenFile = params.get("tokenFile") || "tokens.json";
  const hideInspector = params.get("hide") === "true" || false;
  return (
    <TokenInspector
      onClose={() => {}}
      tokenFile={tokenFile}
      hide={hideInspector}
    />
  );
}

export default App;
