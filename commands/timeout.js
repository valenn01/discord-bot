const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Aisla temporalmente a un usuario (mute)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a aislar').setRequired(true))
        .addIntegerOption(opt => 
            opt.setName('minutos')
                .setDescription('Duración del aislamiento en minutos')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)
        )
        .addStringOption(opt => opt.setName('motivo').setDescription('Razón del aislamiento').setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const minutos = interaction.options.getInteger('minutos');
        const motivo = interaction.options.getString('motivo') || 'Sin motivo especificado';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'El usuario no está en este servidor.', ephemeral: true });
        }

        if (!member.moderatable) {
            return interaction.reply({ content: 'No puedo aislar a este usuario (su rol es igual o superior al mío).', ephemeral: true });
        }

        // 1. Mensaje privado al usuario
        await user.send(`Fuiste aislado temporalmente en **${interaction.guild.name}** por ${minutos} minuto(s).\n**Motivo:** ${motivo}`).catch(() => null);

        await member.timeout(minutos * 60 * 1000, motivo);

        // 2. Respuesta privada al mod
        await interaction.reply({ content: `🔇 Aislaste a **${user.tag}** por ${minutos} minuto(s).`, ephemeral: true });

        // 3. Log al canal de mods
        const canalLogsId = process.env.CANAL_LOGS_SANCIONES;
        const canalLogs = canalLogsId ? interaction.guild.channels.cache.get(canalLogsId) : null;

        if (canalLogs) {
            const embed = new EmbedBuilder()
                .setColor(0x95a5a6)
                .setTitle('🔇 Usuario aislado')
                .addFields(
                    { name: 'Usuario', value: `${user.tag} (\`${user.id}\`)`, inline: true },
                    { name: 'Duración', value: `${minutos} minuto(s)`, inline: true },
                    { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Canal de origen', value: `${interaction.channel}`, inline: true },
                    { name: 'Motivo', value: motivo }
                )
                .setTimestamp();

            canalLogs.send({ embeds: [embed] });
        }
    }
};