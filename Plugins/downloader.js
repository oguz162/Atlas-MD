const axios = require("axios");
let mergedCommands = [
  "igdl",
  "instadl",
  "fbdl",
  "facebookdl",
  "mediafiredl",
  "mediafire",
];

module.exports = {
  name: "downloader",
  alias: [...mergedCommands],
  uniquecommands: ["igdl", "fbdl", "mediafiredl"],
  description: "Tüm dosya indirme komutları",
  start: async (Atlas, m, { inputCMD, text, doReact, prefix, pushName }) => {
    switch (inputCMD) {
      case "igdl":
      case "instadl":
        if (!text) {
          await doReact("❌");
          return m.reply(
            `Please provide a valid instagram Reel/Video link !\n\nExample: *${prefix}igdl https://www.instagram.com/p/CP7Y4Y8J8ZU/*`
          );
        }
        if (!text.includes("instagram")) {
          await doReact("❌");
          return m.reply(
            `Lütfen geçerli bir instagram Reel/Video bağlantısı sağlayın !`
          );
        }
        await doReact("📥");
        await Atlas.sendMessage(
          m.from,
          { text: "*Lütfen bekleyin, videonuzu indiriyorum...*" },
          { quoted: m }
        );

        try {
          const res = await axios.get(
            "https://fantox001-scrappy-api.vercel.app/instadl?url=" + text
          );
          const scrappedURL = res.data.videoUrl;

          Atlas.sendMessage(
            m.from,
            {
              video: { url: scrappedURL },
              caption: `Downloaded by: *${botName}*`,
            },
            { quoted: m }
          );
        } catch (err) {
          await doReact("❌");
          await m.reply(
            `Video erişimi reddedildi! Özeldir veya başka kısıtlamaları vardır.`
          );
        }
        break;

      case "mediafiredl":
      case "mediafire":
        if (!text) {
          await doReact("❌");
          return m.reply(
            `Lütfen geçerli bir Mediafire bağlantısı sağlayın!`
          );
        }
        if (!text.includes("mediafire.com")) {
          await doReact("❌");
          return m.reply(
            `Lütfen geçerli bir Mediafire bağlantısı sağlayın!`
          );
        }

        const MDF = await mediafireDl(text);
        if (MDF[0].size.split("MB")[0] >= 100)
          return m.reply("Dosyanın boyutu çok büyük!");

        let txt = `        *『 Mediafire Downloader 』*
        
*🎀 Dosya adı* : ${MDF[0].nama}
*🧩 Dosya boyutu* : ${MDF[0].size}
*📌 Dosya biçimi* : ${MDF[0].mime}

İndiriliyor...`;

        await doReact("📥");
        await m.reply(txt);

        Atlas.sendMessage(
          m.from,
          {
            document: { url: MDF[0].url },
            mimetype: MDF[0].mime,
            fileName: MDF[0].nama,
          },
          { quoted: m }
        );
        break;

      case "fbdl":
      case "facebookdl":
        if (!text) {
          await doReact("❌");
          return m.reply(
            `Lütfen geçerli bir Facebook bağlantısı sağlayın!`
          );
        }
        if (!text.includes("fb") && !text.includes("facebook")) {
          await doReact("❌");
          return m.reply(
            `Lütfen geçerli bir Facebook bağlantısı sağlayın!`
          );
        }

        await doReact("📥");
        await m.reply(`Lütfen bekleyin, videonuzu indiriyorum...`);
        try {
          const res = await axios.get(
            "https://fantox001-scrappy-api.vercel.app/fbdl?url=" + text
          );
          const scrappedURL = res.data.videoUrl;

          Atlas.sendMessage(
            m.from,
            {
              video: { url: scrappedURL },
              caption: `Downloaded by: *${botName}*`,
            },
            { quoted: m }
          );
        } catch (err) {
          await doReact("❌");
          await m.reply(
            `Video erişimi reddedildi! Gizlidir veya yalnızca sahibinin arkadaşları görüntüleyebilir.`
          );
        }

        break;

      default:
        break;
    }
  },
};

async function mediafireDl(url) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Content-Type": "application/json",
    },
    timeout: 100000,
  });
  const $ = cheerio.load(res.data);
  const results = [];
  const link = $("a#downloadButton").attr("href");
  const size = $("a#downloadButton")
    .text()
    .replace("Download", "")
    .replace("(", "")
    .replace(")", "")
    .replace("\n", "")
    .replace("\n", "")
    .replace("                         ", "");
  const seplit = link.split("/");
  const res5 = seplit[5];
  resdl = res5.split(".");
  resdl = resdl[1];
  results.push({ res5, resdl, size, link });
  return results;
}
