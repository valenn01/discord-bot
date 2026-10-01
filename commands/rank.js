const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database.js');

function getXpParaSiguienteNivel(nivel) {
    return 5 * Math.pow(nivel, 2) + 50 * nivel + 100;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Muestra el nivel y experiencia')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a consultar')),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const user = db.prepare('SELECT * FROM niveles WHERE userId = ?').get(target.id);

        if (!user) {
            return interaction.reply({ 
                content: `${target.username} todavía no tiene experiencia registrada.`, 
                ephemeral: true 
            });
        }

        const xpRequerida = getXpParaSiguienteNivel(user.nivel);

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
            .addFields(
                { name: 'Nivel', value: `\`${user.nivel}\``, inline: true },
                { name: 'Progreso', value: `\`${user.xp} / ${xpRequerida} XP\``, inline: true }
            )
            .setFooter({ text: interaction.guild.name });

        await interaction.reply({ embeds: [embed] });
    }
};