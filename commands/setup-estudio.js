const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-estudio')
        .setDescription('Publica el mensaje con reacción para desbloquear la zona de estudio')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Seleccioná el rol de Estudio')
                .setRequired(true)
        ),

    async execute(interaction) {
        const rol = interaction.options.getRole('rol');

        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('📚 Zona de Estudio & Productividad')
            .setDescription(
                '¿Querés acceder a la categoría de estudio para compartir apuntes, recursos, debatir dudas o concentrarte?\n\n' +
                'Reaccioná con **📚** a este mensaje para desbloquear los canales dedicados.\n' +
                '*(Si quitás la reacción, se te remueve el rol y la categoría se oculta)*'
            )
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

        // Enviar mensaje al canal actual
        const mensaje = await interaction.channel.send({ embeds: [embed] });

        // Clavarle la reacción inicial
        await mensaje.react('📚');

        // Guardar IDs en la base de datos
        await db.query(
            `INSERT INTO config (clave, valor) VALUES ('msg_estudio', $1) 
             ON CONFLICT (clave) DO UPDATE SET valor = $1`,
            [mensaje.id]
        );

        await db.query(
            `INSERT INTO config (clave, valor) VALUES ('rol_estudio', $1) 
             ON CONFLICT (clave) DO UPDATE SET valor = $1`,
            [rol.id]
        );

        await interaction.reply({
            content: `Panel de estudio publicado y configurado con el rol ${rol}.`,
            ephemeral: true
        });
    }
};