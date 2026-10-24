const { Events } = require('discord.js');
const db = require('../database.js');

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user) {
        if (user.bot) return;

        if (reaction.partial) {
            try { await reaction.fetch(); } catch (err) { return; }
        }

        if (reaction.emoji.name !== '📚') return;

        try {
            // Busca el ID del mensaje configurado
            const resMsg = await db.query("SELECT valor FROM config WHERE clave = 'msg_estudio'");
            const targetMsgId = resMsg.rows[0]?.valor;

            if (!targetMsgId || reaction.message.id !== targetMsgId) return;

            // Busca el ID del rol que guardaste
            const resRol = await db.query("SELECT valor FROM config WHERE clave = 'rol_estudio'");
            const targetRolId = resRol.rows[0]?.valor;
            if (!targetRolId) return;

            const member = await reaction.message.guild.members.fetch(user.id);
            if (member && member.roles.cache.has(targetRolId)) {
                await member.roles.remove(targetRolId);
            }
        } catch (error) {
            console.error('Error al quitar rol de estudio:', error);
        }
    }
};