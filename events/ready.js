const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Bot encendido como: ${client.user.tag}`);
        
        client.user.setPresence({
            activities: [{ name: 'Panchoteam', type: ActivityType.Watching }],
            status: 'online'
        });

        // Actualizar contador al prender
        const channelId = process.env.MEMBER_COUNT_CHANNEL_ID;
        const guildId = process.env.GUILD_ID;
        const guild = client.guilds.cache.get(guildId);

        if (guild && channelId) {
            const channel = guild.channels.cache.get(channelId);
            if (channel) {
                await channel.setName(`👥・Miembros: ${guild.memberCount}`).catch(console.error);
            }
        }
    }
};