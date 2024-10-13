const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setSetting } = require('../../database');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('duyuru-kanal')
        .setDescription('Duyuru kanalını ayarla')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Duyuruların gönderileceği kanal')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');
        await setSetting('duyuruKanal', channel.id);
        await interaction.reply(`Duyuru kanalı ${channel} olarak ayarlandı.`);
    },
};
