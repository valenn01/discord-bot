const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-sugerencias')
        .setDescription('Configura el canal donde se publicarán las sugerencias')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal de texto para enviar las sugerencias')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const canal = interaction.options.getChannel('canal');

        try {
            await db.query(
                `INSERT INTO config (clave, valor) VALUES ('canal_sugerencias', $1)
                 ON CONFLICT (clave) DO UPDATE SET valor = $1`,
                [canal.id]
            );

            await interaction.reply({
                content: `Canal de sugerencias configurado correctamente en ${canal}.`,
                flags: ['Ephemeral']
            });
        } catch (error) {
            console.error('Error al guardar canal de sugerencias:', error);
            await interaction.reply({
                content: 'Ocurrió un error al guardar en la base de datos.',
                flags: ['Ephemeral']
            });
        }
    }
};