const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra los comandos disponibles para vos'),

    async execute(interaction) {
        const member = interaction.member;
        const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
        const isMod = member.permissions.has(PermissionFlagsBits.ModerateMembers);

        const embed = new EmbedBuilder()
            .setColor(0x8b5cf6)
            .setTitle(`📖 Comandos disponibles — ${interaction.guild.name}`)
            .setDescription('Esta lista solo muestra comandos que tenés permiso de usar:')
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const comunidad = [];
        const moderacion = [];
        const admin = [];

        interaction.client.commands.forEach((cmd) => {
            const perms = cmd.data.default_member_permissions;

            if (!perms) {
                // Sin permisos requeridos: Comunidad general
                comunidad.push(`\`/${cmd.data.name}\` — ${cmd.data.description}`);
            } else if (isAdmin) {
                // Admin ve todo lo restringido
                if (cmd.data.name.startsWith('setup') || cmd.data.name === 'setlevel') {
                    admin.push(`\`/${cmd.data.name}\` — ${cmd.data.description}`);
                } else {
                    moderacion.push(`\`/${cmd.data.name}\` — ${cmd.data.description}`);
                }
            } else if (isMod) {
                // Mod solo ve moderación, no setups
                if (!cmd.data.name.startsWith('setup') && cmd.data.name !== 'setlevel') {
                    moderacion.push(`\`/${cmd.data.name}\` — ${cmd.data.description}`);
                }
            }
        });

        if (comunidad.length) embed.addFields({ name: '👥 Comunidad', value: comunidad.join('\n') });
        if (moderacion.length) embed.addFields({ name: '🛡️ Moderación', value: moderacion.join('\n') });
        if (admin.length) embed.addFields({ name: '⚙️ Administración', value: admin.join('\n') });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};