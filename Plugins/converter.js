const { getRandom } = require("../System/Function");
const { webp2mp4File } = require("../System/Uploader");
const { toAudio } = require("../System/File-Converter");
const { exec } = require("child_process");
const fs = require("fs");
const PDFDocument = require("pdfkit");
let { GraphOrg } = require("../System/Uploader");

const util = require("util");
let mergedCommands = [
  "toimg",
  "toimage",
  "togif",
  "tomp4",
  "tomp3",
  "toaudio",
  "tourl",
  "topdf",
  "imgtopdf",
];

module.exports = {
  name: "converters",
  alias: [...mergedCommands],
  uniquecommands: [
    "toimg",
    "togif",
    "tomp4",
    "tomp3",
    "toaudio",
    "tourl",
    "topdf",
    "imgtopdf",
  ],
  description: "dönüştürücüyle ilgili tüm komutlar.",
  start: async (
    Atlas,
    m,
    { inputCMD, text, quoted, doReact, prefix, mime }
  ) => {
    switch (inputCMD) {
      case "toimg":
      case "toimage":
        if (!m.quoted && !/webp/.test(mime)) {
          await doReact("❔");
          return m.reply(
            `Lütfen *animasyonsuz* bir çıkartmayı resme dönüştürmek için yanıtlayın.`
          );
        }
        await doReact("🎴");
        let mediaMess = await Atlas.downloadAndSaveMediaMessage(quoted);
        let ran = await getRandom(".png");
        exec(`ffmpeg -i ${mediaMess} ${ran}`, (err) => {
          fs.unlinkSync(mediaMess);
          if (err) {
            Atlas.sendMessage(
              m.from,
              {
                text: `Lütfen *animasyonsuz* bir sticker üzerinde kullanın! \n\nveya *${prefix}togif* / *${prefix}tomp4*  komutlarıyla *animasyonlu* stickerlar dönüştürünüz !`,
              },
              { quoted: m }
            );
            return;
          }
          let buffer = fs.readFileSync(ran);
          Atlas.sendMessage(
            m.from,
            { image: buffer, caption: `_Converted by:_  *${botName}*\n` },
            { quoted: m }
          );
          fs.unlinkSync(ran);
        });
        break;

      case "tomp4":
        if (!m.quoted && !/webp/.test(mime)) {
          await doReact("❔");
          return reply(
            `Lütfen *Animasyonlu* stickerı videoya dönüştürmek için yanıtlayınız!`
          );
        }
        await doReact("🎴");
        let mediaMess2 = await Atlas.downloadAndSaveMediaMessage(quoted);
        let webpToMp4 = await webp2mp4File(mediaMess2);

        await Atlas.sendMessage(
          m.from,
          {
            video: { url: webpToMp4.result },
            caption: `_Converted by:_  *${botName}*\n`,
          },
          { quoted: m }
        );
        fs.unlinkSync(mediaMess2);
        break;

        
      case "togif":
        if (!m.quoted && !/webp/.test(mime)) {
          await doReact("❔");
          return m.reply(
            `Lütfen *Animasyonlu* stickerı gifte dönüştürmek için yanıtlayınız!`
          );
        }
        await doReact("🎴");
        let mediaMess3 = await Atlas.downloadAndSaveMediaMessage(quoted);
        let webpToMp42 = await webp2mp4File(mediaMess3);

        await Atlas.sendMessage(
          m.from,
          {
            video: { url: webpToMp42.result },
            caption: `_Converted by:_  *${botName}*\n`,
            gifPlayback: true,
          },
          { quoted: m }
        );
        fs.unlinkSync(mediaMess3);

        break;

      case "tomp3":
        if (/document/.test(mime)) {
          await doReact("❌");
          return m.reply(
            `mp3 e dönüştürmek istediğiniz sesi/videoyu yanıtlayınız veya altyazıyla gönderiniz *${prefix}tomp3*`
          );
        }
        if (!/video/.test(mime) && !/audio/.test(mime)) {
          await doReact("❌");
          return reply(
            `mp3 e dönüştürmek istediğiniz sesi/videoyu yanıtlayınız veya altyazıyla gönderiniz *${prefix}tomp3*`
          );
        }
        if (!m.quoted) {
          await doReact("❔");
          return m.reply(
            `mp3 e dönüştürmek istediğiniz sesi/videoyu yanıtlayınız veya altyazıyla gönderiniz *${prefix}tomp3*`
          );
        }
        await doReact("🎶");
        let media = await quoted.download();
        await Atlas.sendPresenceUpdate("recording", m.from);
        let audio = await toAudio(media, "mp4");
        Atlas.sendMessage(
          m.from,
          {
            document: audio,
            mimetype: "audio/mpeg",
            fileName: `Converted By ${botName} ${m.id}.mp3`,
          },
          { quoted: m }
        );

        break;

      case "toaudio":
        if (/document/.test(mime)) {
          await doReact("❌");
          return m.reply(
            `mp3 e dönüştürmek istediğiniz sesi/videoyu yanıtlayınız veya altyazıyla gönderiniz *${prefix}tomp3*`
          );
        }
        if (!/video/.test(mime) && !/audio/.test(mime)) {
          await doReact("❌");
          return m.reply(
            `Send/Reply Video/Audio You Want To Convert Into MP3 With Caption *${prefix}tomp3*`
          );
        }
        if (!m.quoted) {
          await doReact("❔");
          return m.reply(
            `mp3 e dönüştürmek istediğiniz sesi/videoyu yanıtlayınız veya altyazıyla gönderiniz *${prefix}tomp3*`
          );
        }
        await doReact("🎶");
        let media2 = await quoted.download();
        await Atlas.sendPresenceUpdate("recording", m.from);
        let audio2 = await toAudio(media2, "mp4");
        Atlas.sendMessage(
          m.from,
          { audio: audio2, mimetype: "audio/mpeg" },
          { quoted: m }
        );
        break;

      case "tourl":
        if (!m.quoted) {
          await doReact("❔");
          return m.reply(
            `Bağlantı oluşturmak için lütfen bir *Resim* / *Video* sağlayın! Caption ${prefix}tourl`
          );
        }
        let media5 = await Atlas.downloadAndSaveMediaMessage(quoted);
        if (/image/.test(mime)) {
          await doReact("🔗");
          let anu = await GraphOrg(media5);
          m.reply(`*oluşturulan resim  URL si:* \n\n${util.format(anu)}\n`);
        } else if (/video/.test(mime)) {
          await doReact("▶️");
          try {
            let anu = await GraphOrg(media5);
            m.reply(`*oluşturulan Video URL si:* \n\n${util.format(anu)}\n`);
          } catch (e) {
            await doReact("❌");
            await fs.unlinkSync(media5);
            return Atlas.sendMessage(
              m.from,
              {
                text: `*Video boyutu çokk büyük!*\n\n*Max video boyutu:* 5MB`,
              },
              { quoted: m }
            );
          }
        } else {
          await doReact("❌");
          return m.reply(
            `Bağlantı oluşturmak için lütfen bir *Resim* / *Video* sağlayın!`
          );
        }
        await fs.unlinkSync(media5);
        break;

      case "topdf":
      case "imgtopdf":
        if (/image/.test(mime)) {
          await doReact("📑");
          let mediaMess4 = await Atlas.downloadAndSaveMediaMessage(quoted);

          async function generatePDF(path) {
            return new Promise((resolve, reject) => {
              const doc = new PDFDocument();

              const imageFilePath = mediaMess4.replace(/\\/g, "/");
              doc.image(imageFilePath, 0, 0, {
                width: 612, // It will make your image to horizontally fill the page - Change it as per your requirement
                align: "center",
                valign: "center",
              });

              doc.pipe(fs.createWriteStream(path));

              doc.on("end", () => {
                resolve(path);
              });

              doc.end();
            });
          }

          try {
            let randomFileName = `./${Math.floor(
              Math.random() * 1000000000
            )}.pdf`;
            const pdfPATH = randomFileName;
            await generatePDF(pdfPATH);
            pdf = fs.readFileSync(pdfPATH);

            setTimeout(async () => {
              let pdf = fs.readFileSync(pdfPATH);

              Atlas.sendMessage(
                m.from,
                {
                  document: pdf,
                  fileName: `Converted By ${botName}.pdf`,
                },
                { quoted: m }
              );

              fs.unlinkSync(mediaMess4);
              fs.unlinkSync(pdfPATH);
            }, 1000);
          } catch (error) {
            await doReact("❌");
            console.error(error);
            return m.reply(
              `Resim PDF e dönüştürülürken bir hata oluştu.`
            );
          }
        } else {
          await doReact("❔");
          return m.reply(`Lütfen bir *Görüntüyü* PDF ye dönüştürmek için yanıtlayın!`);
        }
        break;

      default:
        break;
    }
  },
}
