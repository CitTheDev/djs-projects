const { ChatInputCommandInteraction, Client, EmbedBuilder, SelectMenuBuilder, ActionRowBuilder, ApplicationCommandOptionType, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("rpanel")
    .setDescription("Setup your dropdown role system")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .setDMPermission(false)
    .addStringOption((option1) => option1
    .setName("description")
    .setDescription("Provide a description for the dropdown menu")
    .setRequired(true)
    )
    .addStringOption((option2) => option2
    .setName("roles")
    .setDescription("Provide a list of roles by pinging them")
    .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const roleIds = interaction.options.getString("roles").match(/<@&(\d{17,19})>/g) || [];
        const description = interaction.options.getString("description");
        const embed = new EmbedBuilder();
        let rolesList = [];

        if (!roleIds.length) {
            embed
                .setColor("Red")
                .setDescription(`You haven't provided valid roles`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        let invalidRoles = [];
        
        for (let i = 0; i < roleIds?.length; i++) {
            const id = roleIds[i].slice(3, -1);
            const role = await interaction.guild.roles.cache.get(id);
            if (role.managed) invalidRoles.push(role);
            rolesList.push({ label: role.name, value: role.id, description: `Select the ${role.name} role` });
        }

        if (invalidRoles.length) {
            embed
                .setColor("Red")
                .setDescription(`You have provided invalid roles: ${invalidRoles.map((r) => r).join(", ")}`);
            return interaction.reply({ embeds: [embed] });
        }

        const mainEmbed = new EmbedBuilder()
            .setColor("NotQuiteBlack")
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setDescription(description.substring(0, 4096));

        const rolesMenu = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId("role-menu")
                .setPlaceholder("Select a role!")
                .addOptions(rolesList)
        );

        await interaction.channel.send({ embeds: [mainEmbed], components: [rolesMenu] }).then(() => {
            embed
                .setColor("Green")
                .setDescription(`Dropdown menu has been created`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }).catch(() => {
            embed
                .setColor("Red")
                .setDescription(`There was an error while trying to setup the dropdown role system`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        });
    },
};
