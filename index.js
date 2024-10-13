const {
    Client,
    Collection,
    GatewayIntentBits,
    EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const { getSetting } = require("./database");
const express = require("express");
const app = express();
const port = 3100;

app.get("/", (req, res) => res.send("we discord"));

app.listen(port, () =>
    console.log(`Bot bu adres üzerinde çalışıyor: http://localhost:${port}`),
);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

const {
    handleStartApplication,
    handleApplicationSubmit,
    handleApplicationResponse,
} = require("./commands/basvuru/basvuru");

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "Komut yürütülürken bir hata oluştu!",
                ephemeral: true,
            });
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === "start_application") {
            await handleStartApplication(interaction);
        } else if (
            interaction.customId.startsWith("kabul_") ||
            interaction.customId.startsWith("red_")
        ) {
            await handleApplicationResponse(interaction);
        }
    } else if (
        interaction.isModalSubmit() &&
        interaction.customId === "application_modal"
    ) {
        await handleApplicationSubmit(interaction);
    }
});

client.once("ready", () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    loadSlashCommands();
});

async function loadSlashCommands() {
    const commandsPath = path.join(__dirname, "commands");
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs
            .readdirSync(folderPath)
            .filter((file) => file.endsWith(".js"));
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);
            if ("data" in command && "execute" in command) {
                await client.application.commands.create(command.data);
                console.log(`Yüklenen komut: ${command.data.name}`);
            } else {
                console.log(
                    `[UYARI] ${filePath} komutunda gerekli "data" veya "execute" özelliği eksik.`,
                );
            }
        }
    }
}

client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;
    const logChannel = await getLogChannel(oldMessage.guild, "genelLogKanal");
    if (logChannel) {
        const embed = new EmbedBuilder()
            .setTitle("Mesaj Düzenlendi")
            .setColor("#00ff00")
            .setDescription(
                `**Kanal:** ${oldMessage.channel}\n**Yazar:** ${oldMessage.author.tag}\n**Eski Mesaj:** ${oldMessage.content}\n**Yeni Mesaj:** ${newMessage.content}`,
            )
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
});

client.on("guildBanAdd", async (ban) => {
    const logChannel = await getLogChannel(ban.guild, "moderasyonLogKanal");
    if (logChannel) {
        const embed = new EmbedBuilder()
            .setTitle("Kullanıcı Banlandı")
            .setColor("#ff0000")
            .setDescription(
                `**Kullanıcı:** ${ban.user.tag}\n**Sebep:** ${ban.reason || "Sebep belirtilmedi"}`,
            )
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
});

client.on("guildBanRemove", async (ban) => {
    const logChannel = await getLogChannel(ban.guild, "moderasyonLogKanal");
    if (logChannel) {
        const embed = new EmbedBuilder()
            .setTitle("Kullanıcı Banı Kaldırıldı")
            .setColor("#00ff00")
            .setDescription(
                `**Kullanıcı:** ${ban.user.tag}\n**Sebep:** ${ban.reason || "Sebep belirtilmedi"}`,
            )
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
});
client.on("guildMemberRemove", async (member) => {
    const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: "MEMBER_KICK",
    });
    const kickLog = fetchedLogs.entries.first();

    if (kickLog && kickLog.target.id === member.id) {
        const logChannel = await getLogChannel(
            member.guild,
            "moderasyonLogKanal",
        );
        if (logChannel) {
            const { executor, reason } = kickLog;
            const embed = new EmbedBuilder()
                .setTitle("Kullanıcı Kicklendi")
                .setColor("#ff9900")
                .setDescription(
                    `**Kullanıcı:** ${member.user.tag}\n**Kickleyen:** ${executor.tag}\n**Sebep:** ${reason || "Sebep belirtilmedi"}`,
                )
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
    }
});

async function getLogChannel(guild, settingKey) {
    try {
        const channelId = await getSetting(settingKey);
        console.log(`${settingKey} için alınan kanal ID:`, channelId);

        if (channelId) {
            const channel = await guild.channels.fetch(channelId);
            console.log(
                `Bulunan kanal:`,
                channel ? channel.name : "Kanal bulunamadı",
            );
            return channel;
        } else {
            console.log(`${settingKey} için kanal ID'si bulunamadı`);
        }
    } catch (error) {
        console.error(`Log kanalı alınırken hata oluştu:`, error);
    }
    return null;
}

client.on("messageDelete", async (message) => {
    if (message.author.bot) return;

    try {
        const logChannel = await getLogChannel(message.guild, "genelLogKanal");
        console.log(
            "Silinen mesaj için log kanalı:",
            logChannel ? logChannel.name : "Bulunamadı",
        );

        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle("Mesaj Silindi")
                .setColor("#ff0000")
                .setDescription(
                    `**Kanal:** ${message.channel}\n**Yazar:** ${message.author.tag}\n**Mesaj:** ${message.content}`,
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
            console.log("Log mesajı gönderildi");
        } else {
            console.log("Log kanalı bulunamadı, mesaj gönderilemedi");
        }
    } catch (error) {
        console.error("Mesaj silme logu gönderilirken hata oluştu:", error);
    }
});

client.login(config.token);
