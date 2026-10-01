const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario del servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a banear').setRequired(true))
        .addStringOption(opt => opt.setName('motivo').setDescription('Razón del baneo').setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const motivo = interaction.options.getString('motivo') || 'Sin motivo especificado';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (member && !member.bannable) {
            return interaction.reply({ content: 'No puedo banear a este usuario (su rol es igual o superior al mío).', ephemeral: true });
        }

        // 1. Mensaje privado al usuario
        await user.send(`Fuiste baneado permanentemente de **${interaction.guild.name}**.\n**Motivo:** ${motivo}`).catch(() => null);

        await interaction.guild.bans.create(user.id, { reason: motivo });

        // 2. Respuesta privada al mod
        await interaction.reply({ content: `🔨 Baneaste a **${user.tag}** exitosamente.`, ephemeral: true });

        // 3. Log al canal de mods
        const canalLogsId = process.env.CANAL_LOGS_SANCIONES;
        const canalLogs = canalLogsId ? interaction.guild.channels.cache.get(canalLogsId) : null;

        if (canalLogs) {
            const embed = new EmbedBuilder()
                .setColor(0xe74c3c)
                .setTitle('🔨 Usuario baneado')
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