
const Discord = require('discord.js');
const { Message } = require('discord.js');
const Client = require('../../classes/Unicron');
const BaseCommand = require('../../classes/BaseCommand');

module.exports = class extends BaseCommand {
    constructor() {
        super({
            config: {
                name: 'kick',
                description: 'Kick a member from the server!',
                permission: 'Server Moderator',
            },
            options: {
                aliases: [],
                clientPermissions: ['KICK_MEMBERS'],
                cooldown: 1,
                nsfwCommand: false,
                args: true,
                usage: 'kick <User> [...Reason]',
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
        const [user, ...reason] = args;
        const target = await client.resolveUser(user);
        if (!target) {
            return message.channel.send(new Discord.MessageEmbed()
                .setColor('RED')
                .setDescription(`:no_entry_sign: Incorrect Usage, the correct usages are:\n\`${this.options.usage}\``)
                .setTimestamp()
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL({ dynamic: true }))
            );
        }
        if (target.equals(message.author)) {
            return message.channel.send(new Discord.MessageEmbed()
                .setColor('RED')
                .setDescription(`** *:no_entry_sign: You cant kick yourself!* **`)
                .setTimestamp()
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL({ dynamic: true }))
            );
        }
        const member = message.guild.member(target.id);
        if (member) {
            if (message.author.id !== message.guild.ownerID && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
                return message.channel.send(new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTimestamp()
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL({ dynamic: true }))
                    .setDescription('** *:no_entry_sign: This user is admin/mod I cant to that!* **')
                );
            }
            if (!member.kickable) {
                return message.channel.send(new Discord.MessageEmbed()
                    .setColor('RED')
                    .setDescription('** *:no_entry_sign: Error: I can\'t kick that member.* **')
                    .setTimestamp()
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL({ dynamic: true }))
                );
            }
        } else {
            return message.channel.send(new Discord.MessageEmbed()
                .setColor('RED')
                .setDescription(`** *:no_entry_sign: This user dosent exist!* **`)
                .setTimestamp()
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL({ dynamic: true }))
            );
        }
        const _reason = reason ? reason.join(' ') : 'No reason provided.';
        const dm = await target.createDM();
        await dm.send(new Discord.MessageEmbed()
            .setTimestamp()
            .setTitle(`You have been kicked from ${message.guild.name}`)
            .setDescription(`Reason : ${_reason}`)
            .setFooter(`Moderator : ${message.author.tag} / ${message.author.id}`, message.author.displayAvatarURL({ dynamic: true }) || message.guild.iconURL())
        ).catch(() => { });
        try {
            await member.kick(_reason).catch((e) => { throw e });
        } catch (e) {
            return message.channel.send(new Discord.MessageEmbed()
                .setColor('RED')
                .setDescription(`:no_entry_sign: Unexpected error occured. Member was not kicked`)
                .setTimestamp()
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL({ dynamic: true }))
            );
        }
        message.channel.send(`** *:white_check_mark: ${target.tag} was kicked* ** | *${_reason}*`);
        const modchannel = await client.channels.fetch(message.guild.db.moderation('modLogChannel')).catch(() => { });
        if (modchannel && modchannel.type === 'text') {
            modchannel.send(new Discord.MessageEmbed()
                .setColor('RANDOM')
                .setAuthor(`${message.author.tag} / ${message.author.id}`, message.author.displayAvatarURL({ dynamic: true }) || message.guild.iconURL())
                .setTimestamp()
                .setThumbnail(target.displayAvatarURL({ dynamic: true }) || null)
                .setDescription(`**Member** : ${target.tag} / ${target.id}\n**Action** : Kick\n**Reason** : ${_reason}`)
            );
        }
    }
}