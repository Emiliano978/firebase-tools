import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z, ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { FirebaseMcpServer } from "./index";
import { Config } from "../config";
import { RC } from "../rc";
import { cleanSchema } from "./util";

export interface ServerToolContext {
  projectId: string;
  accountEmail: string | null;
  config: Config;
  host: FirebaseMcpServer;
  rc: RC;
}

export interface ServerTool<InputSchema extends ZodTypeAny = ZodTypeAny> {
  mcp: {
    name: string;
    description?: string;
    inputSchema: any;
    annotations?: {
      title?: string;
      readOnlyHint?: boolean;
      destructiveHint?: boolean;
      idempotentHint?: boolean;
      openWorldHint?: boolean;
    };
    _meta?: {
      /** Set this on a tool if it *always* requires a project to work. */
      requiresProject?: boolean;
      /** Set this on a tool if it *always* requires a signed-in user to work. */
      requiresAuth?: boolean;
      /** Set this on a tool if it uses Gemini in Firebase API in any way. */
      requiresGemini?: boolean;
      /** Tools are grouped by feature. --only can configure what tools is available. */
      feature?: string;
    };
  };
  fn: (input: z.infer<InputSchema>, ctx: ServerToolContext) => Promise<CallToolResult>;
}

export function tool<InputSchema extends ZodTypeAny>(
  options: Omit<ServerTool<InputSchema>["mcp"], "inputSchema"> & {
    inputSchema: InputSchema;
  },
  fn: ServerTool<InputSchema>["fn"],
): ServerTool {
  return {
    mcp: { ...options, inputSchema: cleanSchema(zodToJsonSchema(options.inputSchema)) },
    fn,
  };
}
