const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerir')
        .setDescription('Envía una sugerencia para el servidor')
        .addStringOption(opt => 
            opt.setName('contenido')
                .setDescription('La idea o sugerencia')
                .setRequired(true)
        ),

    async execute(interaction) {
        const contenido = interaction.options.getString('contenido');

        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setAuthor({ 
                name: interaction.user.username, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTitle('Nueva sugerencia')
            .setDescription(contenido)
            .setFooter({ 
                text: `Sugerencia para ${interaction.guild.name}` 
            })
            .setTimestamp();

        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('sug_upvote')
                .setLabel('0')
                .setEmoji('👍')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('sug_downvote')
                .setLabel('0')
                .setEmoji('👎')
                .setStyle(ButtonStyle.Danger)
        );

        // Responder directamente a la interacción para que no tire timeout
        await interaction.reply({ embeds: [embed], components: [botones] });
    }
};