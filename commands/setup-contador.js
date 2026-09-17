const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-contador')
        .setDescription('Crea y configura automáticamente el canal de contador de miembros')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;

        // Verificar si ya existe en memoria o en el servidor
        if (client.memberCountChannelId && guild.channels.cache.has(client.memberCountChannelId)) {
            return interaction.editReply({ 
                content: `El contador ya está configurado en el canal <#${client.memberCountChannelId}>.` 
            });
        }

        try {
            const totalMembers = guild.memberCount;

            const channel = await guild.channels.create({
                name: `👥・Miembros: ${totalMembers}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.Connect]
                    }
                ]
            });

            client.memberCountChannelId = channel.id;

            await interaction.editReply({ 
                content: `Canal de contador creado correctamente: ${channel}` 
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: 'Hubo un error al crear el canal. Verificá los permisos del bot.' 
            });
        }
    }
};