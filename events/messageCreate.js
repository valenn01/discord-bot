const { Events, EmbedBuilder } = require('discord.js');
const db = require('../database.js');

// Fórmula de XP necesaria para subir de nivel
function getXpParaSiguienteNivel(nivel) {
    return 5 * Math.pow(nivel, 2) + 50 * nivel + 100;
}

const ROLES_HITOS = [5, 10, 15, 20, 25, 30, 50, 75, 100];

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // 1. Filtro de Canales permitidos
        const canalesPermitidos = process.env.CANALES_XP 
            ? process.env.CANALES_XP.split(',').map(id => id.trim()) 
            : [];

        if (canalesPermitidos.length > 0 && !canalesPermitidos.includes(message.channel.id)) {
            return;
        }

        const userId = message.author.id;
        const ahora = Date.now();
        const cooldown = 3 * 1000;

        let user = db.prepare('SELECT * FROM niveles WHERE userId = ?').get(userId);

        if (!user) {
            db.prepare('INSERT INTO niveles (userId, xp, nivel, ultimoMensaje) VALUES (?, 0, 1, ?)').run(userId, ahora);
            user = { userId, xp: 0, nivel: 1, ultimoMensaje: ahora };
        }

        if (ahora - user.ultimoMensaje < cooldown) return;

        // Ganancia de XP (base 10-20 + bonus sutil por nivel)
        const bonusNivel = Math.floor(user.nivel * 0.5);
        const xpGanada = Math.floor(Math.random() * 11) + 10 + bonusNivel;

        let nuevaXp = user.xp + xpGanada;
        let nivelActual = user.nivel;
        let subioDeNivel = false;

        let xpRequerida = getXpParaSiguienteNivel(nivelActual);

        // Chequeo de Level Up
        while (nuevaXp >= xpRequerida) {
            nuevaXp -= xpRequerida;
            nivelActual++;
            subioDeNivel = true;
            xpRequerida = getXpParaSiguienteNivel(nivelActual);
        }

        db.prepare('UPDATE niveles SET xp = ?, nivel = ?, ultimoMensaje = ? WHERE userId = ?')
            .run(nuevaXp, nivelActual, ahora, userId);

        if (!subioDeNivel) return;

// 2. Asignar rol si alcanzó un hito y remover los anteriores
        let rolAgregadoTexto = '';
        if (ROLES_HITOS.includes(nivelActual)) {
            const nombreRol = `Nivel ${nivelActual}`;
            const rol = message.guild.roles.cache.find(r => r.name === nombreRol);

            if (rol && !message.member.roles.cache.has(rol.id)) {
                // Roles viejos a remover (todos los hitos anteriores que el usuario tenga)
                const rolesViejos = message.guild.roles.cache.filter(r => 
                    ROLES_HITOS.some(h => `Nivel ${h}` === r.name && h !== nivelActual) &&
                    message.member.roles.cache.has(r.id)
                );

                if (rolesViejos.size > 0) {
                    await message.member.roles.remove(rolesViejos).catch(console.error);
                }

                await message.member.roles.add(rol).catch(console.error);
                rolAgregadoTexto = `\n🎖️ ¡Desbloqueaste el rol **${nombreRol}**!`;
            }
        }
        // 3. Notificación en canal exclusivo o actual
        const canalAvisoId = process.env.CANAL_NOTIFICACION_LEVEL;
        const canalAviso = canalAvisoId 
            ? message.guild.channels.cache.get(canalAvisoId) 
            : message.channel;

        if (canalAviso) {
            const embed = new EmbedBuilder()
                .setColor(0xf1c40f)
                .setDescription(`🎉 ¡Felicidades ${message.author}! Subiste al **Nivel ${nivelActual}**${rolAgregadoTexto}`)
                .setTimestamp();

            canalAviso.send({ embeds: [embed] });
        }
    }
};