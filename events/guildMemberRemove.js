const { Events } = require('discord.js');
const db = require('../database.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        try {
            const resCount = await db.query("SELECT valor FROM config WHERE clave = 'canal_contador'");
            const voiceChannelId = resCount.rows[0]?.valor;

            if (voiceChannelId) {
                const voiceChannel = member.guild.channels.cache.get(voiceChannelId);
                if (voiceChannel) {
                    await member.guild.members.fetch();
                    const realMembers = member.guild.members.cache.filter(m => !m.user.bot).size;
                    voiceChannel.setName(`👥│Miembros: ${realMembers}`).catch(console.error);
                }
            }
        } catch (error) {
            console.error('Error al actualizar contador en GuildMemberRemove:', error);
        }
    }
};