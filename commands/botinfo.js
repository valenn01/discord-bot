const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');

module.exports = {
    // Si tu sistema de /help usa categorías por propiedad, descomentá la siguiente línea:
    // categoria: 'Comunidad',
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Muestra información técnica, creador y estado del bot'),

    async execute(interaction, client) {
        const sent = await interaction.reply({ content: 'Obteniendo datos...', fetchReply: true });
        
        // Cálculo de latencias
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        // Tiempo activo (uptime) formateado
        let totalSeconds = client.uptime / 1000;
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Memoria RAM usada por Node.js
        const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`🤖 Información de ${client.user.username}`)
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription('Bot oficial de gestión, utilidades y entretenimiento para la comunidad.')
            .addFields(
                { name: '👑 Desarrollador', value: 'Desarrollado por **Valen**', inline: true },
                { name: '⏳ Tiempo activo', value: `\`${uptimeString}\``, inline: true },
                { name: '📶 Latencia', value: `Bot: \`${latency}ms\` | API: \`${apiLatency}ms\``, inline: false },
                { name: '📊 Servidores / Usuarios', value: `${client.guilds.cache.size} servidor(es) • ${client.users.cache.size} usuarios`, inline: true },
                { name: '⚙️ Entorno', value: `Node.js \`${process.version}\` • Discord.js \`v${djsVersion}\``, inline: true },
                { name: '💾 Memoria RAM', value: `\`${memoryUsed} MB\``, inline: true }
            )
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};