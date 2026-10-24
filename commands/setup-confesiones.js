const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-confesiones')
        .setDescription('Configura el canal para las confesiones anónimas')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal de texto donde se publicarán las confesiones')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const canal = interaction.options.getChannel('canal');

        try {
            await db.query(
                `INSERT INTO config (clave, valor) VALUES ('canal_confesiones', $1)
                 ON CONFLICT (clave) DO UPDATE SET valor = $1`,
                [canal.id]
            );

            await interaction.reply({
                content: `Canal de confesiones configurado correctamente en ${canal}.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error al guardar canal de confesiones:', error);
            await interaction.reply({
                content: 'Ocurrió un error al guardar en la base de datos.',
                ephemeral: true
            });
        }
    }
};