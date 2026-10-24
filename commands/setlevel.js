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
        await interaction.deferReply({ ephemeral: true });

        const target = interaction.options.getUser('usuario');
        const nivel = interaction.options.getInteger('nivel');
        const xp = interaction.options.getInteger('xp') || 0;

        try {
            await db.query(`
                INSERT INTO niveles ("userId", xp, nivel, "ultimoMensaje") 
                VALUES ($1, $2, $3, 0) 
                ON CONFLICT ("userId") DO UPDATE 
                SET nivel = $3, xp = $2, "ultimoMensaje" = 0
            `, [target.id, xp, nivel]);

            await interaction.editReply({ 
                content: `Listo: ${target.username} quedó en Nivel **${nivel}** con **${xp} XP**.` 
            });
        } catch (error) {
            console.error('Error en setlevel:', error);
            await interaction.editReply({ 
                content: 'Hubo un error al actualizar el nivel en la base de datos.' 
            });
        }
    }
};