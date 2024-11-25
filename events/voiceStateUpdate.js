const { EmbedBuilder } = require('discord.js');
const { channelId } = require('../config.json');

module.exports ={
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const logChannel = await client.channels.fetch(channelId);
        if (!logChannel) return;

        let embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTimestamp();

        // ボイスチャンネルに参加
        if (!oldState.channel && newState.channel) {
            embed.setTitle('ボイスチャンネル参加')
                .setDescription(`${newState.member.displayName} が ${newState.channel.name} に参加しました。`)
                .setFooter({ text: `ユーザーID: ${newState.id}` });
        }
        // ボイスチャンネルから退出
        else if (oldState.channel && !newState.channel) {
            embed.setTitle('ボイスチャンネル退出')
                .setDescription(`${oldState.member.displayName} が ${oldState.channel.name} から退出しました。`)
                .setFooter({  text: `ユーザーID: ${oldState.id}` });
        }
        // ボイスチャンネル間の移動
        else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            embed.setTitle('ボイスチャンネル移動')
                .setDescription(`${oldState.member.displayName} が ${oldState.channel.name} から ${newState.channel.name} に移動しました。`)
                .setFooter({ text: `ユーザーID: ${oldState.id}` });
        }

        if (embed.data.title) {
            logChannel.send({ embeds: [embed] });
        }
    }
};
