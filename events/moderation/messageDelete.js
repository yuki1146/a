const { EmbedBuilder } = require('discord.js');
const { channelId } = require('../../config.json');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        const logChannel = await message.guild.channels.fetch(channelId);
        const embed = new EmbedBuilder()
            .setTitle('メッセージが削除されました。')
            .setColor(0xff0000)
            .addFields(
                { name: 'メッセージ送信者', value: message.author.tag || '不明' },
                { name: 'メッセージ内容', value: message.content || '不明' }
            )
            .setTimestamp();

        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    },
};
