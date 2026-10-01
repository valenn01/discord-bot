const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-tickets')
        .setDescription('Envía el panel de creación de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🎫 Centro de Soporte')
            .setDescription('¿Necesitás ayuda, hacer una consulta o reportar a alguien?\nPresioná el botón de abajo para abrir un ticket privado con el staff.')
            .setFooter({ text: interaction.guild.name });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_crear_ticket')
                .setLabel('Crear Ticket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Panel de tickets enviado.', flags: ['Ephemeral'] });
    }
};