const Member = require('../../classes/GuildMember');
const { Message } = require('discord.js');
const Client = require('../../classes/Unicron');
const BaseCommand = require('../../classes/BaseCommand');

module.exports = class extends BaseCommand {
    constructor() {
        super({
            config: {
                name: 'clearwarns',
                description: 'Clear warnings of a specific user!',
                permission: 'Server Administrator',
            },
            options: {
                aliases: ['clearwarnings'],
                clientPermissions: [],
                cooldown: 1,
                nsfwCommand: false,
                args: true,
                usage: 'clearwarns <User>',
                donatorOnly: false,
                premiumServer: false,
            }
        });
    }
    /**
     * @returns {Promise<Message|boolean>}
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array<string>} args 
     */
    async run(client, message, args) {
        const target = await client.resolveUser(args[0]);
        if (!target || target.bot) return message.channel.send(`** *:no_entry_sign: This user dosent exist!* **`);
        const member = new Member(target.id, message.guild.id);
        const warns = await member.warnings.fetchAll();
        if (warns) {
            await member.warnings.destroy();
            return message.channel.send(`** *:white:check_mark: ${target} was unwarned!* **`);
        }
        return message.channel.send(`:no_entry_sign: No warnings found!`);
    }
}