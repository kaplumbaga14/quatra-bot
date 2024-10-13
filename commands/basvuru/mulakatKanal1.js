const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setSetting } = require('../../database');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mulakat-kanal-1')
        .setDescription('İlk mülakat kanalını ayarla')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('İlk mülakat ses kanalı')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');
        await setSetting('mulakatKanal1', channel.id);
        await interaction.reply(`İlk mülakat kanalı ${channel} olarak ayarlandı.`);
    },
};
