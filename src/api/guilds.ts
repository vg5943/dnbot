import { Get, Router } from "@discordx/koa";
import type { Context } from "koa";
import { client } from "../main.js";

@Router()
export class API {
  @Get("/")
  index(context: Context) {
    context.body = `
      <div style="text-align: center">
        DN bot
      </div>
    `;
  }

  @Get()
  guilds(context: Context) {
    context.body = `${client.guilds.cache.map((g) => `${g.id}: ${g.name}\n`)}`;
  }
}
