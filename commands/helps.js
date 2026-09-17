const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la lista de comandos disponibles'),

    async execute(interaction) {
        const client = interaction.client;

        const embed = new EmbedBuilder()
            .setColor(0x8b5cf6)
            .setTitle('Panel de Comandos')
            .setDescription('Lista de comandos configurados en el bot:')
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        client.commands.forEach((cmd) => {
            embed.addFields({
                name: `\`/${cmd.data.name}\``,
                value: cmd.data.description || 'Sin descripción.',
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};