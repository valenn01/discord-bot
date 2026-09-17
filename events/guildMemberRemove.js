const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const channelId = member.client.memberCountChannelId || process.env.MEMBER_COUNT_CHANNEL_ID;
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId);
        if (channel) {
            channel.setName(`👥・Miembros: ${member.guild.memberCount}`).catch(console.error);
        }
    }
};