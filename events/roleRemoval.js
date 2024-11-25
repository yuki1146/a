const { Events, EmbedBuilder } = require('discord.js');
const { channelId, roleId } = require('../config.json');

let lastUserId = null; // 最後に処理したユーザーIDを保存する変数

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember, client) {
        // 既に処理したユーザーの場合は無視
        if (newMember.id === lastUserId) return;

        const role = newMember.roles.cache.get(roleId);
        if (role && !oldMember.roles.cache.has(roleId)) {
            const rolesToRemove = newMember.roles.cache.filter(r => r.id !== roleId);

            if (rolesToRemove.size > 0) {
                try {
                    await newMember.roles.remove(rolesToRemove);
                    lastUserId = newMember.id; // 処理したユーザーIDを保存

                    const logChannel = await client.channels.fetch(channelId);
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle('ロールの剥奪完了')
                            .setDescription(`${newMember} から次のロールが剥奪されました:\n${rolesToRemove.map(r => r.name).join(', ')}`)
                            .addFields(
                                { name: 'ユーザーID', value: newMember.id, inline: true },
                                { name: '現在のロール', value: newMember.roles.cache.map(r => r.name).join(', ') || 'なし', inline: true }
                            )
                            .setTimestamp();

                        await logChannel.send({ embeds: [embed] });
                    } else {
                        console.error('指定されたチャンネルが見つかりません。');
                    }
                } catch (error) {
                    console.error('ロールの剥奪中にエラーが発生しました:', error);
                }
            }
        }
    },
};
