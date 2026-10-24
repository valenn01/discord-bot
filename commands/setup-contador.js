const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType 
} = require('discord.js');
const db = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-contador')
        .setDescription('Crea y configura el canal de contador de miembros')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;

        try {
            // Verificar si ya existe en la base de datos
            const res = await db.query("SELECT valor FROM config WHERE clave = 'canal_contador'");
            const existingChannelId = res.rows[0]?.valor;

            if (existingChannelId && guild.channels.cache.has(existingChannelId)) {
                return interaction.editReply({ 
                    content: `El contador ya está configurado en <#${existingChannelId}>.` 
                });
            }

            await guild.members.fetch();

            // Total de humanos en el server
            const memberCount = guild.members.cache.filter(m => !m.user.bot).size;

            const channel = await guild.channels.create({
                name: `👥│Miembros: ${memberCount}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.Connect]
                    }
                ]
            });

            // Guardar en config
            await db.query(
                `INSERT INTO config (clave, valor) VALUES ('canal_contador', $1)
                 ON CONFLICT (clave) DO UPDATE SET valor = $1`,
                [channel.id]
            );

            await interaction.editReply({ 
                content: `Canal creado y registrado en la base de datos: ${channel} (${memberCount} miembros).` 
            });
        } catch (error) {
            console.error('Error al configurar canal contador:', error);
            await interaction.editReply({ 
                content: 'Hubo un error al crear el canal. Verificá los permisos del bot.' 
            });
        }
    }
};