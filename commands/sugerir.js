const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database.js');

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
        // 1. Validar si el canal está configurado en config
        const res = await db.query("SELECT valor FROM config WHERE clave = 'canal_sugerencias'");
        const canalId = res.rows[0]?.valor;
        const canal = canalId ? interaction.guild.channels.cache.get(canalId) : null;

        if (!canal) {
            return interaction.reply({
                content: 'El sistema de sugerencias está deshabilitado (falta configurarlo con `/setup-sugerencias`).',
                ephemeral: true
            });
        }

        const contenido = interaction.options.getString('contenido');

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setAuthor({ 
                name: interaction.user.username.toUpperCase(), 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setDescription(`> ${contenido}\n\n**Votos**\nVotos a favor: **0**\nVotos en contra: **0**`)
            .setFooter({ 
                text: `Sugerencia para ${interaction.guild.name}` 
            })
            .setTimestamp();

        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('sug_reply')
                .setEmoji('✍️')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('sug_up')
                .setEmoji('👍')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('sug_down')
                .setEmoji('👎')
                .setStyle(ButtonStyle.Danger)
        );

        // 2. Enviar la sugerencia al canal seteado y avisar en efímero
        await canal.send({ embeds: [embed], components: [botones] });
        await interaction.reply({ content: '¡Tu sugerencia fue enviada al canal correspondiente!', ephemeral: true });
    }
};