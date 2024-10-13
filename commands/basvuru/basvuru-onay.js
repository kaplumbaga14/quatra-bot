const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setSetting } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('basvuru-onay')
        .setDescription('Başvuru onay kanalını ayarla')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Başvuru onaylarının gönderileceği kanal')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');
        await setSetting('basvuruOnayKanal', channel.id);
        await interaction.reply(`Başvuru onay kanalı ${channel} olarak ayarlandı.`);
    },
};
