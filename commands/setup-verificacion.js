const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-verificacion')
        .setDescription('Manda el mensaje de verificación')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('¡Te damos la bienvenida al servidor! 🚀')
            .setDescription('Para acceder al resto de los canales y evitar bots de spam, por favor verificate tocando el botón de abajo.')
            .setFooter({ text: interaction.guild.name });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_verificar')
                .setLabel('Verificarme')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Panel de verificación enviado.', flags: ['Ephemeral'] });
    }
};