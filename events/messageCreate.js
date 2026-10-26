const { Events, EmbedBuilder } = require('discord.js');
const db = require('../database.js');
const { ROLES_NIVEL } = require('../utils/config.js');

const CANALES_MEDIA = process.env.CANAL_MEDIA 
    ? process.env.CANAL_MEDIA.split(',').map(id => id.trim()) 
    : [];

const EMOJIS_MEDIA = ['🔥', '💀', '🍆', '🗿', '🤡', '😭', '👁️', '🤨', '🌭', '🍌'];

// Fórmula de XP necesaria para subir de nivel
function getXpParaSiguienteNivel(nivel) {
    return 5 * Math.pow(nivel, 2) + 50 * nivel + 100;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // Si mencionan únicamente al bot (o con espacios)
        const mencionBot = new RegExp(`^<@!?${message.client.user.id}>$`);

        if (mencionBot.test(message.content.trim())) {
            const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setAuthor({ 
            name: message.client.user.username, 
            iconURL: message.client.user.displayAvatarURL() 
        })
            .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
              `¡Hola ${message.author}! Soy el bot del servidor.\n\n` +
               `• Usá **/** para ver y ejecutar todos mis comandos slash.\n` +
              `• Probá comandos como \`/rank\`, \`/sugerir\` o \`/colores\`.\n` +
              `• Si necesitás soporte o encontraste un bug, avisale al staff.`
        )
        .setFooter({ text: 'Sistema del Servidor' })
        .setTimestamp();

            return message.reply({ embeds: [embed] }).catch(console.error);
        }
        // ==========================================
        // 0. AUTO-REACCIONES EN MEMES Y MEDIA
        // ==========================================
        if (CANALES_MEDIA.includes(message.channel.id)) {
            const tieneAdjunto = message.attachments.size > 0;
            const tieneEnlace = /(https?:\/\/[^\s]+)/g.test(message.content);

            if (tieneAdjunto || tieneEnlace) {
                try {
                    // Mezcla y agarra 2 emojis distintos al azar
                    const aleatorios = [...EMOJIS_MEDIA]
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 2);

                    for (const emoji of aleatorios) {
                        await message.react(emoji);
                    }
                } catch (err) {
                    console.error('Error al reaccionar en canal multimedia:', err);
                }
            }
        }

        // ==========================================
        // 1. FILTRO DE CANALES PERMITIDOS PARA XP
        // ==========================================
        const canalesPermitidos = process.env.CANALES_XP 
            ? process.env.CANALES_XP.split(',').map(id => id.trim()) 
            : [];

        if (canalesPermitidos.length > 0 && !canalesPermitidos.includes(message.channel.id)) {
            return;
        }

        const userId = message.author.id;
        const ahora = Date.now();
        const cooldown = 3 * 1000;

        try {
            // Buscar usuario en PostgreSQL
            const userRes = await db.query('SELECT * FROM niveles WHERE "userId" = $1', [userId]);
            let user = userRes.rows[0];

            if (!user) {
                await db.query(
                    'INSERT INTO niveles ("userId", xp, nivel, "ultimoMensaje") VALUES ($1, 0, 1, $2)',
                    [userId, ahora]
                );
                user = { userId, xp: 0, nivel: 1, ultimoMensaje: ahora };
            }

            // Chequeo de cooldown (BigInt a Number por seguridad)
            if (ahora - Number(user.ultimoMensaje) < cooldown) return;

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

            // Actualizar usuario en PostgreSQL
            await db.query(
                'UPDATE niveles SET xp = $1, nivel = $2, "ultimoMensaje" = $3 WHERE "userId" = $4',
                [nuevaXp, nivelActual, ahora, userId]
            );

            // 2. Asignar el rol más alto alcanzado hasta ahora
            const rolCorrespondiente = [...ROLES_NIVEL]
                .filter(r => r.nivel <= nivelActual)
                .sort((a, b) => b.nivel - a.nivel)[0];

            let rolAgregadoTexto = '';

            if (rolCorrespondiente) {
                const rolNuevo = message.guild.roles.cache.find(r => r.name === rolCorrespondiente.nombre);

                if (rolNuevo && !message.member.roles.cache.has(rolNuevo.id)) {
                    // Remover roles de nivel viejos que no correspondan
                    const nombresRolesNivel = ROLES_NIVEL.map(r => r.nombre);
                    const rolesViejos = message.member.roles.cache.filter(r => 
                        nombresRolesNivel.includes(r.name) && r.id !== rolNuevo.id
                    );

                    if (rolesViejos.size > 0) {
                        await message.member.roles.remove(rolesViejos).catch(console.error);
                    }

                    await message.member.roles.add(rolNuevo).catch(console.error);

                    if (subioDeNivel) {
                        rolAgregadoTexto = `\n🎖️ ¡Desbloqueaste el rol **${rolCorrespondiente.nombre}**!`;
                    }
                }
            }

            if (!subioDeNivel) return;

// 3. Notificación en canal exclusivo o actual
            let canalAviso = message.channel;

            const resLevelChan = await db.query("SELECT valor FROM config WHERE clave = 'canal_level_up'");

            console.log('--- DEBUG NIVEL UP ---');
            console.log('Fila encontrada en config:', resLevelChan.rows);

            if (resLevelChan.rows.length > 0 && resLevelChan.rows[0].valor) {
                const canalAvisoId = resLevelChan.rows[0].valor.trim();
                console.log('Buscando canal ID:', canalAvisoId);

                try {
                    const fetchedChannel = await message.client.channels.fetch(canalAvisoId);
                    if (fetchedChannel) {
                        canalAviso = fetchedChannel;
                        console.log('Canal encontrado con éxito:', canalAviso.name);
                    }
                } catch (e) {
                    console.error('Error al hacer fetch del canal de niveles:', e.message);
                }
            } else {
                console.log('No hay clave canal_level_up en DB, usando canal actual.');
            }

            if (canalAviso) {
                const nombreUsuario = message.member?.displayName || message.author.displayName || message.author.username;
                const avatarUsuario = message.author.displayAvatarURL({ extension: 'png', forceStatic: false, size: 256 });

                // Formato: DD/MM/AAAA, HH:MM
                const ahora = new Date();
                const fechaFormateada = ahora.toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                const embed = new EmbedBuilder()
                    .setColor(0xf1c40f)
                    .setTitle('Subiste de Nivel')
                    .setDescription(`**${nombreUsuario}** alcanzó el **Nivel ${nivelActual}**${rolAgregadoTexto ? `\n${rolAgregadoTexto}` : ''}`)
                    .setThumbnail(avatarUsuario)
                    .setFooter({ text: `${message.client.user.username} Levels • ${fechaFormateada}` });

                await canalAviso.send({ 
                    content: `🎉 ¡Felicidades ${message.author}!`, 
                    embeds: [embed] 
                })
                .then(() => console.log('Mensaje de nivel enviado a:', canalAviso.name))
                .catch(err => console.error('Error al enviar el embed:', err.message));
            }
        } catch (err) {
            console.error('Error en sistema de niveles:', err);
        }
    }
};