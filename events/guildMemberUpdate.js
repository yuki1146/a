const { EmbedBuilder } = require('discord.js');
const { channelId } = require('../config.json');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client) {
        if (oldMember.nickname !== newMember.nickname) {
            const logChannel = await client.channels.fetch(channelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setColor('#00ff99')
                .setTitle('ニックネーム変更')
                .setDescription(`${newMember.user.tag} がニックネームを変更しました。`)
                .addFields(
                    { name: '旧ニックネーム', value: oldMember.nickname || 'なし', inline: true },
                    { name: '新ニックネーム', value: newMember.nickname || 'なし', inline: true }
                )
                .setFooter({ text: `ユーザーID: ${newMember.id}` })
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    }
};
