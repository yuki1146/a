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
                .setDescription(`ボタンを押すことで認証を行います。`);

            // チャンネルに認証パネルを送信
            await interaction.channel.send({ embeds: [embed], components: [row] });

            // 応答を編集して結果を通知
            await interaction.editReply({
                content: '認証パネルを設置しました。',
            });
        } catch (error) {
            console.error('verifyコマンドの実行中にエラーが発生しました:', error);
            await interaction.followUp({
                content: 'エラーが発生しました。もう一度お試しください。',
                ephemeral: true,
            });
        }
    },

    // ボタンのクリック処理
    async buttonHandler(interaction) {
        if (!interaction.isButton()) return;

        // ボタンのカスタムIDが "verify_button_" で始まる場合のみ処理を行う
        const roleId = interaction.customId.split('_')[2];
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
            await interaction.reply({
                content: '指定されたロールが見つかりません。',
                ephemeral: true,
            });
            return;
        }

        // ユーザーがすでにロールを持っているか確認
        if (interaction.member.roles.cache.has(role.id)) {
            await interaction.reply({
                content: 'すでにこのロールが付与されています！',
                ephemeral: true,
            });
            return;
        }

        try {
            // ロールをユーザーに付与
            await interaction.member.roles.add(role);
            await interaction.reply({
                content: '認証が完了し、ロールが付与されました！',
                ephemeral: true,
            });
        } catch (error) {
            console.error('ロールの付与中にエラーが発生しました:', error);
            await interaction.reply({
                content: 'ロールを付与する際にエラーが発生しました。',
                ephemeral: true,
            });
        }
    },
};
