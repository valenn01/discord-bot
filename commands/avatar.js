const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Muestra el avatar de un usuario o el tuyo')
        .addUserOption(opt =>
            opt.setName('usuario')
                .setDescription('Usuario del que querés ver el avatar')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`Avatar de ${user.username}`)
            .setImage(avatarUrl)
            .setFooter({ text: `Solicitado por ${interaction.user.username}` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Ver original')
                .setStyle(ButtonStyle.Link)
                .setURL(avatarUrl)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};