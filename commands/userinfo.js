const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('ユーザー情報を表示します。')
        .addUserOption(option =>
            option.setName('ユーザー')
                .setDescription('情報を表示するユーザー')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('ユーザー');
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('ユーザー情報')
            .setThumbnail(user.displayAvatarURL()) // ユーザーのアイコンをサムネイルとして追加
            .addFields(
                { name: 'ユーザー名', value: user.username, inline: true },
                { name: 'ユーザーID', value: user.id, inline: true },
                { name: 'Botかユーザーか', value: user.bot ? 'Bot' : 'ユーザー', inline: true },
                { name: 'サーバー参加日', value: member.joinedAt.toLocaleString(), inline: true },
                { name: 'アカウント作成日', value: user.createdAt.toLocaleString(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
