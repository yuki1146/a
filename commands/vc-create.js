const {
    SlashCommandBuilder,
    ChannelType,
    PermissionsBitField,
    Events,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vc-create")
        .setDescription(
            "指定されたカテゴリーにcreate-vcボイスチャンネルを作成します。"
        )
        .addChannelOption((option) =>
            option
                .setName("category")
                .setDescription(
                    "ボイスチャンネルを作成するカテゴリーを選択してください。"
                )
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        ),
    async execute(interaction) {
        const category = interaction.options.getChannel("category");

        const voiceChannel = await interaction.guild.channels.create({
            name: "create-vc",
            type: ChannelType.GuildVoice,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
            ],
        });

        await interaction.reply({
            content: `${voiceChannel.toString()}が「${
                category.name
            }」カテゴリーに作成されました。`,
            ephemeral: true,
        });

        const voiceCollector = async (oldState, newState) => {
            if (
                newState.channelId === voiceChannel.id &&
                !newState.member.user.bot
            ) {
                const member = newState.member;
                const newChannelName = member.user.username;

                const tempVoiceChannel =
                    await interaction.guild.channels.create({
                        name: newChannelName,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites:
                            voiceChannel.permissionOverwrites.cache.map(
                                (overwrite) => ({
                                    id: overwrite.id,
                                    allow: overwrite.allow,
                                    deny: overwrite.deny,
                                })
                            ),
                    });

                await member.voice.setChannel(tempVoiceChannel);

                const tempCollector = (oldState, newState) => {
                    if (
                        oldState.channelId === tempVoiceChannel.id &&
                        tempVoiceChannel.members.size === 0
                    ) {
                        tempVoiceChannel.delete().then(async () => {
                            const config = require("../config.json");
                            const channelId =
                                interaction.guild.channels.cache.get(
                                    config.channelId
                                );

                            if (channelId) {
                                await channelId.send(
                                    `一時的なボイスチャンネル「${newChannelName}」はメンバーがいないため削除されました。`
                                );
                            } else {
                                console.error("チャンネルが見つかりません。");
                            }
                            interaction.client.removeListener(
                                Events.VoiceStateUpdate,
                                tempCollector
                            );
                        });
                    }
                };

                interaction.client.on(Events.VoiceStateUpdate, tempCollector);
            }
        };

        interaction.client.on(Events.VoiceStateUpdate, voiceCollector);
    },
};
