import {
  assertNotNull,
  BatchContext,
  BatchProcessorItem,
  SubstrateBatchProcessor,
} from "@subsquid/substrate-processor";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import { In } from "typeorm";
import { AddedMsg } from "./model";
import { decodeChatMsg } from "./program";

const CHAT_PROGRAM_ID =
  "0x739a09d43c2105b712e2c5e43008616b8c47c9ed73c8aa1d941e9fc8ea9ed6e4";

const processor = new SubstrateBatchProcessor()
  .setDataSource({
    archive: "https://gear-testnet.archive.subsquid.io/graphql",
  })
  .setBlockRange({ from: 2_000_000 })
  .addGearMessageEnqueued(CHAT_PROGRAM_ID, {
    data: {
      event: {
        args: true,
        phase: true,
        call: { args: true },
      },
    },
  })
  .addGearUserMessageSent(CHAT_PROGRAM_ID, {
    data: {
      event: { args: true },
    },
  });

type Item = BatchProcessorItem<typeof processor>;
type Ctx = BatchContext<Store, Item>;

processor.run(new TypeormDatabase(), async (ctx) => {
  let { messages } = await extractMessages(ctx);

  /*
    let accountIds = new Set<string>()
    messages.forEach(rec => {
        accountIds.add(rec.by)
    })

    let accounts = await ctx.store.findBy(Account, {
        id: In([...accountIds])
    }).then(accounts => {
        return new Map(accounts.map(account => [account.id, account]))
    })

    let mints = new Map(records.map(rec => {
        let account = accounts.get(rec.account)
        if (account == null) {
            account = new Account({id: rec.account})
            accounts.set(rec.account, account)
        }
        let tokenMint = new TokenMint({
            ...rec,
            account,
        })
        return [rec.id, tokenMint]
    }))

    for (let reply of replies) {
        let tokenMint = mints.get(reply.message)
        if (tokenMint == null) {
            tokenMint = assertNotNull(await ctx.store.get(TokenMint, reply.message))
        }
        tokenMint.successful = reply.code == 0
        mints.set(tokenMint.id, tokenMint)
    }
   */

  let msgs = new Map(messages.map((rec) => {
    /*
        let account = accounts.get(rec.by)
        if (account == null) {
            account = new Account({id: rec.by})
            accounts.set(rec.by, account)
        }
       */
    let msg = new AddedMsg({
      id: rec.id,
      msg: rec.msg,
      blockNumber: rec.blockNumber,
      timestamp: rec.timestamp,
      by: rec.by,
    });
    return [rec.id, msg];
  }));

  // await ctx.store.save([...accounts.values()])
  await ctx.store.save([...msgs.values()]);
});

interface Message {
  id: string;
  msg: string;
  by: string;
  blockNumber: number;
  timestamp: Date;
}

async function extractMessages(ctx: Ctx): Promise<{ messages: Message[] }> {
  let messages: Message[] = [];
  for (let block of ctx.blocks) {
    for (let item of block.items) {
      if (item.kind != "event") continue;

      ctx.log.info("item.event = " + JSON.stringify(item.event, null, "  "));

      if (item.event.name == "Gear.UserMessageSent") {
        let output = await decodeChatMsg(item.event.args.message.payload);
        ctx.log.info("Added message: " + JSON.stringify(output, null, "  "));
        if ("addedMsg" in output) {
          messages.push({
            id: item.event.args.message.id, // message_id
            msg: output.addedMsg.msg,
            by: output.addedMsg.by,
            blockNumber: block.header.height,
            timestamp: new Date(block.header.timestamp),
          });
        }
      }
    }
  }
  return { messages };
}
