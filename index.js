const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    Events,
    PresenceUpdateStatus,
    ActivityType,
    Collection,
} = require('discord.js');
const { clientId, guildId, channelId } = require('./config.json');
const fs = require('fs');
require('dotenv').config();

// クライアントの作成
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ],
});

// コマンドのコレクションを初期化
client.commands = new Collection();

// moderationイベント読み込み
const banLog = require('./events/moderation/banLog');
const kickLog = require('./events/moderation/kickLog');
const timeoutLog = require('./events/moderation/timeoutLog');
const messageDeleteLog = require('./events/moderation/messageDeleteLog');
const messageEditLog = require('./events/moderation/messageEditLog');
const roleRemoval = require('./events/roleRemoval'); // 追加: roleRemovalイベントの読み込み

// moderation関連イベントの設定
client.on('guildBanAdd', (ban) => banLog.execute(ban));
client.on('guildMemberRemove', (member) => kickLog.execute(member));
client.on('guildMemberUpdate', (oldMember, newMember) => {
    timeoutLog.execute(oldMember, newMember);
    roleRemoval.execute(oldMember, newMember, client); // 追加: roleRemovalイベントの実行
});
client.on('messageDelete', (message) => messageDeleteLog.execute(message));
client.on('messageUpdate', (oldMessage, newMessage) => messageEditLog.execute(oldMessage, newMessage));

// コマンドの読み込みと重複チェック
const commands = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('.js'))
    .map((file) => {
        const command = require(`./commands/${file}`);
        if (command.data && command.data.name) {
            if (client.commands.has(command.data.name)) {
                console.error(`Duplicate command name detected: ${command.data.name}`);
                return null;
            }
            console.log(`Loaded command: ${command.data.name}`);
            client.commands.set(command.data.name, command);
            return command.data;
        } else {
            console.error(`Invalid command format in ${file}:`, command);
            return null;
        }
    })
    .filter(command => command !== null);

// Bot起動時の処理
client.once(Events.ClientReady, async () => {
    console.log('Botの起動完了');
    
    const channel = await client.channels.fetch(channelId);
    if (channel) {
        await channel.send('Botが起動しました。');
        console.log('起動メッセージを送信しました。');
    }

    client.user.setStatus(PresenceUpdateStatus.Online);
    client.user.setActivity({
        name: '~~起動中~~',
        type: ActivityType.Custom,
    });
});

// REST APIを用いてスラッシュコマンドを登録
const rest = new REST({ version: '10' }).setToken(process.env.token);

(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });
        console.log('コマンドの登録完了');
    } catch (error) {
        console.error('コマンド登録中のエラー:', error);
    }
})();

// イベントの読み込み
const loadEvents = () => {
    const eventFiles = fs
        .readdirSync('./events')
        .filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.name) {
            client.on(event.name, (...args) => event.execute(...args, client));
        } else {
            console.error(`Invalid event format in ${file}:`, event);
        }
    }
};

// スラッシュコマンドを登録
loadEvents();

client.login(process.env.token);
