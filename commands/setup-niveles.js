const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const ROLES_NIVEL = [
    { nivel: 5, color: '#95a5a6' },
    { nivel: 10, color: '#3498db' },
    { nivel: 15, color: '#2ecc71' },
    { nivel: 20, color: '#f1c40f' },
    { nivel: 25, color: '#e67e22' },
    { nivel: 30, color: '#e74c3c' },
    { nivel: 50, color: '#9b59b6' },
    { nivel: 75, color: '#1abc9c' },
    { nivel: 100, color: '#e91e63' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-niveles')
        .setDescription('Crea automáticamente los roles de nivel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const guild = interaction.guild;
        const creados = [];

        for (const item of ROLES_NIVEL) {
            const nombre = `Nivel ${item.nivel}`;
            let role = guild.roles.cache.find(r => r.name === nombre);
            if (!role) {
                role = await guild.roles.create({
                    name: nombre,
                    color: item.color,
                    reason: 'Setup de roles de nivel'
                });
                creados.push(nombre);
            }
        }

        if (creados.length === 0) {
            return interaction.editReply('Los roles de nivel ya estaban creados.');
        }

        await interaction.editReply(`Se crearon los siguientes roles: **${creados.join(', ')}**.\n*Recordá subir el rol del bot por encima de estos roles.*`);
    }
};