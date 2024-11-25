const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('サーバー情報を表示します。'),
    async execute(interaction) {
        const guild = interaction.guild;

        // メンバーを完全に取得
        await guild.members.fetch();

        // チャンネルとメンバー情報のカウント
        const textChannelCount = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
        const voiceChannelCount = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
        const memberCount = guild.memberCount;
        const userCount = guild.members.cache.filter(member => !member.user.bot).size;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;

        // Embed メッセージの作成
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('サーバー情報')
            .addFields(
                { name: 'サーバー名', value: guild.name, inline: true },
                { name: 'サーバーID', value: guild.id, inline: true },
                { name: '所有者', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'ブーストレベル', value: guild.premiumTier.toString(), inline: true },
                { name: 'BAN合計人数', value: (await guild.bans.fetch()).size.toString(), inline: true },
                { name: 'テキストチャンネル数', value: textChannelCount.toString(), inline: true },
                { name: 'ボイスチャンネル数', value: voiceChannelCount.toString(), inline: true },
                { name: 'メンバー数', value: memberCount.toString(), inline: true },
                { name: 'ユーザー数', value: userCount.toString(), inline: true },
                { name: 'Botの数', value: botCount.toString(), inline: true },
                { name: 'ロール数', value: guild.roles.cache.size.toString(), inline: true },
                { name: '絵文字数', value: guild.emojis.cache.size.toString(), inline: true },
                { name: 'サーバー作成日', value: guild.createdAt.toLocaleString(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
