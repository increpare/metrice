import { existsSync, realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(realpathSync(fileURLToPath(import.meta.url))), "../../..");
const localCli = resolve(root, "app/agent/cli.ts");
const loader = resolve(root, "node_modules/tsx/dist/loader.mjs");
if (!process.env.METRICE_MCP_URL && existsSync(localCli) && !existsSync(loader)) {
  console.error(`Local Metrice checkout has no TypeScript loader. Run npm install in ${root}, or explicitly set METRICE_MCP_URL to use a hosted engine.`);
  process.exitCode = 1;
} else if (!process.env.METRICE_MCP_URL && existsSync(localCli)) {
  const result = spawnSync(process.execPath, ["--import", loader, localCli, ...process.argv.slice(2)],
    { cwd: root, stdio: "inherit" });
  if (result.error) console.error(result.error.message);
  process.exitCode = result.status ?? 1;
} else {
  try {
    const [name, argument = "{}"] = process.argv.slice(2);
    if (!name || name === "--help") {
      console.log("Usage: node call.mjs <tool> '<JSON arguments>'\nUse - to read JSON from stdin. METRICE_MCP_URL overrides the hosted endpoint.");
    } else {
      let input = argument;
      if (argument === "-") {
        input = ""; process.stdin.setEncoding("utf8");
        for await (const chunk of process.stdin) input += chunk;
      }
      const args = JSON.parse(input);
      const url = process.env.METRICE_MCP_URL ?? "https://metrice.increpare.com/mcp";
      let id = 0; let protocol = "2025-11-25";
      async function request(method, params, notification = false) {
        const response = await fetch(url, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "MCP-Protocol-Version": protocol },
          body: JSON.stringify({ jsonrpc: "2.0", ...(notification ? {} : { id: ++id }), method, params }),
          signal: AbortSignal.timeout(120_000),
        });
        if (!response.ok) throw new Error(`Metrice HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
        if (notification) { await response.arrayBuffer(); return; }
        const payload = await response.json();
        if (payload.error) throw new Error(payload.error.message ?? JSON.stringify(payload.error));
        return payload.result;
      }
      const initialized = await request("initialize", { protocolVersion: protocol, capabilities: {}, clientInfo: { name: "metrice-skill", version: "0.2.0" } });
      protocol = initialized.protocolVersion;
      await request("notifications/initialized", {}, true);
      const result = await request("tools/call", { name, arguments: args });
      if (result.isError) throw new Error(result.content?.filter(item => item.type === "text").map(item => item.text).join("\n") ?? "Tool failed");
      const data = result.structuredContent ?? JSON.parse(result.content.find(item => item.type === "text").text);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
