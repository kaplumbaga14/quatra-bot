const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { setSetting, getSetting } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('basvuru-log')
        .setDescription('Başvuru log kanalını ayarla')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Başvuru loglarının gönderileceği kanal')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');
        await setSetting('basvuruLogKanal', channel.id);
        await interaction.reply(`Başvuru log kanalı ${channel} olarak ayarlandı.`);
    },
};

async function handleStartApplication(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('application_modal')
        .setTitle('Ekip Başvuru Formu');

    const nameInput = new TextInputBuilder()
        .setCustomId('name')
        .setLabel('İsminiz nedir?')
        .setStyle(TextInputStyle.Short);

    const ageInput = new TextInputBuilder()
        .setCustomId('age')
        .setLabel('Yaşınız kaç?')
        .setStyle(TextInputStyle.Short);

    const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Ekibe neden katılmak istiyorsunuz?')
        .setStyle(TextInputStyle.Paragraph);

    const activityInput = new TextInputBuilder()
        .setCustomId('activity')
        .setLabel('Aktiflik süreniz ne kadar?')
        .setStyle(TextInputStyle.Short);

    modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(ageInput),
        new ActionRowBuilder().addComponents(reasonInput),
        new ActionRowBuilder().addComponents(activityInput)
    );

    await interaction.showModal(modal);
}

async function handleApplicationSubmit(interaction) {
    const name = interaction.fields.getTextInputValue('name');
    const age = interaction.fields.getTextInputValue('age');
    const reason = interaction.fields.getTextInputValue('reason');
    const activity = interaction.fields.getTextInputValue('activity');

    const basvuruLogKanalId = await getSetting('basvuruLogKanal');
    const mulakatYetkilisiRoluId = await getSetting('mulakatYetkilisiRolu');

    if (basvuruLogKanalId) {
        const basvuruLogKanal = await interaction.guild.channels.fetch(basvuruLogKanalId);
        const basvuruEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Yeni Başvuru')
            .setDescription(`Başvuran: ${interaction.user.tag}`)
            .addFields(
                { name: 'İsim', value: name },
                { name: 'Yaş', value: age },
                { name: 'Katılma Nedeni', value: reason },
                { name: 'Aktiflik Süresi', value: activity }
            )
            .setTimestamp();

        const kabulButton = new ButtonBuilder()
            .setCustomId(`kabul_${interaction.user.id}`)
            .setLabel('Kabul Et')
            .setStyle(ButtonStyle.Success);

        const redButton = new ButtonBuilder()
            .setCustomId(`red_${interaction.user.id}`)
            .setLabel('Reddet')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(kabulButton, redButton);

        await basvuruLogKanal.send({ embeds: [basvuruEmbed], components: [row] });
    }

    if (mulakatYetkilisiRoluId) {
        const mulakatYetkilisiRolu = await interaction.guild.roles.fetch(mulakatYetkilisiRoluId);
        await interaction.member.roles.add(mulakatYetkilisiRolu);
    }

    await interaction.reply({ content: 'Başvurunuz alındı. Teşekkür ederiz!', ephemeral: true });
}

async function handleApplicationResponse(interaction) {
    const [action, userId] = interaction.customId.split('_');
    const user = await interaction.guild.members.fetch(userId);
    const isAccepted = action === 'kabul';

    await interaction.update({ components: [] });
    await interaction.followUp(`${user.user.tag} kullanıcısının başvurusu ${isAccepted ? 'kabul edildi' : 'reddedildi'}.`);

    try {
        await user.send(`Başvurunuz ${isAccepted ? 'kabul edildi' : 'reddedildi'}.`);
    } catch (error) {
        console.error('Kullanıcıya DM gönderilemedi:', error);
    }

    if (isAccepted) {
    } else {
    }
}

module.exports.handleStartApplication = handleStartApplication;
module.exports.handleApplicationSubmit = handleApplicationSubmit;
module.exports.handleApplicationResponse = handleApplicationResponse;
