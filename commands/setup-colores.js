const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder,
    ChannelType 
} = require('discord.js');

// Lista de colores que el bot va a crear automáticamente
const COLORES = [
    { name: 'Rojo Carmesí', color: '#e74c3c', emoji: '🔴' },
    { name: 'Azul Eléctrico', color: '#3498db', emoji: '🔵' },
    { name: 'Verde Esmeralda', color: '#2ecc71', emoji: '🟢' },
    { name: 'Violeta Neón', color: '#9b59b6', emoji: '🟣' },
    { name: 'Amarillo Dorado', color: '#f1c40f', emoji: '🟡' },
    { name: 'Rosa Pastel', color: '#e91e63', emoji: '🌸' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-colores')
        .setDescription('Crea roles, canal y el panel selector de colores automáticamente')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const guild = interaction.guild;

        const rolesCreados = [];

        // 1. Crear los roles si no existen
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

        // 2. Crear canal de texto exclusivo
        let channel = guild.channels.cache.find(c => c.name === '🎨・roles-color');
        if (!channel) {
            channel = await guild.channels.create({
                name: '🎨・roles-color',
                type: ChannelType.GuildText,
                topic: 'Elegí el color para tu nombre'
            });
        }

        // 3. Crear el menú desplegable
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('selector_color')
            .setPlaceholder('Seleccioná un color para tu nombre')
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
            .setColor(0x8b5cf6)
            .setTitle('🎨 Personalizá el color de tu nombre')
            .setDescription('Elegí una opción del menú inferior. Al elegir uno nuevo, se reemplazará automáticamente el anterior.')
            .setFooter({ text: guild.name });

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.editReply({ content: `Panel y roles configurados con éxito en ${channel}.` });
    }
};