const db = require('../database.js');
const { PermissionFlagsBits } = require('discord.js');
const { 
    Events, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    EmbedBuilder 
} = require('discord.js');
const NOMBRES_COLORES = new Set([
  'Rojo Carmesí',
  'Naranja Fuego',
  'Amarillo Dorado',
  'Verde Esmeralda',
  'Menta / Aqua',
  'Cian Glaciar',
  'Azul Eléctrico',
  'Azul Noche',
  'Violeta Neón',
  'Lavanda',
  'Rosa Pastel',
  'Magenta / Fucsia',
  'Blanco Nieve',
  'Gris Grafito'
]);
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {

// 1. SLASH COMMANDS
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({ content: 'Hubo un error al ejecutar el comando.', flags: ['Ephemeral'] });
                } else {
                    await interaction.reply({ content: 'Hubo un error al ejecutar el comando.', flags: ['Ephemeral'] });
                }
            }
            return;
        }

// 2. BOTONES
        if (interaction.isButton()) {
            // CREAR TICKET
            if (interaction.customId === 'btn_crear_ticket') {
                const guild = interaction.guild;
                const user = interaction.user;

                // Evitar tickets duplicados
                const canalExiste = guild.channels.cache.find(c => c.name === `ticket-${user.username.toLowerCase()}`);
                if (canalExiste) {
                    return interaction.reply({ content: `Ya tenés un ticket abierto en ${canalExiste}.`, flags: ['Ephemeral'] });
                }

                await interaction.deferReply({ flags: ['Ephemeral'] });

                const rolStaffId = process.env.ROL_STAFF;
                const categoriaId = process.env.CATEGORIA_TICKETS;

                const permissionOverwrites = [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }, // Oculto para @everyone
                    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                ];

                if (rolStaffId) {
                    permissionOverwrites.push({
                        id: rolStaffId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    });
                }

                const canalTicket = await guild.channels.create({
                    name: `ticket-${user.username}`,
                    parent: categoriaId || null,
                    permissionOverwrites
                });

                const embedTicket = new EmbedBuilder()
                    .setColor(0x2ECC71)
                    .setTitle(`Ticket de ${user.username}`)
                    .setDescription('Explicá tu consulta o reporte con claridad. Un miembro del staff te responderá a la brevedad.\n\nPara cerrar este canal, usá el botón inferior.')
                    .setTimestamp();

                const rowCerrar = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('btn_cerrar_ticket')
                        .setLabel('Cerrar Ticket')
                        .setEmoji('🔒')
                        .setStyle(ButtonStyle.Danger)
                );

                await canalTicket.send({ content: `${user} | <@&${rolStaffId}>`, embeds: [embedTicket], components: [rowCerrar] });
                return interaction.editReply({ content: `Tu ticket fue creado en ${canalTicket}.` });
            }

            // CERRAR TICKET
            if (interaction.customId === 'btn_cerrar_ticket') {
                await interaction.reply({ content: 'El ticket se eliminará en 5 segundos...' });
                setTimeout(async () => {
                    await interaction.channel.delete().catch(() => null);
                }, 5000);
                return;
            }



            // --- BOTONES DE SUGERENCIA (SUPABASE) ---
            if (interaction.customId === 'sug_reply') {
                if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ content: 'Solo administradores pueden responder sugerencias.', flags: ['Ephemeral'] });
                }

                const modal = new ModalBuilder()
                    .setCustomId(`sug_modal_${interaction.message.id}`)
                    .setTitle('Responder Sugerencia');

                const inputRespuesta = new TextInputBuilder()
                    .setCustomId('respuesta_admin')
                    .setLabel('Respuesta oficial')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Escribí acá la respuesta del staff...')
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(inputRespuesta));
                return await interaction.showModal(modal);
            }

            if (interaction.customId === 'sug_up' || interaction.customId === 'sug_down') {
                await interaction.deferReply({ flags: ['Ephemeral'] });

                const messageId = interaction.message.id;
                const userId = interaction.user.id;
                const tipoVoto = interaction.customId === 'sug_up' ? 'up' : 'down';

                try {
                    const votoActualRes = await db.query(
                        'SELECT tipo FROM sugerencias_votos WHERE "mensajeId" = $1 AND "userId" = $2',
                        [messageId, userId]
                    );
                    const votoActual = votoActualRes.rows[0];
                    let mensajeTexto = '';

                    if (votoActual) {
                        if (votoActual.tipo === tipoVoto) {
                            await db.query(
                                'DELETE FROM sugerencias_votos WHERE "mensajeId" = $1 AND "userId" = $2',
                                [messageId, userId]
                            );
                            mensajeTexto = tipoVoto === 'up' ? 'Removiste tu voto positivo 👍' : 'Removiste tu voto negativo 👎';
                        } else {
                            await db.query(
                                'UPDATE sugerencias_votos SET tipo = $1 WHERE "mensajeId" = $2 AND "userId" = $3',
                                [tipoVoto, messageId, userId]
                            );
                            mensajeTexto = tipoVoto === 'up' ? 'Cambiaste a voto positivo 👍' : 'Cambiaste a voto negativo 👎';
                        }
                    } else {
                        await db.query(
                            'INSERT INTO sugerencias_votos ("mensajeId", "userId", tipo) VALUES ($1, $2, $3)',
                            [messageId, userId, tipoVoto]
                        );
                        mensajeTexto = tipoVoto === 'up' ? 'Votaste a favor 👍' : 'Votaste en contra 👎';
                    }

                    const upCountRes = await db.query(
                        'SELECT COUNT(*) AS total FROM sugerencias_votos WHERE "mensajeId" = $1 AND tipo = $2',
                        [messageId, 'up']
                    );
                    const downCountRes = await db.query(
                        'SELECT COUNT(*) AS total FROM sugerencias_votos WHERE "mensajeId" = $1 AND tipo = $2',
                        [messageId, 'down']
                    );

                    const upCount = upCountRes.rows[0].total;
                    const downCount = downCountRes.rows[0].total;

                    // Actualizar el embed con los nuevos contadores de votos
                    const oldEmbed = interaction.message.embeds[0];
                    const partes = oldEmbed.description.split('**Votos**');
                    const contenidoOriginal = partes[0].trim();
                    const resto = partes[1] && partes[1].includes('**Respondido por') ? partes[1].split('**Respondido por')[1] : null;

                    let nuevaDesc = `${contenidoOriginal}\n\n**Votos**\nVotos a favor: **${upCount}**\nVotos en contra: **${downCount}**`;
                    if (resto) nuevaDesc += `\n\n**Respondido por${resto}`;

                    const nuevoEmbed = EmbedBuilder.from(oldEmbed).setDescription(nuevaDesc);
                    await interaction.message.edit({ embeds: [nuevoEmbed] });

                    return interaction.editReply({ content: mensajeTexto });
                } catch (err) {
                    console.error('Error procesando voto:', err);
                    return interaction.editReply({ content: 'Hubo un error al procesar el voto.' });
                }
            }

            // --- BOTONES DE CONFESIONES (ABRIR MODAL) ---
            if (interaction.customId === 'resp_publica') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_resp_publica')
                    .setTitle('Responder a la confesión');

                const input = new TextInputBuilder()
                    .setCustomId('texto_resp')
                    .setLabel('Tu respuesta (se verá tu usuario)')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return interaction.showModal(modal);
            }

            if (interaction.customId === 'resp_anonima') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_resp_anonima')
                    .setTitle('Responder anónimamente');

                const input = new TextInputBuilder()
                    .setCustomId('texto_resp')
                    .setLabel('Tu respuesta (nadie sabrá quién sos)')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return interaction.showModal(modal);
            }

            // --- AUTOROLES GENERALES ---
            if (interaction.customId.startsWith('autorol_')) {
                await interaction.deferReply({ flags: ['Ephemeral'] });

                const roleId = interaction.customId.replace('autorol_', '');
                const role = interaction.guild.roles.cache.get(roleId);
                const member = interaction.member;

                if (!role) {
                    return interaction.editReply({ content: 'El rol ya no existe.' });
                }

                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    return interaction.editReply({ content: `Te removí el rol **${role.name}**.` });
                } else {
                    await member.roles.add(roleId);
                    return interaction.editReply({ content: `Te agregué el rol **${role.name}**.` });
                }
            }
        }

// 3. SELECT MENUS (Colores)
        if (interaction.isStringSelectMenu() && interaction.customId === 'selector_color') {
            await interaction.deferReply({ flags: ['Ephemeral'] });

            const member = interaction.member;
            const selectedRoleId = interaction.values[0];

            // Filtra los roles dejando afuera cualquier rol de color previo
            const nuevosRoles = member.roles.cache
                .filter(r => !NOMBRES_COLORES.has(r.name))
                .map(r => r.id);

            // Si no eligió quitarse el color, le suma el seleccionado
            if (selectedRoleId !== 'quitar_color') {
                nuevosRoles.push(selectedRoleId);
            }

            // Aplica la actualización en una sola petición rápida
            await member.roles.set(nuevosRoles);

            if (selectedRoleId === 'quitar_color') {
                return interaction.editReply({ content: 'Se te quitó el color de nombre.' });
            }

            const nuevoRol = interaction.guild.roles.cache.get(selectedRoleId);
            return interaction.editReply({ 
                content: `Ahora tu nombre es de color **${nuevoRol ? nuevoRol.name : 'seleccionado'}**.` 
            });
        }

// 4. ENVÍO DE MODALES
        if (interaction.isModalSubmit()) {
            
            // Modal de respuesta de sugerencias (Admin)
            if (interaction.customId.startsWith('sug_modal_')) {
                await interaction.deferReply({ flags: ['Ephemeral'] });

                const messageId = interaction.customId.replace('sug_modal_', '');
                const respuestaAdmin = interaction.fields.getTextInputValue('respuesta_admin');

                try {
                    const message = await interaction.channel.messages.fetch(messageId);
                    const oldEmbed = message.embeds[0];

                    const fecha = new Date().toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'numeric',
                        year: '2-digit'
                    });

                    let descBase = oldEmbed.description;
                    if (descBase.includes('\n\n**Respondido por')) {
                        descBase = descBase.split('\n\n**Respondido por')[0];
                    }

                    const nuevaDesc = `${descBase}\n\n**Respondido por ${interaction.user.username}**\n${respuestaAdmin}`;

                    const nuevoEmbed = EmbedBuilder.from(oldEmbed)
                        .setTitle(`Sugerencia respondida el ${fecha}`)
                        .setDescription(nuevaDesc);

                    await message.edit({ embeds: [nuevoEmbed] });
                    return interaction.editReply({ content: 'Sugerencia respondida con éxito.' });
                } catch (error) {
                    console.error('Error al responder sugerencia:', error);
                    return interaction.editReply({ content: 'No se pudo editar el mensaje de la sugerencia.' });
                }
            }

            // Enviar Confesión inicial (sin crear hilo de una)
            if (interaction.customId === 'modal_confesion') {
                await interaction.deferReply({ flags: ['Ephemeral'] });

                const texto = interaction.fields.getTextInputValue('texto_confesion');

                // Obtener canal desde la tabla config
                const resChan = await db.query("SELECT valor FROM config WHERE clave = 'canal_confesiones'");
                const canalId = resChan.rows[0]?.valor;
                const canal = canalId ? interaction.guild.channels.cache.get(canalId) : null;

                if (!canal) {
                    return interaction.editReply({ content: 'No se encontró el canal de confesiones configurado.' });
                }

                // Contador persistente en DB (Supabase/PostgreSQL)
                let rowConf = await db.query("SELECT valor FROM config WHERE clave = 'numero_confesion'");
                let num = rowConf.rows.length > 0 ? parseInt(rowConf.rows[0].valor, 10) : 1;

                await db.query(`
                    INSERT INTO config (clave, valor) 
                    VALUES ('numero_confesion', $1) 
                    ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor
                `, [String(num + 1)]);

                const embed = new EmbedBuilder()
                    .setColor(0x9b59b6)
                    .setTitle(`Confesión anónima (#${num})`)
                    .setDescription(`*${texto}*`)
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                const botones = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('resp_publica')
                        .setLabel('Responder')
                        .setEmoji('✉️')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('resp_anonima')
                        .setLabel('Responder anónimo')
                        .setEmoji('🤫')
                        .setStyle(ButtonStyle.Secondary)
                );

                await canal.send({ 
                    embeds: [embed], 
                    components: [botones],
                    allowedMentions: { parse: [] } 
                });

                return interaction.editReply({ content: 'Tu confesión fue enviada anónimamente.' });
            }

            // Enviar Respuestas (crea el hilo recién acá si no existía)
            if (interaction.customId === 'modal_resp_publica' || interaction.customId === 'modal_resp_anonima') {
                await interaction.deferReply({ flags: ['Ephemeral'] });

                const texto = interaction.fields.getTextInputValue('texto_resp');
                const mensaje = interaction.message;

                let thread = mensaje.thread;
                
                // Si el hilo no existe todavía, lo crea
                if (!thread) {
                    const embedTitle = mensaje.embeds[0]?.title || 'Confesión';
                    const numMatch = embedTitle.match(/#\d+/);
                    const hiloNombre = numMatch ? `Hilo Confesión ${numMatch[0]}` : 'Hilo Confesión';

                    thread = await mensaje.startThread({
                        name: hiloNombre,
                        autoArchiveDuration: 1440
                    });
                }

                if (interaction.customId === 'modal_resp_publica') {
                    await thread.send({ 
                        content: `💬 **${interaction.user.username}** respondió:\n> ${texto}`,
                        allowedMentions: { parse: [] }
                    });
                } else {
                    await thread.send({ 
                        content: `🤫 **Anónimo** respondió:\n> ${texto}`,
                        allowedMentions: { parse: [] }
                    });
                }

                return interaction.editReply({ content: 'Respuesta enviada.' });
            }
        }
    }
};