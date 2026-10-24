const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const RESPUESTAS = [
    // Afirmativas
    'En efecto, sin dudas.',
    'Sí, totalmente.',
    'Es bastante probable.',
    'Todo apunta a que sí.',
    'Definitivamente sí.',
    
    // Dudosas / Neutras
    'Capaz, preguntame más tarde.',
    'No sabría decirte ahora.',
    'Mejor no te digo nada ahora.',
    'Concentrate y volvé a preguntar.',
    
    // Negativas
    'Ni en pedo.',
    'No cuentes con eso.',
    'Mi respuesta es no.',
    'Las perspectivas no son buenas.',
    'Para nada.'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Hacé una pregunta de sí o no a la bola mágica')
        .addStringOption(option =>
            option.setName('pregunta')
                .setDescription('La pregunta que querés hacer')
                .setRequired(true)
        ),

    async execute(interaction) {
        const pregunta = interaction.options.getString('pregunta');
        const respuesta = RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)];

        const embed = new EmbedBuilder()
            .setColor(0x34495e)
            .setTitle('🎱 Bola 8 Mágica')
            .addFields(
                { name: 'Pregunta', value: pregunta },
                { name: 'Respuesta', value: `**${respuesta}**` }
            )
            .setFooter({ 
                text: `Preguntado por ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        await interaction.reply({ embeds: [embed] });
    }
};