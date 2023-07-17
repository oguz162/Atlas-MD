const fs = require("fs");
const Jimp = require("jimp");
const moment = require("moment-timezone");
const {
  banUser, //----------------------- BAN
  checkBan, // --------------------- CHECK BAN STATUS
  unbanUser, // -------------------- UNBAN
  addMod, // ----------------------- ADD MOD
  checkMod, // --------------------- CHECK MOD STATUS
  delMod, // ----------------------- DEL MOD
  setChar, // ---------------------- SET CHAR ID
  getChar, // ---------------------- GET CHAR ID
  activateChatBot, // -------------- ACTIVATE PM CHATBOT
  checkPmChatbot, // --------------- CHECK PM CHATBOT STATUS
  deactivateChatBot, // ------------ DEACTIVATE PM CHATBOT
  setBotMode, // ------------------- SET BOT MODE
  getBotMode, // ------------------- GET BOT MODE
  banGroup, // --------------------- BAN GROUP
  checkBanGroup, //----------------- CHECK BAN STATUS OF A GROUP
  unbanGroup, // ------------------- UNBAN GROUP
} = require("../System/MongoDB/MongoDb_Core");

const {
  userData,
  groupData,
  systemData,
} = require("../System/MongoDB/MongoDB_Schema.js");

let mergedCommands = [
  "addmod",
  "setmod",
  "delmod",
  "removemod",
  "modlist",
  "mods",
  "ban",
  "banuser",
  "unban",
  "unbanuser",
  "banlist",
  "listbans",
  "setchar",
  "dmchatbot",
  "pmchatbot",
  "bangroup",
  "bangc",
  "unbangroup",
  "unbangc",
  "setbotmode",
  "mode",
];

module.exports = {
  name: "moderators",
  alias: [...mergedCommands],
  uniquecommands: [
    "addmod",
    "delmod",
    "mods",
    "ban",
    "unban",
    "banlist",
    "setchar",
    "pmchatbot",
    "bangroup",
    "unbangroup",
    "mode",
  ],
  description: "Tüm Moderatör/Sahip Komutları",
  start: async (
    Atlas,
    m,
    {
      inputCMD,
      text,
      mods,
      isCreator,
      banData,
      prefix,
      db,
      isintegrated,
      doReact,
      args,
      itsMe,
      participants,
      metadata,
      mentionByTag,
      mime,
      isMedia,
      quoted,
      botNumber,
      isBotAdmin,
      groupAdmin,
      isAdmin,
      pushName,
      groupName,
    }
  ) => {
   isUsermod = await checkMod(m.sender);
        if (!isCreator && !isintegrated && !isUsermod) {
          await doReact("❌");
          return m.reply(
            "Üzgünüm, yalnızca benim *Mod'larım* bu komutu kullanabilir!"
          );
        }
    switch (inputCMD) {
      case "addmod":
      case "setmod":
        if (!text && !m.quoted) {
          await doReact("❌");
          return m.reply(`Lütfen *mod* yapmak için bir kullanıcıyı etiketleyin!`);
        }
         mentionedUser = m.quoted ? m.quoted.sender : mentionByTag[0];
        userId = mentionedUser;
        isUsermod = await checkMod(userId);
        if (!isCreator && !isintegrated && isUsermod) {
          await doReact("❌");
          return m.reply(
            "Üzgünüm, bu komutu yalnızca *Sahibim* kullanabilir! *Eklenen Modların* bu izni yoktur."
          );
        }
        if (!userId) return m.reply("Lütfen yasaklamak için geçerli bir kullanıcı belirtin!");

        try {
          if (isUsermod) {
            await doReact("✅");
            return Atlas.sendMessage(
              m.from,
              {
                text: `@${userId.split("@")[0]} Kullanıcıyı modlar listesine ekleyin ve veritabanına kaydedin`,
                mentions: [userId],
              },
              { quoted: m }
            );
          }

          // Add user to the mods list and save to the database
          await doReact("✅");
          await addMod(userId)
            .then(() => {
              Atlas.sendMessage(
                m.from,
                {
                  text: `@${
                    userId.split("@")[0]
                  } başarıyla modlara kaydedildi`,
                  mentions: [userId],
                },
                { quoted: m }
              );
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (err) {
          console.log(err);
        }
        break;

      case "delmod":
      case "removemod":
        // Check if a user is mentioned
        if (!text && !m.quoted) {
          await doReact("❔");
          return m.reply(`Lütfen *moddan* çıkarmak için bir kullanıcıyı etiketleyin!`);
        }
        mentionedUser = m.quoted ? m.quoted.sender : mentionByTag[0];
        userId = mentionedUser;
        isUsermod = await checkMod(userId);
        if (!isCreator && !isintegrated && isUsermod) {
          await doReact("❌");
          return m.reply(
            "Üzgünüm, bu komutu yalnızca *Sahibim* kullanabilir! *Eklenen Modlar* bu izne sahip değil."
          );
        }
        if (!userId) return m.reply("Lütfen yasaklamak için geçerli bir kullanıcı belirtin!");

        try {
          if (!isUsermod) {
            await doReact("✅");
            return Atlas.sendMessage(
              m.from,
              {
                text: `@${userId.split("@")[0]} mod olarak kayıtlı değil !`,
                mentions: [userId],
              },
              { quoted: m }
            );
          }

          await delMod(userId)
            .then(() => {
              Atlas.sendMessage(
                m.from,
                {
                  text: `@${
                    userId.split("@")[0]
                  } başarıyla modlardan kaldırıldı`,
                  mentions: [userId],
                },
                { quoted: m }
              );
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (err) {
          console.log(err);
        }
        break;

      case "modlist":
      case "mods":
        await doReact("✅");
        try {
          var modlist = await userData.find({ addedMods: "true" });
          var modlistString = "";
          var ownerList = global.owner;
          modlist.forEach((mod) => {
            modlistString += `\n@${mod.id.split("@")[0]}\n`;
          });
          var mention = await modlist.map((mod) => mod.id);
          let xy = modlist.map((mod) => mod.id);
          let yz = ownerList.map((owner) => owner + "@s.whatsapp.net");
          let xyz = xy.concat(yz);

          ment = [ownerList.map((owner) => owner + "@s.whatsapp.net"), mention];
          let textM = `    🧣  *${botName} Modlar*  🧣\n\n`;

          if (ownerList.length == 0) {
            textM = "*Hiç Mod Eklenmedi !*";
          }

          textM += `\n〽 *️sahipler* 〽️\n`;

          for (var i = 0; i < ownerList.length; i++) {
            textM += `\n〄  @${ownerList[i]}\n`;
          }

          if (modlistString != "") {
            textM += `\n🧩 *Modlar Eklendi* 🧩\n`;
            for (var i = 0; i < modlist.length; i++) {
              textM += `\n〄  @${modlist[i].id.split("@")[0]}\n`;
            }
          }

          if (modlistString != "" || ownerList.length != 0) {
            textM += `\n\n📛 *Engellemeyi önlemek için Spam Yapmayın !*\n\n🎀 Herhangi bir yardım için * yazın ${prefix}destek* ve grupta sorun. \n\n*💫 ${botName}'ı kullandığınız için teşekkürler. 💫*\n ${botName}. 💫*\n`;
          }

          Atlas.sendMessage(
            m.from,
            {
              video: { url: botVideo },
              gifPlayback: true,
              caption: textM,
              mentions: xyz,
            },
            { quoted: m }
          );
        } catch (err) {
          console.log(err);
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            { text: `Mod listesi alınırken dahili bir hata oluştu.` },
            { quoted: m }
          );
        }

        break;

      case "ban":
      case "banuser":
        if (!text && !m.quoted) {
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            { text: `Lütfen bir kullanıcıyı *Ban*a etiketleyin.`
            { quoted: m }
          );
        } else if (m.quoted) {
          var mentionedUser = m.quoted.sender;
        } else {
          var mentionedUser = mentionByTag[0];
        }
        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Üzgünüz, sadece *Sahipler* ve *Modlar* bu komutu kullanabilir !`,
            quoted: m,
          });
        }
        userId = (await mentionedUser) || m.msg.contextInfo.participant;
        chechBanStatus = await checkBan(userId);
        checkUserModStatus = await checkMod(userId);
        userNum = userId.split("@")[0];
        globalOwner = global.owner;
        if (checkUserModStatus == true || globalOwner.includes(userNum)) {
          await doReact("❌");
          return m.reply(`Üzgünüm, bir *Sahibi* veya *Modu* yasaklayamam !`);
        }
        if (chechBanStatus) {
          await doReact("✅");
          return Atlas.sendMessage(
            m.from,
            {
              text: `@${mentionedUser.split("@")[0]} zaten *Yasaklı* !`,
              mentions: [mentionedUser],
            },
            { quoted: m }
          );
        } else {
          banUser(userId).then(async () => {
            await doReact("✅");
            await Atlas.sendMessage(
              m.from,
              {
                text: `@${
                  mentionedUser.split("@")[0]
                } tarafından Başarıyla *Yasaklandı* *${pushName}*`,
                mentions: [mentionedUser],
              },
              { quoted: m }
            );
          });
        }

        break;

      case "unban":
      case "unbanuser":
        if (!text && !m.quoted) {
          await doReact("❌");
          return m.reply(`Lütfen bir kullanıcıyı *Ban-Un-Un* için etiketleyin!`);
        } else if (m.quoted) {
          var mentionedUser = m.quoted.sender;
        } else {
          var mentionedUser = mentionByTag[0];
        }
        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Üzgünüz, sadece *Sahipler* ve *Modlar* bu komutu kullanabilir !`,
            quoted: m,
          });
        }
        userId = (await mentionedUser) || m.msg.contextInfo.participant;
        chechBanStatus = await checkBan(userId);
        if (chechBanStatus) {
          unbanUser(userId).then(async () => {
            await doReact("✅");
            await Atlas.sendMessage(
              m.from,
              {
                text: `@${
                  mentionedUser.split("@")[0]
                } tarafından *Yasağı Kaldırıldı* *${pushName}*`,
                mentions: [mentionedUser],
              },
              { quoted: m }
            );
          });
        } else {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `@${mentionedUser.split("@")[0]} *Yasaklı* değil !`,
            mentions: [mentionedUser],
            quoted: m,
          });
        }
        break;

      case "setchar":
        if (!text) {
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            { text: `Ayarlamak için lütfen 0-19 arasında bir karakter sayısı girin!` },
            { quoted: m }
          );
        }
        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Üzgünüz, yalnızca *Sahipler* ve *Modlar* bu komutu kullanabilir !`,
            quoted: m,
          });
        }

        const intinput = parseInt(text);
        if (intinput < 0 || intinput > 19) {
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            { text: `Ayarlamak için lütfen 0-19 arasında bir karakter sayısı girin!` },
            { quoted: m }
          );
        }
        const botNames = [
          "Atlas MD",
          "Power",
          "Makima",
          "Denji",
          "Zero Two",
          "Chika",
          "Miku",
          "Marin",
          "Ayanokoji",
          "Ruka",
          "Mizuhara",
          "Rem",
          "Sumi",
          "Kaguya",
          "Yumeko",
          "Kurumi",
          "Mai",
          "Yor",
          "Shinbou",
          "Eiko",
        ];
        const botLogos = [
          "https://wallpapercave.com/wp/wp5924545.jpg",
          "https://wallpapercave.com/wp/wp11253614.jpg",
          "https://images5.alphacoders.com/126/1264439.jpg",
          "https://i0.wp.com/metagalaxia.com.br/wp-content/uploads/2022/11/Chainsaw-Man-Denji-e-Power.webp?resize=1068%2C601&ssl=1",
          "https://images3.alphacoders.com/949/949253.jpg",
          "https://images4.alphacoders.com/100/1002134.png",
          "https://wallpapercave.com/wp/wp10524580.jpg",
          "https://images2.alphacoders.com/125/1257915.jpg",
          "https://wallpapers.com/images/file/kiyotaka-ayanokoji-in-pink-qs33qgqm79ccsq7n.jpg",
          "https://wallpapercave.com/wp/wp8228630.jpg",
          "https://images3.alphacoders.com/128/1288059.png",
          "https://images.alphacoders.com/711/711900.png",
          "https://moewalls.com/wp-content/uploads/2022/07/sumi-sakurasawa-hmph-rent-a-girlfriend-thumb.jpg",
          "https://wallpapercave.com/wp/wp6099650.png",
          "https://wallpapercave.com/wp/wp5017991.jpg",
          "https://wallpapercave.com/wp/wp2535489.jpg",
          "https://images4.alphacoders.com/972/972790.jpg",
          "https://images7.alphacoders.com/123/1236729.jpg",
          "https://wallpapercave.com/wp/wp4650481.jpg",
          "https://images8.alphacoders.com/122/1229829.jpg",
        ];

        checkChar = await getChar();
        if (checkChar === intinput) {
          await doReact("✅");
          return Atlas.sendMessage(
            m.from,
            {
              image: { url: botLogos[intinput] },
              caption: `Karakter numarası *${intinput}* - *${botNames[intinput]}* zaten varsayılan !`,
            },
            { quoted: m }
          );
        }
        await doReact("✅");
        await setChar(intinput);
        await Atlas.sendMessage(
          m.from,
          {
            image: { url: botLogos[intinput] },
            caption: `karakter numarası *${intinput}* - *${botNames[intinput]}* tarafından ayarlandı *${pushName}*`,
          },
          { quoted: m }
        );
        break;

      case "dmchatbot":
      case "pmchatbot":
        if (!text) {
          await doReact("❌");
          return m.reply(
            `Lütfen Açma / Kapama eylemi sağlayın !\n\n*Örnek:*\n\n${prefix}pmchatbot on` 
          );
        }
        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Üzgünüz, yalnızca *Sahipler* ve *Modlar* bu komutu kullanabilir !`,
            quoted: m,
          });
        }
        pmChatBotStatus = await checkPmChatbot();
        await doReact("🧩");
        if (args[0] === "on") {
          if (pmChatBotStatus) {
            await doReact("❌");
            return Atlas.sendMessage(m.from, {
              text: `Özel Chatbot zaten *Etkin* !`,
              quoted: m,
            });
          } else {
            await activateChatBot();
            await m.reply(
              `*PM Chatbot* Başarıyla *Etkinleştirildi*! \n\nBot, PM'deki tüm sohbetlere cevap verecek !`
            );
          }
        } else if (args[0] === "off") {
          if (!pmChatBotStatus) {
            await doReact("❌");
            return Atlas.sendMessage(m.from, {
              text: `Özel Chatbot zaten *Devre dışı* !`,
              quoted: m,
            });
          } else {
            await deactivateChatBot();
            await m.reply(`*PM Chatbot* başarıyla *Devre dışı* bırakıldı !`);
          }
        } else {
          await doReact("❌");
          return m.reply(
            `Lütfen Açma / Kapama eylemi sağlayın !\n\n*Örnek:*\n\n${prefix}pmchatbot on`
          );
        }

        break;

      case "bangroup":
      case "bangc":
        if (!m.isGroup) {
          await doReact("❌");
          return m.reply(`Bu komut sadece gruplarda kullanılabilir !`);
        }

        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Üzgünüz, yalnızca *Sahipler* ve *Modlar* bu komutu kullanabilir !`,
            quoted: m,
          });
        }

        groupBanStatus = await checkBanGroup(m.from);
        if (groupBanStatus) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `This group is already *Banned* !`,
            quoted: m,
          });
        } else {
          await doReact("🧩");
          await banGroup(m.from);
          await m.reply(`*${groupName}* Başarıyla *Yasaklandı* !`);
        }

        break;

      case "unbangroup":
      case "unbangc":
        if (!m.isGroup) {
          await doReact("❌");
          return m.reply(`Bu komut sadece gruplarda kullanılabilir !`);
        }

        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Üzgünüz, sadece *Sahipler* ve *Modlar* bu komutu kullanabilir !`,
            quoted: m,
          });
        }

        groupBanStatus = await checkBanGroup(m.from);
        if (!groupBanStatus) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Bu grup yasaklı değil !`,
            quoted: m,
          });
        } else {
          await doReact("🧩");
          await unbanGroup(m.from);
          await m.reply(`*${groupName}* *Yasağı Kaldırıldı* Başarıyla !`);
        }

        break;

      case "setbotmode":
      case "mode":
        if (!text) {
          await doReact("❌");
          return m.reply(
            `lütfen *Self / Private / Public* mod adlarını girin  !\n\n*Örnek:*\n\n${prefix}mode public`
          );
        }

        chechSenderModStatus = await checkMod(m.sender);
        if (!chechSenderModStatus && !isCreator && !isintegrated) {
          await doReact("❌");
          return Atlas.sendMessage(m.from, {
            text: `Üzgünüz, yalnızca *Sahipler* ve *Modlar* bu komutu kullanabilir !`,
            quoted: m,
          });
        }

        chechbotMode = await getBotMode();

        if (args[0] == "self") {
          if (chechbotMode == "self") {
            await doReact("❌");
            return m.reply(
              `Bot zaten *Kendi* modunda\n\n*Sadece bot sahibi kullanabilir.`
            );
          } else {
            await doReact("🧩");
            await setBotMode("self");
            await m.reply(`Bot Başarıyla *Kendi* moduna ayarlandı !`);
          }
        } else if (args[0] == "private") {
          if (chechbotMode == "private") {
            await doReact("❌");
            return m.reply(
              `Bot zaten *Özel* modda!`
            );
          } else {
            await doReact("🧩");
            await setBotMode("private");
            await m.reply(`Bot Başarıyla *Gizli* moda ayarlandı !`);
          }
        } else if (args[0] == "public") {
          if (chechbotMode == "public") {
            await doReact("❌");
            return m.reply(
              `Bot is already in *Public* mode !\n\nAnyone can use bot.`
            );
          } else {
            await doReact("🧩");
            await setBotMode("public");
            await m.reply(`Bot zaten *Genel* modunda!\n\nBot'u herkes kullanabilir.`);
          }
        } else {
          await doReact("❌");
          return m.reply(
            `Lütfen *Self / Private / Public* mod adları girin !\n\n*Örnek:*\n\n${prefix}mode public`
          );
        }

        break;

      default:
        break;
    }
  },
};
