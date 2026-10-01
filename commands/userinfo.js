const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra la información de un usuario o la tuya')
        .addUserOption(opt =>
            opt.setName('usuario')
                .setDescription('Usuario a inspeccionar')
                .setRequired(false)
        ),

    async execute(interaction) {
        const member = interaction.options.getMember('usuario') || interaction.member;
        const user = member.user;

        const roles = member.roles.cache
            .filter(r => r.id !== interaction.guild.id)
            .map(r => r.toString())
            .join(' ') || 'Ninguno';

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '🆔 ID', value: `\`${user.id}\``, inline: true },
                { name: '🤖 Bot', value: user.bot ? 'Sí' : 'No', inline: true },
                { name: '📅 Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: false },
                { name: '📥 Ingreso al server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: false },
                { name: `🎭 Roles [${member.roles.cache.size - 1}]`, value: roles }
            )
            .setFooter({ text: interaction.guild.name });

        await interaction.reply({ embeds: [embed] });
    }
};