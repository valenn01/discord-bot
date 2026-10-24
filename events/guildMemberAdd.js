const { Events, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const db = require('../database.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // 1. Obtener canal de bienvenida desde la base de datos
        try {
            const resWelcome = await db.query("SELECT valor FROM config WHERE clave = 'canal_bienvenida'");
            const channelId = resWelcome.rows[0]?.valor;
            const channel = channelId ? member.guild.channels.cache.get(channelId) : null;

            if (channel) {
                const canvas = createCanvas(700, 350);
                const ctx = canvas.getContext('2d');

                // Cargar imagen de fondo desde assets
                try {
                    const fondo = await loadImage('./assets/fondo.svg');
                    ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);
                } catch (e) {
                    // Fondo fallback por si no encuentra la imagen
                    ctx.fillStyle = '#18191c';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // Capa oscura para legibilidad
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Avatar circular
                const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(350, 100, 60, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatar, 290, 40, 120, 120);
                ctx.restore();

                // Borde violeta al avatar
                ctx.beginPath();
                ctx.arc(350, 100, 62, 0, Math.PI * 2, true);
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#8b5cf6';
                ctx.stroke();

                // Textos
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';

                // Título
                ctx.font = 'bold 36px sans-serif';
                ctx.fillText('BIENVENIDO/A', 350, 205);

                // Nombre de usuario
                ctx.fillStyle = '#c4b5fd';
                ctx.font = 'bold 24px sans-serif';
                ctx.fillText(member.user.username, 350, 245);

                // Badge número de miembro
                ctx.fillStyle = '#6d28d9';
                ctx.beginPath();
                ctx.roundRect(240, 265, 220, 40, 10);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 18px sans-serif';
                ctx.fillText(`Miembro #${member.guild.memberCount}`, 350, 292);

                // Enviar al canal
                const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'bienvenida.png' });

                await channel.send({
                    content: `Hola ${member}, bienvenido/a a **${member.guild.name}**.`,
                    files: [attachment]
                });
            }
        } catch (error) {
            console.error('Error al enviar tarjeta de bienvenida:', error);
        }

        // 2. Actualizar canal de contador desde la base de datos (sin bots)
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
            console.error('Error al actualizar contador en GuildMemberAdd:', error);
        }
    }
};