const fs = require("fs");
const Jimp = require("jimp");
const moment = require("moment-timezone");
const {
  setWelcome, // ------------------- SET WELCOME MESSAGE
  checkWelcome, // ----------------- CHECK WELCOME MESSAGE STATUS
  delWelcome, // ------------------- DELETE WELCOME MESSAGE
  setAntilink, // ------------------ SET ANTILINK
  checkAntilink, // ---------------- CHECK ANTILINK STATUS
  delAntilink, // ------------------ DELETE ANTILINK
  setGroupChatbot, // -------------- SET GROUP CHATBOT
  checkGroupChatbot, // ------------ CHECK GROUP CHATBOT STATUS
  delGroupChatbot,
} = require("../System/MongoDB/MongoDb_Core");
let mergedCommands = [
  "admins",
  "admin",
  "setgcname",
  "delete",
  "antilink",
  "welcome",
  "del",
  "demote",
  "gclink",
  "grouplink",
  "group",
  "gc",
  "groupinfo",
  "gcinfo",
  "hidetag",
  "htag",
  "leave",
  "promote",
  "remove",
  "revoke",
  "setgcdesc",
  "setppgc",
  "tagall",
  "chatbotgc",
  "antilink",
  "welcome",
];

module.exports = {
  name: "groupanagement",
  alias: [...mergedCommands],
  uniquecommands: [
    "admins",
    "setgcname",
    "delete",
    "demote",
    "gclink",
    "antilink",
    "welcome",
    "group",
    "gc",
    "gcinfo",
    "tagall",
    "hidetag",
    "leave",
    "promote",
    "remove",
    "revoke",
    "setgcdesc",
    "setppgc",
    "chatbotgc",
  ],
  description: "Tüm Ses Düzenleme Komutları",
  start: async (
    Atlas,
    m,
    {
      inputCMD,
      text,
      prefix,
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
    }
  ) => {
    let messageSender = m.sender;
    let quotedsender = m.quoted ? m.quoted.sender : mentionByTag[0];
    switch (inputCMD) {
      case "admins":
      case "admin":
        if (!isMedia) {
          message = m.quoted ? m.quoted.msg : "『 *Adminlerin Dikkatine* 』";
        } else {
          message =
            "『 *Adminlerin Dikkatine* 』\n\n*🎀 Mesaj:* Şuna bakın hemen !";
        }
        await doReact("🏅");
        Atlas.sendMessage(
          m.from,
          { text: message, mentions: groupAdmin },
          { quoted: m }
        );
        break;

      case "setgcname":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`Bu Komutu kullanabilmek için *Yönetici* olmalısınız!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* bu Komutu kullanabilmek için *Yönetici* olmalıdır!`);
        }
        if (!text) {
          await doReact("❔");
          return m.reply(
            `Lütfen yeni bir grup adı girin !`
          );
        }
        await doReact("🎐");

        oldGCName = metadata.subject;

        try {
          ppgc = await Atlas.profilePictureUrl(m.from, "image");
        } catch {
          ppgc = botImage1;
        }

        await Atlas.groupUpdateSubject(m.from, text)
          .then((res) =>
            Atlas.sendMessage(
              m.from,
              {
                image: { url: ppgc, mimetype: "image/jpeg" },
                caption: `*『 Grup adı güncellendi 』*\n\n_Eski ad:_\n*${oldGCName}*\n\n_🔷 Yeni ad:_\n*${text}*\n`,
              },
              { quoted: m }
            )
          )
          .catch((err) => replay(jsonformat(err)));
        break;

      case "delete":
      case "del":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`*Bu Komutu kullanabilmek için *Yönetici* olmalısınız!`);
        }
        if (!m.quoted) {
          await doReact("❔");
          return m.reply(`Bir mesajı silmek için lütfen *Yanıtlayın* !`);
        }
        if (!isBotAdmin) {
          if (!m.quoted.sender.includes(botNumber)) {
            await doReact("❌");
            return m.reply(
              `Üzgünüm, *Yönetici* izni olmadan sadece kendi mesajlarımı silebilirim!`
            );
          }
          key = {
            remoteJid: m.from,
            fromMe: true,
            id: m.quoted.id,
          };
          await doReact("📛");
          await Atlas.sendMessage(m.from, { delete: key });
        } else {
          if (!isAdmin) {
            await doReact("❌");
            return m.reply(
              `Üzgünüz, yalnızca *Yöneticiler* başkalarının mesajlarını silebilir !`
            );
          }
          key = {
            remoteJid: m.from,
            fromMe: false,
            id: m.quoted.id,
            participant: m.quoted.sender,
          };

          await Atlas.sendMessage(m.from, { delete: key });
        }

        break;

      case "demote":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`Bu Komutu kullanabilmek için *Yönetici* olmalısınız!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* bu Komutu kullanabilmek için *Yönetici* olmalıdır!`);
        }
        if (quotedsender.includes(m.sender)) {
          await doReact("❌");
          return m.reply(`Kendi rütbenizi düşüremezsiniz!`);
        }
        if (quotedsender.includes(botNumber)) {
          await doReact("❌");
          return m.reply(`Üzgünüm, rütbemi düşüremiyorum !`);
        }

        if (!text && !m.quoted) {
          await doReact("❔");
          return m.reply(`Lütfen bir kullanıcıyı *Düşürmek* için etiketleyin!`);
        } else if (m.quoted) {
          mentionedUser = m.quoted.sender;
        } else {
          mentionedUser = mentionByTag[0];
        }

        userId = (await mentionedUser) || m.msg.contextInfo.participant;
        if (!groupAdmin.includes(userId)) {
          return Atlas.sendMessage(
            m.from,
            {
              text: `@${
                mentionedUser.split("@")[0]
              } sözü edilen kullanıcı bu grupta *Admin* değil !`,
              mentions: [mentionedUser],
            },
            { quoted: m }
          );
        }
        await doReact("📉");
        try {
          await Atlas.groupParticipantsUpdate(m.from, [userId], "demote").then(
            (res) =>
              Atlas.sendMessage(
                m.from,
                {
                  text: `Üzgünüm @${
                    mentionedUser.split("@")[0]
                  } tarafından yetkiniz alındı @${
                    messageSender.split("@")[0]
                  } !`,
                  mentions: [mentionedUser, messageSender],
                },
                { quoted: m }
              )
          );
        } catch (error) {
          await doReact("❌");
          Atlas.sendMessage(
            m.from,
            {
              text: `bir kullanıcıyı *Düşürmek* için etiketleyin! @${
                mentionedUser.split("@")[0]
              } Senpai !\n\n*Error:* ${error}`,
              mentions: [mentionedUser],
            },
            { quoted: m }
          );
        }

        break;

      case "gclink":
      case "grouplink":
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* bu Komutu kullanabilmek için *Yönetici* olmalıdır!`);
        }
        await doReact("🧩");
        let link = await Atlas.groupInviteCode(m.from);
        let linkcode = `https://chat.whatsapp.com/${link}`;

        try {
          ppgc = await Atlas.profilePictureUrl(m.from, "image");
        } catch {
          ppgc = botImage1;
        }

        try {
          await Atlas.sendMessage(
            m.from,
            {
              image: { url: ppgc, mimetype: "image/jpeg" },
              caption: `\n_🎀 Grup adı:_ *${metadata.subject}*\n\n_🧩 Grup bağlantısı:_\n${linkcode}\n`,
            },
            { quoted: m }
          );
        } catch (err) {
          Atlas.sendMessage(
            m.from,
            { text: `${mess.botadmin}` },
            { quoted: m }
          );
        }
        break;

      case "group":
      case "gc":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`Bu Komutu kullanabilmek için *Yönetici* olmalısınız!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* bu Komutu kullanabilmek için *Yönetici* olmalıdır!`);
        }
        await doReact("⚜️");

        if (text === "close") {
          await Atlas.groupSettingUpdate(m.from, "announcement").then((res) =>
            m.reply(`Grup kapatıldı!`)
          );
        } else if (text === "open") {
          await Atlas.groupSettingUpdate(m.from, "not_announcement").then(
            (res) => m.reply(`Grup açıldı!`)
          );
        } else {
          await Atlas.sendMessage(
            m.from,
            {
              image: { url: botImage2 },
              caption: `\n*「 Group Mesaj Ayarları 」*\n\nBşr swçwnek belirtiniz.\n\n*_Usage:_*\n\n*${prefix}group open*\n*${prefix}group close*\n`,
            },
            { quoted: m }
          );
        }

        break;

      case "groupinfo":
      case "gcinfo":
        if (!m.isGroup) {
          await doReact("❌");
          return m.reply(`Bu komut sadece gruplarda kullanılabilir!`);
        }
        await doReact("🎊");
        try {
          ppgc = await Atlas.profilePictureUrl(m.from, "image");
        } catch {
          ppgc = botImage1;
        }
        participants = m.isGroup ? await metadata.participants : "";
        groupAdmins = m.isGroup
          ? await participants.filter((v) => v.admin !== null).map((v) => v.id)
          : "";
        groupOwner = m.isGroup ? metadata.owner : "";
        desc = metadata.desc ? metadata.desc : "Açıklama yok";
        let txt = `                 *『 Grup Bilgisi 』*\n\n_Açıklama Adı:_ *${
          metadata.subject
        }*\n\n_🧩 Grup Açıklaması:_\n${desc}\n\n_👑 Grup Sahibi:_ @${
          metadata.owner.split("@")[0]
        }\n_💫 Grup Oluşturma Tarihi:_ *${moment(`${metadata.creation}` * 1000)
          .tz("Asia/Kolkata")
          .format("DD/MM/YYYY")}*\n_📛 Toplam admin :_ *${
          groupAdmins.length
        }*\n_🎈 Toplam katılımcı:_ *${metadata.participants.length}*\n`;

        await Atlas.sendMessage(
          m.from,
          {
            image: { url: ppgc, mimetype: "image/jpeg" },
            caption: txt,
            mentions: [metadata.owner],
          },
          { quoted: m }
        );
        break;

      case "hidetag":
      case "htag":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`Bu Komutu kullanabilmek için *Yönetici* olmalısınız!`);
        }
        if (!isMedia) {
          message2 = m.quoted
            ? m.quoted.msg
            : args[0]
            ? args.join(" ")
            : "『 *Herkesin Dikkatine* 』";
        } else {
          message2 =
            "『 *Herkesin Dikkatine* 』\n\n*🎀 Mesaj:* Buna Bakın!";
        }

        await doReact("🎌");
        Atlas.sendMessage(
          m.from,
          { text: message2, mentions: participants.map((a) => a.id) },
          { quoted: m }
        );
        break;

      case "leave":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`Bu Komutu kullanabilmek için *Yönetici* olmalısınız!`);
        }
        await doReact("👋");
        await Atlas.sendMessage(m.from, {
          image: { url: "https://wallpapercave.com/wp/wp9667218.png" },
          caption: `Arkadaşlar hakkınızı helal edin ben gidiyorum... \n\nAllaha emanet :)`,
          mentions: participants.map((a) => a.id),
          quoted: m,
        }).then(async () => {
          Atlas.groupLeave(m.from).catch((e) => {
            Atlas.sendMessage(
              m.from,
              { text: `Bir hata oluştu !` },
              { quoted: m }
            );
          });
        });
        break;

      case "promote":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`Bu Komutu kullanabilmek için *Yönetici* olmalısınız!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* bu Komutu kullanabilmek için *Yönetici* olmalıdır!`);
        }
        if (quotedsender.includes(m.sender)) {
          await doReact("❌");
          return m.reply(`Zaten bu grubun *Yöneticisi*siniz!`);
        }
        if (quotedsender.includes(botNumber)) {
          await doReact("❌");
          return m.reply(`Ben zaten bu grubun *Yöneticisiyim*!`);
        }

        if (!text && !m.quoted) {
          await doReact("❔");
          return m.reply(`Bir kullanıcıyı etiketleyiniz !`);
        } else if (m.quoted) {
          mentionedUser = m.quoted.sender;
        } else {
          mentionedUser = mentionByTag[0];
        }

        userId = (await mentionedUser) || m.msg.contextInfo.participant;
        if (groupAdmin.includes(userId)) {
          return Atlas.sendMessage(
            m.from,
            {
              text: `@${
                mentionedUser.split("@")[0]
              } bi dk zaten bu grubun yöneticisisin !`,
              mentions: [mentionedUser],
            },
            { quoted: m }
          );
        }
        await doReact("💹");
        try {
          await Atlas.groupParticipantsUpdate(m.from, [userId], "promote").then(
            (res) =>
              Atlas.sendMessage(
                m.from,
                {
                  text: `Congratulations  @${
                    mentionedUser.split("@")[0]
                  } tebrikler 🥳, seni kutsadım @${
                    messageSender.split("@")[0]
                  } !`,
                  mentions: [mentionedUser, messageSender],
                },
                { quoted: m }
              )
          );
        } catch (error) {
          Atlas.sendMessage(
            m.from,
            {
              text: `indirilmeye 
              çalışılırken bir hata oluştu. @${
                mentionedUser.split("@")[0]
              } Senpai !\n\n*Error:* ${error}`,
              mentions: [mentionedUser],
            },
            { quoted: m }
          );
        }

        break;

      case "remove":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`*You* must be *Admin* in order to use this Command!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* must be *Admin* in order to use this Command!`);
        }
        if (quotedsender.includes(m.sender)) {
          await doReact("❌");
          return m.reply(`You cannot *Remove* yourself from this group !`);
        }
        if (quotedsender.includes(botNumber)) {
          await doReact("❌");
          return m.reply(`I cannot *Remove* myself from this group !`);
        }

        if (!text && !m.quoted) {
          await doReact("❔");
          return Atlas.sendMessage(
            m.from,
            { text: `Please tag a user to *Remove* !` },
            { quoted: m }
          );
        } else if (m.quoted) {
          var mentionedUser = m.quoted.sender;
        } else {
          var mentionedUser = mentionByTag[0];
        }

        let users = (await mentionedUser) || m.msg.contextInfo.participant;
        await doReact("⛔");
        if (groupAdmin.includes(users)) {
          return Atlas.sendMessage(
            m.from,
            {
              text: `*Command Rejected !* @${
                mentionedUser.split("@")[0]
              } Senpai is an *Admin* of this group so you are not allowed to remove him !`,
              mentions: [mentionedUser],
            },
            { quoted: m }
          );
        }

        await Atlas.groupParticipantsUpdate(m.from, [users], "remove").then(
          (res) =>
            Atlas.sendMessage(
              m.from,
              {
                text: `@${
                  mentionedUser.split("@")[0]
                } has been *Removed* Successfully from *${metadata.subject}*`,
                mentions: [mentionedUser],
              },
              { quoted: m }
            )
        );

        break;

      case "setppgc":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`*You* must be *Admin* in order to use this Command!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* must be *Admin* in order to use this Command!`);
        }

        if (!/image/.test(mime)) {
          await doReact("❌");
          return Atlas.sendMessage(
            m.from,
            {
              text: `Send/reply Image With Caption ${
                prefix + "setgcpp"
              } to change the Profile Pic of this group.`,
            },
            { quoted: m }
          );
        }
        await doReact("🎴");

        let quotedimage = await Atlas.downloadAndSaveMediaMessage(quoted);
        var { preview } = await generatePP(quotedimage);

        await Atlas.query({
          tag: "iq",
          attrs: {
            to: m.from,
            type: "set",
            xmlns: "w:profile:picture",
          },
          content: [
            {
              tag: "picture",
              attrs: { type: "image" },
              content: preview,
            },
          ],
        });
        fs.unlinkSync(quotedimage);

        ppgc = await Atlas.profilePictureUrl(m.from, "image");

        Atlas.sendMessage(
          m.from,
          {
            image: { url: ppgc },
            caption: `\nGroup Profile Picture has been updated Successfully by @${
              messageSender.split("@")[0]
            } !`,
            mentions: [messageSender],
          },
          { quoted: m }
        );

        break;

      case "setgcdesc":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`*You* must be *Admin* in order to use this Command!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* must be *Admin* in order to use this Command!`);
        }

        if (!text && !m.quoted) {
          await doReact("❔");
          return Atlas.sendMessage(
            m.from,
            { text: `Please provide a new group description !` },
            { quoted: m }
          );
        }

        await doReact("📑");

        try {
          ppgc = await Atlas.profilePictureUrl(m.from, "image");
        } catch {
          ppgc = botImage1;
        }

        var newGCdesc = m.quoted ? m.quoted.msg : text;

        await Atlas.groupUpdateDescription(m.from, newGCdesc).then((res) =>
          Atlas.sendMessage(
            m.from,
            {
              image: { url: ppgc, mimetype: "image/jpeg" },
              caption: `*『 Group Description Changed 』*\n\n_🧩 New Description:_\n*${newGCdesc}*`,
            },
            { quoted: m }
          )
        );

        break;

      case "revoke":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`*You* must be *Admin* in order to use this Command!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* must be *Admin* in order to use this Command!`);
        }

        if (m.from == "120363040838753957@g.us") {
          await doReact("❌");
          return m.reply(
            "Sorry, this command is not allowed in *Atlas Support Group* !\n\nYou are not allowed to change support group link !"
          );
        }
        await doReact("💫");

        await Atlas.groupRevokeInvite(m.from).then((res) =>
          Atlas.sendMessage(
            m.from,
            { text: `Group link has been *Updated* Successfully!` },
            { quoted: m }
          )
        );

        break;

      case "tagall":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`*You* must be *Admin* in order to use this Command!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* must be *Admin* in order to use this Command!`);
        }
        if (!isMedia) {
          var message2 = m.quoted
            ? m.quoted.msg
            : args[0]
            ? args.join(" ")
            : "No message";
        } else {
          message2 = "Check this Out !";
        }

        let mess = `            『 *Attention Everybody* 』
    
*⚜️ Tagged by:* @${m.sender.split("@")[0]}
            
*🧩 Message:* ${message2};
│\n`;
        for (let mem of participants) {
          mess += `┟ @${mem.id.split("@")[0]}\n`;
        }
        mess += `╰────────────⊰\n\n                    *Thank You*\n`;

        await doReact("〽️");
        Atlas.sendMessage(
          m.from,
          { text: mess, mentions: participants.map((a) => a.id) },
          { quoted: m }
        );

        break;

      case "chatbotgc":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`*You* must be *Admin* in order to use this Command!`);
        }

        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide On / Off action !\n\n*Example:*\n\n${prefix}chatbotgc on`
          );
        }
        chatbotGCStatus = await checkGroupChatbot(m.from);
        if (args[0] == "on") {
          if (chatbotGCStatus) {
            await doReact("❌");
            return m.reply(`*Group Chatbot* is already *Enabled* !`);
          }
          await doReact("🧩");
          await setGroupChatbot(m.from);
          await m.reply(
            `*Group Chatbot* has been *Enabled* Successfully ! \n\nBot will not reply to messages where bot is mentioned!`
          );
        } else if (args[0] == "off") {
          if (!chatbotGCStatus) {
            await doReact("❌");
            return m.reply(`*Group Chatbot* is already *Disabled* !`);
          }
          await doReact("🧩");
          await delGroupChatbot(m.from);
          await m.reply(`*Group Chatbot* has been *Disabled* Successfully !`);
        } else {
          await doReact("❔");
          return m.reply(
            `Please provide On / Off action !\n\n*Example:*\n\n${prefix}chatbotgc on`
          );
        }

        break;

      case "antilink":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`*You* must be *Admin* in order to use this Command!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* must be *Admin* in order to use this Command!`);
        }

        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide On / Off action !\n\n*Example:*\n\n${prefix}antilink on`
          );
        }
        antilinkStatus = await checkAntilink(m.from);
        if (args[0] == "on") {
          if (antilinkStatus) {
            await doReact("❌");
            return m.reply(`*Antilink* is already *Enabled* !`);
          }
          await doReact("⚜️");
          await setAntilink(m.from);
          await m.reply(
            `*Antilink* has been *Enabled* Successfully ! \n\nBot will remove all links from messages!`
          );
        } else if (args[0] == "off") {
          if (!antilinkStatus) {
            await doReact("❌");
            return m.reply(`*Antilink* is already *Disabled* !`);
          }
          await doReact("⚜️");
          await delAntilink(m.from);
          await m.reply(`*Antilink* has been *Disabled* Successfully !`);
        } else {
          await doReact("❔");
          return m.reply(
            `Please provide On / Off action !\n\n*Example:*\n\n${prefix}antilink on`
          );
        }

        break;

      case "welcome":
        if (!isAdmin) {
          await doReact("❌");
          return m.reply(`*You* must be *Admin* in order to use this Command!`);
        }
        if (!isBotAdmin) {
          await doReact("❌");
          return m.reply(`*Bot* must be *Admin* in order to use this Command!`);
        }

        if (!text) {
          await doReact("❔");
          return m.reply(
            `Please provide On / Off action !\n\n*Example:*\n\n${prefix}welcome on`
          );
        }
        const welcomeStatus = await checkWelcome(m.from);
        if (args[0] == "on") {
          if (welcomeStatus) {
            await doReact("❌");
            return m.reply(`*Welcome* is already *Enabled* !`);
          }
          await doReact("🎀");
          await setWelcome(m.from);
          await m.reply(
            `*Welcome/Goodbye* messages are *Enabled* Successfully !`
          );
        } else if (args[0] == "off") {
          if (!welcomeStatus) {
            await doReact("❌");
            return m.reply(`*Welcome* is already *Disabled* !`);
          }
          await doReact("🎀");
          await delWelcome(m.from);
          await m.reply(
            `*Welcome/Goodbye* messages are *Disabled* Successfully !`
          );
        } else {
          await doReact("❔");
          return m.reply(
            `Please provide On / Off action !\n\n*Example:*\n\n${prefix}welcome on`
          );
        }

        break;

      default:
        break;
    }
  },
};

async function generatePP(buffer) {
  const jimp = await Jimp.read(buffer);
  const min = jimp.getWidth();
  const max = jimp.getHeight();
  const cropped = jimp.crop(0, 0, min, max);
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG),
  };
}
