const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database.js');

function getXpParaSiguienteNivel(nivel) {
    return 5 * Math.pow(nivel, 2) + 50 * nivel + 100;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Muestra el nivel y experiencia')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a consultar')),

    async execute(interaction) {
        await interaction.deferReply();

        const target = interaction.options.getUser('usuario') || interaction.user;

        try {
            const res = await db.query('SELECT * FROM niveles WHERE "userId" = $1', [target.id]);
            const user = res.rows[0];

            if (!user) {
                return interaction.editReply({ 
                    content: `${target.username} todavía no tiene experiencia registrada.` 
                });
            }

            const xpRequerida = getXpParaSiguienteNivel(user.nivel);

            const embed = new EmbedBuilder()
                .setColor(0x5865f2)
                .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
                .addFields(
                    { name: 'Nivel', value: `\`${user.nivel}\``, inline: true },
                    { name: 'Progreso', value: `\`${user.xp} / ${xpRequerida} XP\``, inline: true }
                )
                .setFooter({ text: interaction.guild.name });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error en rank:', error);
            await interaction.editReply({ 
                content: 'Hubo un error al consultar el nivel.' 
            });
        }
    }
};