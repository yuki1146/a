const {
    EmbedBuilder,
    SlashCommandBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedmessage')
        .setDescription('埋め込みメッセージを送信します。')
        .addStringOption(option => 
            option.setName('title')
                .setDescription('埋め込みメッセージのタイトル')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('message')
                .setDescription('埋め込みメッセージの内容')
                .setRequired(true)),

    async execute(interaction) {
        const title = interaction.options.getString('title');
        const messageContent = interaction.options.getString('message');

        await interaction.deferReply({ ephemeral: true });

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(title)
            .setDescription(messageContent)
            .setTimestamp();

        try {
            await interaction.channel.send({ embeds: [embed] });
            await interaction.editReply({ content: '埋め込みメッセージを送信しました。' });
        } catch (error) {
            console.error('埋め込みメッセージの送信中にエラーが発生しました:', error);
            await interaction.editReply({ content: '埋め込みメッセージの送信中にエラーが発生しました。' });
        }
    },
};
