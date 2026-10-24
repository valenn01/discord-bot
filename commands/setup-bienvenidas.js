const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-bienvenidas')
        .setDescription('Configura el canal donde se enviarán las tarjetas de bienvenida')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal de texto para las bienvenidas')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const canal = interaction.options.getChannel('canal');

        try {
            await db.query(
                `INSERT INTO config (clave, valor) VALUES ('canal_bienvenida', $1)
                 ON CONFLICT (clave) DO UPDATE SET valor = $1`,
                [canal.id]
            );

            await interaction.reply({
                content: `Canal de bienvenidas configurado correctamente en ${canal}.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error al guardar canal de bienvenidas:', error);
            await interaction.reply({
                content: 'Ocurrió un error al guardar la configuración en la base de datos.',
                ephemeral: true
            });
        }
    }
};