const {
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('ボタンでの認証')
        .addRoleOption((option) =>
            option
                .setName('role')
                .setDescription('ロールを選択')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            // 応答を保留
            await interaction.deferReply({ ephemeral: true });

            const role = interaction.options.getRole('role');

            const button = new ButtonBuilder()
                .setCustomId(`verify_button_${role.id}`)
                .setLabel('認証')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(button);

            const embed = new EmbedBuilder()
                .setTitle('認証')
                .setDescription(`ボタンを押すことで認証を行います`);

            // チャンネルに認証パネルを送信
            await interaction.channel.send({ embeds: [embed], components: [row] });

            // 応答を編集して結果を通知
            await interaction.editReply({
                content: '認証パネルを設置しました',
            });
        } catch (error) {
            console.error('verifyコマンドの実行中にエラーが発生しました:', error);
            await interaction.followUp({
                content: 'エラーが発生しました。もう一度お試しください。',
                ephemeral: true,
            });
        }
    },
};
