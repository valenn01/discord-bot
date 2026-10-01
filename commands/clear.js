const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Borra una cantidad de mensajes del canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(opt =>
            opt.setName('cantidad')
                .setDescription('Cantidad de mensajes a eliminar (1 - 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),

    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad');

        await interaction.channel.bulkDelete(cantidad, true)
            .then(mensajes => {
                interaction.reply({ 
                    content: `Se eliminaron **${mensajes.size}** mensajes correctamente.`, 
                    ephemeral: true 
                });
            })
            .catch(() => {
                interaction.reply({ 
                    content: 'Error: No se pueden borrar mensajes con más de 14 días de antigüedad.', 
                    ephemeral: true 
                });
            });
    }
};