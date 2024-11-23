const { Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { suggestionChannelId } = require('../config.json'); // 提案を送信するチャンネルIDを設定

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const client = interaction.client;

        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                await interaction.reply({ content: '不明なコマンドです。', ephemeral: true });
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
            }
        } 
        // 提案ボタンがクリックされたときにモーダルを表示
        else if (interaction.isButton() && interaction.customId === 'openSuggestionModal') {
            const modal = new ModalBuilder()
                .setCustomId('suggestionModal')
                .setTitle('サーバー及びBotへの提案');

            const suggestionInput = new TextInputBuilder()
                .setCustomId('suggestionInput')
                .setLabel('提案内容を入力してください。')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(suggestionInput);

            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }
        // モーダルの入力が送信されたとき
        else if (interaction.isModalSubmit() && interaction.customId === 'suggestionModal') {
            const suggestion = interaction.fields.getTextInputValue('suggestionInput');

            // 提案内容をEmbedで作成
            const suggestionEmbed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setTitle('新しい提案が届きました。')
                .setDescription(suggestion)
                .addFields(
                    { name: '提案者', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '提案日時', value: new Date().toLocaleString(), inline: true }
                )
                .setTimestamp();

            // 指定チャンネルに提案を送信
            const channel = await client.channels.fetch(suggestionChannelId);
            if (channel) {
                await channel.send({ embeds: [suggestionEmbed] });
                await interaction.reply({ content: '提案が送信されました。', ephemeral: true });
            } else {
                await interaction.reply({ content: '提案を送信するチャンネルが見つかりませんでした。', ephemeral: true });
            }
        }
        // 認証ボタンがクリックされたとき
        else if (interaction.isButton() && interaction.customId.startsWith('verify_button_')) {
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
        }
    },
};
