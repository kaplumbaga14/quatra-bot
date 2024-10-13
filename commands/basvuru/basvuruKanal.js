const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setSetting } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('başvuru-kanal')
        .setDescription('Başvuru kanalını ayarla')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Başvuruların gönderileceği kanal')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');
        await setSetting('basvuruKanal', channel.id);
        await interaction.reply(`Başvuru kanalı ${channel} olarak ayarlandı.`);
    },
};
