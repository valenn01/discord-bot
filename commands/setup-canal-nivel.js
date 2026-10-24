const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-canal-nivel')
        .setDescription('Configura el canal donde se avisan las subidas de nivel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal de texto para los avisos de subida de nivel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const canal = interaction.options.getChannel('canal');

        try {
            await db.query(
                `INSERT INTO config (clave, valor) VALUES ('canal_level_up', $1)
                 ON CONFLICT (clave) DO UPDATE SET valor = $1`,
                [canal.id]
            );

            await interaction.reply({
                content: `Canal de subidas de nivel configurado en ${canal}.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error al guardar canal de niveles:', error);
            await interaction.reply({
                content: 'Error al guardar la configuración en la base de datos.',
                ephemeral: true
            });
        }
    }
};