const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { getSetting } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('basvuru')
        .setDescription('Ekip başvuru formunu göster'),
    async execute(interaction) {
        const basvuruKanalId = await getSetting('basvuruKanal');
        if (!basvuruKanalId) {
            return interaction.reply({ content: 'Başvuru kanalı henüz ayarlanmamış.', ephemeral: true });
        }

        const basvuruKanal = await interaction.guild.channels.fetch(basvuruKanalId);
        if (!basvuruKanal) {
            return interaction.reply({ content: 'Başvuru kanalı bulunamadı.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ekip Başvurusu')
            .setDescription('Ekibimize katılmak için aşağıdaki butona tıklayın ve başvuru formunu doldurun.')
            .setFooter({ text: 'Başvurunuz değerlendirilecektir.' });

        const button = new ButtonBuilder()
            .setCustomId('start_application')
            .setLabel('Başvuru Yap')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await basvuruKanal.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Başvuru formu başvuru kanalına gönderildi.', ephemeral: true });
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

    if (basvuruLogKanalId) {
        const basvuruLogKanal = await interaction.guild.channels.fetch(basvuruLogKanalId);
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
        
        const yetkililer = mulakatYetkilisiRolu.members;
        yetkililer.forEach(async (yetkili) => {
            await yetkili.send(`Yeni bir başvuru yapıldı. Lütfen başvuru log kanalını kontrol edin.`);
        });
    }

    await interaction.reply({ content: 'Başvurunuz alındı. Teşekkür ederiz!', ephemeral: true });
}

async function handleApplicationResponse(interaction) {
    const [action, userId] = interaction.customId.split('_');
    const user = await interaction.guild.members.fetch(userId);
    const isAccepted = action === 'kabul';

    await interaction.update({ components: [] });

    const basvuruOnayKanalId = await getSetting('basvuruOnayKanal');
    if (basvuruOnayKanalId) {
        const basvuruOnayKanal = await interaction.guild.channels.fetch(basvuruOnayKanalId);
        const onayEmbed = new EmbedBuilder()
            .setColor(isAccepted ? '#00ff00' : '#ff0000')
            .setTitle(isAccepted ? 'Başvuru Kabul Edildi' : 'Başvuru Reddedildi')
            .setDescription(`${user.user.tag} kullanıcısının başvurusu ${isAccepted ? 'kabul edildi' : 'reddedildi'}.`)
            .setTimestamp();

        await basvuruOnayKanal.send({ embeds: [onayEmbed] });
    }

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
