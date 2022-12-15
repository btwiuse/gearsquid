import { readFileSync } from "fs";
import { CreateType, getWasmMetadata, Metadata } from "@gear-js/api";
import { assertNotNull } from "@subsquid/substrate-processor";

let CHAT_METADATA: undefined | Metadata;

async function getChatMetadata(): Promise<Metadata> {
  if (!CHAT_METADATA) {
    let wasm = readFileSync("./gearchat.meta.wasm");
    CHAT_METADATA = await getWasmMetadata(wasm);
  }
  return CHAT_METADATA;
}

export async function decodeChatMsg(payload: string): Promise<any> {
  let meta = await getChatMetadata();
  let type = assertNotNull(meta["handle_output"]);
  return CreateType.create(type, payload, meta).toJSON();
}
