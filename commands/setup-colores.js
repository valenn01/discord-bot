const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder,
    ChannelType 
} = require('discord.js');

const { COLORES } = require('../utils/config.js');
// Lista ampliada de colores bien diferenciados

const GIF_FUEGO = 'https://cdn.discordapp.com/emojis/1228718319612465284.gif?size=128&quality=lossless';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-colores')
        .setDescription('Crea roles, canal y el panel selector de colores con GIF de fuego')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

async execute(interaction) {
    // 1. Responder a Discord DE INMEDIATO (primerísima línea)
    await interaction.deferReply({ flags: ['Ephemeral'] });

    const guild = interaction.guild;

    // 2. Traer todos los roles al caché de un solo tirón para no saturar la API
    await guild.roles.fetch();

    const rolesCreados = [];

    // 3. Crear solo los roles que realmente falten
    for (const item of COLORES) {
        let role = guild.roles.cache.find(r => r.name === item.name);
        if (!role) {
            role = await guild.roles.create({
                name: item.name,
                color: item.color,
                reason: 'Setup automático de roles de color'
            });
        }
        rolesCreados.push({ id: role.id, name: item.name, emoji: item.emoji });
    }

    // 4. Canal
    let channel = guild.channels.cache.find(c => c.name === '🎨│auto-rol' || c.name === '🎨・roles-color');
    if (!channel) {
        channel = await guild.channels.create({
            name: '🎨│auto-rol',
            type: ChannelType.GuildText,
            topic: 'Elegí el color para tu nombre'
        });
    }

    // 5. Select Menu
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('selector_color')
        .setPlaceholder('Seleccioná un color para tu nombre...')
        .addOptions(
            ...rolesCreados.map(r => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(r.name)
                    .setValue(r.id)
                    .setEmoji(r.emoji)
            ),
            new StringSelectMenuOptionBuilder()
                .setLabel('Quitarme el color')
                .setValue('quitar_color')
                .setEmoji('❌')
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('🔥 Color Roles Selection')
        .setDescription('Elegí una opción del menú inferior para cambiar el color de tu nombre.\n')
        .setThumbnail('https://cdn.discordapp.com/emojis/1228718319612465284.gif?size=128&quality=lossless')
        .setFooter({ text: guild.name, iconURL: guild.iconURL() });

    await channel.send({ embeds: [embed], components: [row] });
    
    // 6. Editar la respuesta diferida inicial
    await interaction.editReply({ content: `Panel y roles configurados con éxito en ${channel}.` });
}
};