const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ROLES_NIVEL } = require('../utils/config.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-niveles')
        .setDescription('Crea o actualiza automáticamente los roles de nivel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const guild = interaction.guild;
        const creados = [];
        const actualizados = [];

        for (const item of ROLES_NIVEL) {
            // Busca primero si ya tiene el nombre nuevo, o si existe el viejo "Nivel X"
            let role = guild.roles.cache.find(r => r.name === item.nombre) 
                    || guild.roles.cache.find(r => r.name === `Nivel ${item.nivel}`);

            if (!role) {
                // Si no existe ninguno, lo crea con el nombre estilizado
                role = await guild.roles.create({
                    name: item.nombre,
                    color: item.color,
                    reason: 'Setup de roles de nivel'
                });
                creados.push(item.nombre);
            } else if (role.name !== item.nombre) {
                // Si existía con el nombre viejo, lo renombra y actualiza el color
                await role.edit({
                    name: item.nombre,
                    color: item.color,
                    reason: 'Actualización de formato de rol de nivel'
                });
                actualizados.push(item.nombre);
            }
        }

        if (creados.length === 0 && actualizados.length === 0) {
            return interaction.editReply('Los roles de nivel ya están al día con sus nombres y colores.');
        }

        let mensaje = '';
        if (creados.length > 0) mensaje += `Creados: **${creados.join(', ')}**\n`;
        if (actualizados.length > 0) mensaje += `Actualizados: **${actualizados.join(', ')}**\n`;
        mensaje += '\n*Recordá tener el rol del bot por encima de estos roles en Discord.*';

        await interaction.editReply(mensaje);
    }
};