const { 
    SlashCommandBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');
const db = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confesar')
        .setDescription('Envía una confesión 100% anónima'),

    async execute(interaction) {
        // Validar si el canal está configurado en config
        const res = await db.query("SELECT valor FROM config WHERE clave = 'canal_confesiones'");
        const canalId = res.rows[0]?.valor;
        const canal = canalId ? interaction.guild.channels.cache.get(canalId) : null;

        if (!canal) {
            return interaction.reply({
                content: 'El sistema de confesiones está deshabilitado en este servidor (falta configurarlo con `/setup-confesiones`).',
                flags: ['Ephemeral']
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_confesion')
            .setTitle('Nueva Confesión Anónima');

        const textoInput = new TextInputBuilder()
            .setCustomId('texto_confesion')
            .setLabel('¿Qué querés confesar?')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Escribí acá tu secreto...')
            .setRequired(true)
            .setMaxLength(1000);

        modal.addComponents(new ActionRowBuilder().addComponents(textoInput));
        await interaction.showModal(modal);
    }
};