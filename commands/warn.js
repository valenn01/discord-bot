const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Advierte a un usuario y registra la sanción')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt =>
            opt.setName('usuario')
                .setDescription('Usuario a advertir')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('razon')
                .setDescription('Motivo de la advertencia')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getMember('usuario');
        const user = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon');

        if (!target) {
            return interaction.reply({ content: 'El usuario no está en el servidor.', ephemeral: true });
        }

        if (target.id === interaction.user.id) {
            return interaction.reply({ content: 'No te podés advertir a vos mismo.', ephemeral: true });
        }

        // Aviso por MD
        await user.send({
            content: `⚠️ Recibiste una advertencia en **${interaction.guild.name}**\n**Motivo:** ${razon}`
        }).catch(() => null);

        // Registro en canal de logs
        const logChannelId = process.env.CANAL_LOGS_SANCIONES;
        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(0xE67E22)
                    .setTitle('⚠️ Usuario Advertido')
                    .addFields(
                        { name: 'Usuario', value: `${user.tag} (${user.id})`, inline: true },
                        { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
                        { name: 'Razón', value: razon }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }
        }

        await interaction.reply({ content: `✅ Se advirtió a **${user.tag}** por: *${razon}*` });
    }
};