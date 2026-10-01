const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a expulsar').setRequired(true))
        .addStringOption(opt => opt.setName('motivo').setDescription('Razón de la expulsión').setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const motivo = interaction.options.getString('motivo') || 'Sin motivo especificado';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'El usuario no está en este servidor.', ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: 'No puedo expulsar a este usuario (su rol es igual o superior al mío).', ephemeral: true });
        }

        // 1. Mensaje privado al usuario
        await user.send(`Fuiste expulsado de **${interaction.guild.name}**.\n**Motivo:** ${motivo}`).catch(() => null);

        await member.kick(motivo);

        // 2. Respuesta privada al mod
        await interaction.reply({ content: `✅ Expulsaste a **${user.tag}** exitosamente.`, ephemeral: true });

        // 3. Log al canal de mods
        const canalLogsId = process.env.CANAL_LOGS_SANCIONES;
        const canalLogs = canalLogsId ? interaction.guild.channels.cache.get(canalLogsId) : null;

        if (canalLogs) {
            const embed = new EmbedBuilder()
                .setColor(0xe67e22)
                .setTitle('👢 Usuario expulsado')
                .addFields(
                    { name: 'Usuario', value: `${user.tag} (\`${user.id}\`)`, inline: true },
                    { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Canal de origen', value: `${interaction.channel}`, inline: true },
                    { name: 'Motivo', value: motivo }
                )
                .setTimestamp();

            canalLogs.send({ embeds: [embed] });
        }
    }
};