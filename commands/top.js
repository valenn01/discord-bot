const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Muestra el Top 3 de miembros con mayor nivel del servidor'),

    async execute(interaction) {
        const topUsuarios = db.prepare('SELECT userId, nivel, xp FROM niveles ORDER BY nivel DESC, xp DESC LIMIT 3').all();

        if (!topUsuarios || topUsuarios.length === 0) {
            return interaction.reply({ content: 'Aún no hay datos de niveles registrados.', ephemeral: true });
        }

        const medallas = ['🥇', '🥈', '🥉'];
        let descripcion = '';

        for (let i = 0; i < topUsuarios.length; i++) {
            const data = topUsuarios[i];
            const member = await interaction.guild.members.fetch(data.userId).catch(() => null);
            const tag = member ? member.user.username : 'Usuario desconocido';

            descripcion += `${medallas[i]} **${tag}**\n> Nivel: **${data.nivel}** | XP: **${data.xp}**\n\n`;
        }

        const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle(`🏆 Top 3 del Servidor`)
            .setDescription(descripcion)
            .setFooter({ text: interaction.guild.name })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};