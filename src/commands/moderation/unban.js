const Discord = require('discord.js');
const { Message } = require('discord.js');
const Client = require('../../classes/Unicron');

const BaseCommand = require('../../classes//BaseCommand');
module.exports = class extends BaseCommand {
    constructor() {
        super({
            config: {
                name: 'unban',
                description: 'Remove someone from the server!',
                permission: 'Server Administrator',
            },
            options: {
                aliases: [],
                clientPermissions: ['BAN_MEMBERS'],
                cooldown: 10,
                nsfwCommand: false,
                args: true,
                usage: 'unban <UserID> [...Reason]',
                donatorOnly: false,
                premiumServer: false,
            },
        });
    }
    /**
     * @returns {Promise<Message|boolean>}
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array<string>} args 
     */
    async run(client, message, args) {
        const [user_id, ...reason] = args;
        try {
            const member = await message.guild.fetchBan(user_id);
            try {
                const user = await message.guild.members.unban(member.user.id, reason ? reason.join(' ') : 'No reason provided');
                const modChannel = await client.channels.fetch(message.guild.db.moderation('modLogChannel')).catch(() => { });
                if (modChannel) {
                    modChannel.send(new Discord.MessageEmbed()
                        .setColor('RANDOM')
                        .setTimestamp()
                        .setAuthor(`${message.author.tag} / ${message.author.id}`, message.author.displayAvatarURL({ dynamic: true }) || message.guild.iconURL())
                        .setDescription(`**Member** : ${user.tag} / ${user.id}\n**Action** : Pardon/Unban\n**Reason** : ${reason ? reason.join(' ') : 'No reason provided'}`)
                    );
                }
                message.channel.send('** *:white_check_mark: Unbanned!* **');
            }
            catch (e) {
                return message.channel.send('** *:no_entry_sign: Sorry, i couldnt unban that user.* **');
            }
        }
        catch (e) {
            message.channel.send('** *:no_entry_sign: That user dosent exist* **');
        }
    }
}