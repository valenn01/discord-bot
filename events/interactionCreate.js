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
                    await interaction.followUp({ content: 'Hubo un error al ejecutar el comando.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Hubo un error al ejecutar el comando.', ephemeral: true });
                }
            }
            return;
        }

        // 2. BOTONES
        if (interaction.isButton()) {
            
 // --- BOTONES DE SUGERENCIAS ---
            if (interaction.customId === 'sug_upvote' || interaction.customId === 'sug_downvote') {
                const messageId = interaction.message.id;
                const userId = interaction.user.id;

                if (!client.sugerenciasVotos.has(messageId)) {
                    client.sugerenciasVotos.set(messageId, { up: new Set(), down: new Set() });
                }

                const votos = client.sugerenciasVotos.get(messageId);
                let mensajeTexto = '';

                if (interaction.customId === 'sug_upvote') {
                    if (votos.up.has(userId)) {
                        votos.up.delete(userId);
                        mensajeTexto = 'Removiste tu voto positivo 👍';
                    } else {
                        votos.up.add(userId);
                        votos.down.delete(userId);
                        mensajeTexto = 'Votaste a favor 👍';
                    }
                } else if (interaction.customId === 'sug_downvote') {
                    if (votos.down.has(userId)) {
                        votos.down.delete(userId);
                        mensajeTexto = 'Removiste tu voto negativo 👎';
                    } else {
                        votos.down.add(userId);
                        votos.up.delete(userId);
                        mensajeTexto = 'Votaste en contra 👎';
                    }
                }

                const upCount = votos.up.size;
                const downCount = votos.down.size;

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('sug_upvote')
                        .setLabel(`${upCount}`)
                        .setEmoji('👍')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('sug_downvote')
                        .setLabel(`${downCount}`)
                        .setEmoji('👎')
                        .setStyle(ButtonStyle.Danger)
                );

                // Actualiza los números del mensaje original
                await interaction.message.edit({ components: [row] });
                // Muestra el mensaje que solo ve la persona que votó
                return interaction.reply({ content: mensajeTexto, ephemeral: true });
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
                const roleId = interaction.customId.replace('autorol_', '');
                const role = interaction.guild.roles.cache.get(roleId);
                const member = interaction.member;

                if (!role) return interaction.reply({ content: 'El rol ya no existe.', ephemeral: true });

                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    return interaction.reply({ content: `Te removí el rol **${role.name}**.`, ephemeral: true });
                } else {
                    await member.roles.add(roleId);
                    return interaction.reply({ content: `Te agregué el rol **${role.name}**.`, ephemeral: true });
                }
            }
        }

        // 3. SELECT MENUS (Colores)
        if (interaction.isStringSelectMenu() && interaction.customId === 'selector_color') {
            const member = interaction.member;
            const selectedRoleId = interaction.values[0];

            const nombresColores = [
                'Rojo Carmesí', 
                'Azul Eléctrico', 
                'Verde Esmeralda', 
                'Violeta Neón', 
                'Amarillo Dorado', 
                'Rosa Pastel'
            ];

            const rolesColorActuales = member.roles.cache.filter(r => nombresColores.includes(r.name));
            if (rolesColorActuales.size > 0) {
                await member.roles.remove(rolesColorActuales);
            }

            if (selectedRoleId === 'quitar_color') {
                return interaction.reply({ content: 'Se te quitó el color de nombre.', ephemeral: true });
            }

            const nuevoRol = interaction.guild.roles.cache.get(selectedRoleId);
            if (nuevoRol) {
                await member.roles.add(nuevoRol);
                return interaction.reply({ content: `Ahora tu nombre es de color **${nuevoRol.name}**.`, ephemeral: true });
            }
            return;
        }

        // 4. ENVÍO DE MODALES
        if (interaction.isModalSubmit()) {

            // Enviar Confesión inicial (sin crear hilo de una)
            if (interaction.customId === 'modal_confesion') {
                const texto = interaction.fields.getTextInputValue('texto_confesion');
                const canalId = client.confesionesChannelId || process.env.CONFESIONES_CHANNEL_ID || interaction.guild.channels.cache.find(c => c.name === '🤫・confesiones')?.id;

                const canal = interaction.guild.channels.cache.get(canalId);
                if (!canal) {
                    return interaction.reply({ content: 'No se encontró el canal de confesiones.', ephemeral: true });
                }

                const num = client.numeroConfesion || 1;
                client.numeroConfesion = num + 1;

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

                return interaction.reply({ content: 'Tu confesión fue enviada anónimamente.', ephemeral: true });
            }

            // Enviar Respuestas (crea el hilo recién acá si no existía)
            if (interaction.customId === 'modal_resp_publica' || interaction.customId === 'modal_resp_anonima') {
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

                return interaction.reply({ content: 'Respuesta enviada.', ephemeral: true });
            }
        }
    }
};