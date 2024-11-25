const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletemessages')
        .setDescription('指定されたメッセージを削除します。')
        .addIntegerOption(option => 
            option.setName('数')
                .setDescription('削除するメッセージの数 (最大50)')
                .setRequired(true)),
    async execute(interaction) {
        const messageCount = interaction.options.getInteger('数');

        // 管理者権限をチェック
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'このコマンドは管理者のみが使用できます。', ephemeral: true });
        }

        // 最大50件の制限
        if (messageCount < 1 || messageCount > 50) {
            return interaction.reply({ content: '削除できるメッセージは1〜50件です。', ephemeral: true });
        }

        // 削除確認メッセージ
        const confirmMessage = await interaction.reply({
            content: `${messageCount}件のメッセージを削除しますか？\nこの操作は取り消せません。`,
            fetchReply: true,
        });

        // 確認ボタンを設定
        await confirmMessage.react('✅');
        await confirmMessage.react('❌');

        // 反応のフィルターを設定
        const filter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        };

        // 反応が付くのを待機
        const collected = await confirmMessage.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] }).catch(() => null);
        
        if (!collected) {
            return interaction.followUp({ content: '操作がタイムアウトしました。', ephemeral: true });
        }

        const reaction = collected.first();

        if (reaction.emoji.name === '✅') {
            // メッセージの削除処理
            const deletedMessages = await interaction.channel.bulkDelete(messageCount, true).catch(err => {
                console.error(err);
                return interaction.followUp({ content: 'メッセージの削除中にエラーが発生しました。', ephemeral: true });
            });

            // ログチャンネルにメッセージを送信
            const logChannelId = '1264149945058070560'; // ログチャンネルのIDを指定
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('メッセージ削除ログ')
                .addFields(
                    { name: '削除件数', value: `${deletedMessages.size}`, inline: true },
                    { name: '実行者', value: `${interaction.user.tag}`, inline: true },
                    { name: '実行したチャンネル', value: `${interaction.channel.name}`, inline: true },
                    { name: '日時', value: `${new Date().toLocaleString()}`, inline: true }
                )
                .setTimestamp();

            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            } else {
                console.error('ログチャンネルが見つかりません。');
            }

            return interaction.followUp({ content: `${deletedMessages.size}件のメッセージを削除しました。`, ephemeral: true });
        } else {
            return interaction.followUp({ content: 'メッセージ削除がキャンセルされました。', ephemeral: true });
        }
    },
};
