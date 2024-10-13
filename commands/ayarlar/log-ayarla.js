const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setSetting } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log-ayarla')
        .setDescription('Çeşitli log kanallarını ayarla')
        .addSubcommand(subcommand =>
            subcommand
                .setName('genel')
                .setDescription('Genel log kanalını ayarla')
                .addChannelOption(option => option.setName('kanal').setDescription('Genel log kanalı').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('basvuru')
                .setDescription('Başvuru log kanalını ayarla')
                .addChannelOption(option => option.setName('kanal').setDescription('Başvuru log kanalı').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('basvuru-onay')
                .setDescription('Başvuru onay log kanalını ayarla')
                .addChannelOption(option => option.setName('kanal').setDescription('Başvuru onay log kanalı').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('moderasyon')
                .setDescription('Moderasyon log kanalını ayarla')
                .addChannelOption(option => option.setName('kanal').setDescription('Moderasyon log kanalı').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('kanal');

        let settingKey;
        let logType;

        switch (subcommand) {
            case 'genel':
                settingKey = 'genelLogKanal';
                logType = 'Genel';
                break;
            case 'basvuru':
                settingKey = 'basvuruLogKanal';
                logType = 'Başvuru';
                break;
            case 'basvuru-onay':
                settingKey = 'basvuruOnayLogKanal';
                logType = 'Başvuru onay';
                break;
            case 'moderasyon':
                settingKey = 'moderasyonLogKanal';
                logType = 'Moderasyon';
                break;
        }

        await setSetting(settingKey, channel.id);
        await interaction.reply(`${logType} log kanalı ${channel} olarak ayarlandı.`);
    },
};
