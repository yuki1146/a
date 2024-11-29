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
const { constrainedMemory } = require('process');
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

// イベントの読み込み
const loadEvents = (dir = './events') => {
    const eventFiles = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of eventFiles) {
        if (file.isDirectory()) {
            // サブディレクトリ内のイベントも再帰的に読み込む
            loadEvents(`${dir}/${file.name}`);
        } else if (file.name.endsWith('.js')) {
            const event = require(`${dir}/${file.name}`);
            if (event.name) {
                client.on(event.name, (...args) => event.execute(...args, client));
                console.log(`Loaded event: ${event.name} from ${dir}/${file.name}`);
            } else {
                console.error(`Invalid event format in ${dir}/${file.name}:`, event);
            }
        }
    }
};

// イベントの登録
loadEvents();

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

client.login(process.env.token);
