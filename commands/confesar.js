const { 
    SlashCommandBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confesar')
        .setDescription('Envía una confesión 100% anónima'),

    async execute(interaction) {
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