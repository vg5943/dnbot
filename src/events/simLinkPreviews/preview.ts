import { MessageEmbed } from "discord.js";
import { SimResult } from "./types";
import fs from "fs";
import p from "path";
import { joinImages } from "join-images";
import cloudinary from "../../modules/cloudinary.js";
import streamifier from "streamifier";
import { UploadApiResponse } from "cloudinary";
import fetch from "node-fetch";

export default async function PreviewSimAsMsg(
  data: SimResult,
  path: string,
  viewerLink: string
): Promise<MessageEmbed> {
  let chars = "";
  data.char_details.forEach((c) => {
    const l = `C${c.cons} ${c.name} (${c.talents.attack}/${c.talents.skill}/${c.talents.burst}: R${c.weapon.refine} ${c.weapon.name})\n`;
    chars = chars.concat(l);
  });

  let targets = "";
  for (const [key, value] of Object.entries(data.dps_by_target)) {
    const l = `Target ${key}: ${value.mean?.toFixed(0)} (stddev: ${value.sd?.toFixed(0)})\n`;
    targets = targets.concat(l);
  }

  const url = await getTeamThumbnail(data.char_names);
  console.log(url);

  const embedMsg = new MessageEmbed()
    .setColor("AQUA")
    .setTitle(`Preview for ${path}`)
    .setURL(viewerLink)
    .setDescription(
      `Total average dps: ${data.dps.mean.toFixed(0)} (min: ${data.dps.min.toFixed(0)}, max: ${data.dps.max.toFixed(
        0
      )}, stddev: ${data.dps.sd.toFixed(0)})`
    )
    .addField("Team", chars)
    .addField("DPS Per Target", targets)
    .addFields(
      { name: "Duration", value: `Combat times: ${data.sim_duration.mean.toFixed(1)}`, inline: true },
      { name: "Iterations", value: `${data.iter} in ${(data.runtime / 1000000000).toFixed(3)}s`, inline: true },
      {
        name: "Hash",
        value: `[${data.version.substring(0, 8)}](https://github.com/genshinsim/gcsim/commits/${data.version})`,
        inline: true,
      }
    )
    .setImage(url);

  return embedMsg;
}

const getTeamThumbnail = (chars: string[]) => {
  return new Promise<string>(async (resolve, reject) => {
    let fn = "";
    chars.forEach((c) => {
      fn = fn.concat(c);
    });
    fn += ".webp";
    // console.log(fn);

    // const imgUrl = cloudinary.url(`aggr/${fn}`);
    const imgUrl = await cloudinary.search.expression(`public_id=aggr/${fn}`).max_results(1).execute();

    let isResolved = false;
    if (imgUrl) {
      fetch(imgUrl.resources[0]?.url)
        .then((r) => {
          if (!isResolved) resolve(r.url);
          isResolved = true;
        })
        .catch((err) => {
          console.log("Not found image ", err);
        });
    }

    let imgs: Buffer[] = [];
    chars.forEach((c) => {
      const image = p.join(p.resolve(), `./public/images/avatar/${c}.png`);
      // console.log(image);
      try {
        const file: Buffer = fs.readFileSync(image);
        imgs.push(file);
        // console.log(file.length);
      } catch (err) {
        console.log("unexpected file ", err);
      }
    });

    joinImages(imgs, { direction: "horizontal" })
      .then((img) => {
        img
          .webp({ alphaQuality: 0 })
          .toBuffer()
          .then((buf) => {
            // console.log(fn);
            uploadFromBuffer(buf, fn)
              .then((r) => {
                // console.log(r.url);
                if (!isResolved) resolve(r.url);
                isResolved = true;
              })
              .catch((err) => reject(err));
          });
      })
      .catch((err) => reject(err));
  });
};

const uploadFromBuffer = (b: Buffer, fn: string) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const cld_upload_stream = cloudinary.uploader.upload_stream(
      {
        folder: "aggr",
        resource_type: "raw",
        public_id: fn,
        overwrite: true,
        filename_override: fn,
        use_filename: true,
        unique_filename: false,
      },
      (err, rs) => {
        if (rs) resolve(rs);
        else if (err) reject(err);
      }
    );

    streamifier.createReadStream(b).pipe(cld_upload_stream);
  });
};
