// Example in your command file
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion_prompt')
        .setDescription('管理者用の提案モーダル表示コマンド'),
    async execute(interaction) {
        // Check for administrator permissions
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'このコマンドは管理者のみが使用できます。', ephemeral: true });
        }

        // Send an ephemeral reply to the command user
        await interaction.reply({ content: '提案受付メッセージをチャンネルに投稿しました。', ephemeral: true });

        // Create the suggestion prompt embed
        const suggestionEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('💡 提案をしてください！')
            .setDescription('下のボタンをクリックして、提案モーダルを開いてください。');

        // Create a button for opening the modal
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('openSuggestionModal')
                    .setLabel('提案する')
                    .setStyle(ButtonStyle.Primary)
            );

        // Send the embed with the button to the channel
        const channel = interaction.channel;
        await channel.send({ embeds: [suggestionEmbed], components: [row] });
    },
};
