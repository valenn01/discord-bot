const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-confesiones')
        .setDescription('Crea el canal para las confesiones anónimas')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        const guild = interaction.guild;

        let channel = guild.channels.cache.find(c => c.name === '🤫・confesiones');
        if (!channel) {
            channel = await guild.channels.create({
                name: '🤫・confesiones',
                type: ChannelType.GuildText,
                topic: 'Canal de confesiones anónimas. Usá /confesar para enviar la tuya.'
            });
        }

        client.confesionesChannelId = channel.id;
        await interaction.editReply({ content: `Canal de confesiones listo: ${channel}` });
    }
};