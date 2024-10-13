const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setSetting } = require('../../database');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mulakat-kanal-2')
        .setDescription('İkinci mülakat kanalını ayarla')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('İkinci mülakat ses kanalı')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');
        await setSetting('mulakatKanal2', channel.id);
        await interaction.reply(`İkinci mülakat kanalı ${channel} olarak ayarlandı.`);
    },
};
