const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlevel')
        .setDescription('Cambia el nivel y XP de un usuario (Solo Admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('nivel').setDescription('Nivel').setRequired(true))
        .addIntegerOption(opt => opt.setName('xp').setDescription('XP actual').setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const nivel = interaction.options.getInteger('nivel');
        const xp = interaction.options.getInteger('xp') || 0;

        db.prepare(`
            INSERT INTO niveles (userId, xp, nivel, ultimoMensaje) 
            VALUES (?, ?, ?, 0) 
            ON CONFLICT(userId) DO UPDATE SET nivel = ?, xp = ?, ultimoMensaje = 0
        `).run(target.id, xp, nivel, nivel, xp);

        await interaction.reply({ content: `Listo: ${target.username} quedó en Nivel **${nivel}** con **${xp} XP**.`, ephemeral: true });
    }
};