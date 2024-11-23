const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); 
const { channelId } = require('../config.json'); // config.json からログチャンネルの ID を取得

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addreactionrole')
        .setDescription('リアクションロールを設定します。')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('付与/剥奪するロール')
                .setRequired(true)),

    async execute(interaction) {
        try {
            // 最初に遅延応答を行う
            await interaction.deferReply(); // 遅延応答を行う

            const role = interaction.options.getRole('role');

            // ボタンを作成
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`add_${role.id}`)
                        .setLabel(`このロールを取得`)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`remove_${role.id}`)
                        .setLabel(`このロールを剥奪`)
                        .setStyle(ButtonStyle.Danger)
                );

            // パネルメッセージを送信
            const panelMessage = await interaction.channel.send({
                content: 'リアクションロールを選択してください。',
                components: [row]
            });

            // ログを指定されたチャンネルに送信
            const logChannel = interaction.guild.channels.cache.get(channelId);
            if (logChannel) {
                await logChannel.send(`リアクションロールが設定されました！ロール: ${role.name}`);
            } else {
                console.error('ログチャンネルが見つかりません。');
            }

            // 遅延応答を終了し、次の処理を行う
            await interaction.editReply({ content: 'リアクションロールパネルを送信しました。', ephemeral: true });

            // ボタンのインタラクションを処理
            const filter = (buttonInteraction) => {
                return buttonInteraction.user.id === interaction.user.id;
            };

            const collector = panelMessage.createMessageComponentCollector({ filter, dispose: true });

            collector.on('collect', async (buttonInteraction) => {
                // インタラクションの状態がまだ有効であることを確認
                if (buttonInteraction.deferred || buttonInteraction.replied) {
                    return; // すでに応答されている場合は処理をスキップ
                }

                await buttonInteraction.deferUpdate(); // ボタンのインタラクションを遅延応答する

                try {
                    if (buttonInteraction.customId === `add_${role.id}`) {
                        await buttonInteraction.member.roles.add(role);
                        await buttonInteraction.followUp({ content: `ロール \"${role.name}\" が付与されました。`, ephemeral: true });
                    } else if (buttonInteraction.customId === `remove_${role.id}`) {
                        await buttonInteraction.member.roles.remove(role);
                        await buttonInteraction.followUp({ content: `ロール \"${role.name}\" が剥奪されました。`, ephemeral: true });
                    }
                } catch (error) {
                    console.error(error);
                    await buttonInteraction.followUp({ content: 'ロールの変更中にエラーが発生しました。', ephemeral: true });
                }
            });

        } catch (error) {
            console.error(error);
            // 遅延応答後にエラーが発生した場合は、followUp を使用
            await interaction.followUp({ content: 'エラーが発生しました。再試行してください。', ephemeral: true });
        }
    },
};
