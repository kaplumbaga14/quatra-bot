const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setSetting } = require('../../database');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mulakat-yetkilisi')
        .setDescription('Mülakat yetkilisi rolünü ayarla')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Mülakat yetkilisi rolü')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const role = interaction.options.getRole('rol');
        await setSetting('mulakatYetkilisiRolu', role.id);
        await interaction.reply(`Mülakat yetkilisi rolü ${role} olarak ayarlandı.`);
    },
};
