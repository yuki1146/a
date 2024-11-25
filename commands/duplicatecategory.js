// duplicateCategory.js
const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duplicatecategory')
        .setDescription('カテゴリと同じ権限でカテゴリを複製します。')
        .addChannelOption(option => 
            option.setName('source')
                .setDescription('複製元のカテゴリ')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)
        ),

    async execute(interaction) {
        const sourceChannel = interaction.options.getChannel('source');

        if (!sourceChannel || sourceChannel.type !== ChannelType.GuildCategory) {
            return interaction.reply({ content: '有効なカテゴリを選択してください。', ephemeral: true });
        }

        try {
            // 元のカテゴリの権限を取得
            const permissionOverwrites = sourceChannel.permissionOverwrites.cache.map(overwrite => ({
                id: overwrite.id,
                allow: overwrite.allow.bitfield,
                deny: overwrite.deny.bitfield,
                type: overwrite.type
            }));

            // 新しいカテゴリを作成
            const newCategory = await interaction.guild.channels.create({
                name: `${sourceChannel.name}-コピー`,
                type: ChannelType.GuildCategory,
                permissionOverwrites // 取得した権限を適用
            });

            await interaction.reply(`カテゴリ "${newCategory.name}" が作成され、元のカテゴリと同じ権限が設定されました。`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'カテゴリの複製中にエラーが発生しました。', ephemeral: true });
        }
    }
};
