import { TextChannel } from "discord.js";
import type { ArgsOf } from "discordx";
import { Discord, On } from "discordx";
import fetch from "node-fetch";
import pako from "pako";
import { client } from "../../main.js";
import PreviewSimAsMsg from "./preview.js";
import { SimResult } from "./types.js";

interface ViewerDataFetch {
  author: string;
  description: string;
  data: string;
}

@Discord()
export abstract class SimLinkPreview {
  @On("messageCreate")
  onMessage([message]: ArgsOf<"messageCreate">) {
    const urlExp =
      /(http|https)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=])*/gi;

    if (!message.content.match(urlExp)) {
      console.log("Not url, ", message.content.substring(0, 10));
      return;
    }

    // console.log(message.content);
    const path = new URL(message.content).pathname.split("/", 4)[3];
    if (!path) {
      console.log("No path provided");
      return;
    }
    // console.log(path);

    const simViewerUrl = `https://viewer.gcsim.workers.dev/${path}`;
    fetch(simViewerUrl)
      .then(async (res) => {
        const x: ViewerDataFetch = (await res.json()) as ViewerDataFetch;

        const binaryStr = Buffer.from(x.data, "base64");
        const jsonData = extractJSONStringFromBinary(binaryStr);
        if (jsonData.err) {
          console.log(jsonData.err);
          return;
        }

        const data = JSON.parse(jsonData.data) as SimResult;

        // console.log(!message.author.bot);
        if (!message.author.bot) {
          await message.suppressEmbeds(true);
        }

        const embedMsg = await PreviewSimAsMsg(data, path, message.content);
        const channel = client.channels.cache.get(message.channelId) as TextChannel;
        if (channel) {
          const ok = await channel.send({ embeds: [embedMsg] });
          console.log("channel id: ", ok.channelId);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

function extractJSONStringFromBinary(b: Buffer) {
  try {
    const restored = pako.inflate(b, { to: "string" });
    return {
      err: "",
      data: restored,
    };
  } catch {
    return {
      err: "Not a valid gzipped JSON file",
      data: "",
    };
  }
}
