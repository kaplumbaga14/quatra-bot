const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getSetting } = require('../../database');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('toplan')
        .setDescription('Acil durum çağrısı yapar')
        .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone),

    async execute(interaction) {
        const duyuruKanalId = await getSetting('duyuruKanal');
        
        if (!duyuruKanalId) {
            return interaction.reply({ content: 'Duyuru kanalı ayarlanmamış.', ephemeral: true });
        }

        const duyuruKanal = await interaction.guild.channels.fetch(duyuruKanalId);
        
        if (!duyuruKanal) {
            return interaction.reply({ content: 'Duyuru kanalı bulunamadı.', ephemeral: true });
        }

        const message = 'SESTE TOPLAN TOPLAN TOPLAN SERİSİNDEN PATLIYOZ @everyone';

        try {
            await duyuruKanal.send(message);
            await interaction.reply({ content: 'Acil durum çağrısı yapıldı!', ephemeral: true });
        } catch (error) {
            console.error('Mesaj gönderilemedi:', error);
            await interaction.reply({ content: 'Bir hata oluştu, mesaj gönderilemedi.', ephemeral: true });
        }
    },
};
