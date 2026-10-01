const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-reglas')
        .setDescription('Publica el reglamento oficial en el canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const colorAzul = 0x245CFF;
        const iconServer = interaction.guild.iconURL({ dynamic: true, size: 512 });
        const lineaLarga = '──────────────────────────────────────────────────────────────────';

        // Embed 1: Encabezado e Índice
        const embedHeader = new EmbedBuilder()
            .setColor(colorAzul)
            .setAuthor({ name: 'REGLAMENTO OFICIAL • PANCHOTEAM' })
            .setTitle('# Bienvenido a PANCHOTEAM 🌭')
            .setThumbnail(iconServer)
            .setDescription(
                'Este es el reglamento oficial de la comunidad. Al permanecer en el servidor **aceptás cumplirlo en su totalidad.**\n\n' +
                `${lineaLarga}\n` +
                '### 📋 ÍNDICE GENERAL\n' +
                '• **01 — CONVIVENCIA** — 4 normas básicas de respeto\n' +
                '• **02 — CHAT Y CONTENIDO** — 3 normas sobre mensajes y multimedia\n' +
                '• **03 — CANALES Y COMUNIDAD** — 3 normas de organización y roles\n' +
                '• **04 — STAFF Y SANCIONES** — 3 normas sobre moderación y penalizaciones\n' +
                `${lineaLarga}\n` +
                '*El respeto mutuo es la base fundamental para mantener una comunidad sana y unida.*'
            )
            .setFooter({ text: `13 normas en 4 categorías • ${interaction.guild.name}` })
            .setTimestamp();

        // Embed 2: Convivencia
        const embedConvivencia = new EmbedBuilder()
            .setColor(colorAzul)
            .setTitle('# 01 — CONVIVENCIA')
            .setDescription(
                '### `01` Respeto ante todo\n' +
                '> Tratarse siempre con cortesía y consideración. Cero tolerancia ante insultos graves, amenazas, actitudes hostiles, acoso o cualquier manifestación de odio y discriminación.\n\n' +
                '### `02` Lenguaje y buen trato\n' +
                '> Evitá lenguaje vulgar, obsceno o excesivamente tóxico en los canales públicos. Mantené un ambiente sano y agradable para todos los miembros presentes.\n\n' +
                '### `03` Nada de discusiones en público\n' +
                '> Los conflictos personales entre miembros se deben resolver obligatoriamente por mensaje privado o abriendo un ticket con el staff, nunca dentro de canales comunitarios.\n\n' +
                '### `04` Sin temas polémicos\n' +
                '> Queda totalmente prohibido iniciar o fomentar debates sobre política partidaria, religión u otros temas sensibles que únicamente sirvan para generar disputas innecesarias.'
            );

        // Embed 3: Chat y Contenido
        const embedChat = new EmbedBuilder()
            .setColor(colorAzul)
            .setTitle('# 02 — CHAT Y CONTENIDO')
            .setDescription(
                '### `05` Prohibición de spam y flood\n' +
                '> No repitas mensajes seguidos, no satures con mayúsculas continuas, ni hagas uso masivo de emojis, stickers o saltos de línea molestos que interrumpan la lectura fluida.\n\n' +
                '### `06` Contenido prohibido (NSFW / Gore)\n' +
                '> Queda estrictamente vetado subir cualquier imagen, enlace o video de índole sexual explícita, material violento/gore o que promueva actividades ilícitas y peligrosas.\n\n' +
                '### `07` Cero spoilers sin etiqueta\n' +
                '> Si vas a comentar sucesos recientes de videojuegos, series, películas o manga, es obligatorio utilizar las etiquetas de spoiler (`||mensaje||`) para no arruinar la experiencia ajena.'
            );

        // Embed 4: Canales y Comunidad
        const embedComunidad = new EmbedBuilder()
            .setColor(colorAzul)
            .setTitle('# 03 — CANALES Y COMUNIDAD')
            .setDescription(
                '### `08` Respeto de canales correspondientes\n' +
                '> Cada canal de texto y voz cuenta con una finalidad específica. Utilizalos de acuerdo a su nombre y descripción para mantener la organización general del servidor.\n\n' +
                '### `09` Publicidad no autorizada (Spam de invitaciones)\n' +
                '> No está permitido promocionar redes sociales, canales personales ni enviar invitaciones a otros servidores de Discord, ni en el chat público ni a través de MD a miembros.\n\n' +
                '### `10` Roles, permisos y evasión\n' +
                '> Respeta la jerarquía establecida. Cualquier intento de explotar bugs del servidor, saltarse restricciones de permisos o ingresar con multicuentas para evadir sanciones será penalizado con ban definitivo.'
            );

        // Embed 5: Staff y Sanciones
        const embedStaff = new EmbedBuilder()
            .setColor(colorAzul)
            .setTitle('# 04 — STAFF Y SANCIONES')
            .setDescription(
                '### `11` Autoridad del equipo de moderación\n' +
                '> Las decisiones tomadas por moderadores y administradores tienen validez definitiva. Desafiar al staff o mostrar desacato durante un procedimiento solo agravará la sanción aplicada.\n\n' +
                '### `12` Sistema y tipos de sanciones\n' +
                '> De acuerdo a la gravedad o reincidencia de la falta se procederá con:\n' +
                '> • ⚠️ **Advertencia formal (`/warn`):** Llamado de atención registrado en los logs del servidor.\n' +
                '> • 🔇 **Aislamiento temporal (`/timeout`):** Pérdida temporal de acceso a enviar mensajes y hablar.\n' +
                '> • 🚫 **Expulsión o Ban permanente:** Remoción definitiva de la comunidad sin opción a reingreso.\n\n' +
                '### `13` Modificaciones al reglamento\n' +
                '> Las normativas pueden actualizarse en cualquier momento para el bienestar del servidor. Es responsabilidad exclusiva de cada usuario revisar este canal periódicamente.\n\n' +
                `${lineaLarga}\n` +
                '🌭 **¡Muchas gracias por formar parte y colaborar con PANCHOTEAM!**'
            );

        await interaction.channel.send({ 
            embeds: [embedHeader, embedConvivencia, embedChat, embedComunidad, embedStaff] 
        });

        await interaction.reply({ content: '✅ Reglamento publicado con éxito.', flags: ['Ephemeral'] });
    }
};