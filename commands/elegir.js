const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('elegir')
        .setDescription('Elige una opción al azar entre las que ingreses')
        .addStringOption(option =>
            option.setName('opciones')
                .setDescription('Separá las opciones con comas (ej: CS2, Rocket League, L4D2)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const rawOpciones = interaction.options.getString('opciones');
        
        // Separa por comas, limpia espacios en blanco y filtra entradas vacías
        const opciones = rawOpciones
            .split(',')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);

        if (opciones.length < 2) {
            return interaction.reply({
                content: 'Poné al menos dos opciones separadas por coma para que pueda elegir.',
                flags: ['Ephemeral']
            });
        }

        const eleccion = opciones[Math.floor(Math.random() * opciones.length)];

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle('🎲 Decisión tomada')
            .setDescription(`Entre las opciones dadas, me quedo con:\n\n# **${eleccion}**`)
            .setFooter({ text: `Pedido por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    }
};