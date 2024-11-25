const { EmbedBuilder } = require('discord.js');
const { clientId, guildId, channelId } = require('../config.json');

module.exports = {
  name: 'threadCreate',
  async execute(thread) {
    if (thread.parent.type === 15) {  // フォーラムチャンネルのスレッドのみ対象
      const logChannel = await thread.guild.channels.fetch(channelId);
      
      const embed = new EmbedBuilder()
        .setTitle('新しいスレッドが作成されました。')
        .setDescription(`スレッド名: ${thread.name}`)
        .addFields(
          { name: 'スレッド作成者', value: `<@${thread.ownerId}>` },
          { name: 'スレッド ID', value: thread.id }
        )
        .setTimestamp()
        .setColor(0x00ff00);

      if (logChannel) {
        logChannel.send({ embeds: [embed] });
      }
    }
  }
};
