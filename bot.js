var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on("guildMemberAdd", function(member) {
    logger.info(member.id);
    bot.sendMessage({
        to: 342050278964592640,
        message: 'Witaj, <@' + member.id + '>'
    });

});

bot.on('message', function (user, userID, channelID, message, evt) {
    //Wiadomości ogólne - ich nie dodajemy
    if (message.indexOf('Definitywnie?') !== -1)
        bot.sendMessage({
            to: channelID,
            message: 'I ostatecznie!'
        });
    else if (message.indexOf('Java') !== -1)
        bot.sendMessage({
            to: channelID,
            message: 'Co za chłam! Tylko malbolge!'
        });
    else if (message.indexOf('Malbocie') !== -1) {
        if (message.indexOf('?') !== -1) {
            //Do tablicy dopisz odpowiedzi na pytania
            var answers = ['Oczywiście', 'No co ty!', 'Niewykluczone', 'No', 'Tiaaa...', 'Definitywnie!'];
            var minimum = 0;
            var maximum = answers.length;
            var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
            bot.sendMessage({
                to: channelID,
                message: answers[randomnumber]
            });
        }
        else if (message.indexOf(',') !== -1) {
            var args = message.substring(message.indexOf(',') + 1);
            logger.info(args);
            //args = args.splice(1);

            //case - to teksty po przecinku, umieść je przed default! i Pamiętaj o break!
            switch (args) {
                case ' podaj kawę':
                    bot.sendMessage({
                        to: channelID,
                        message: ':coffee:'
                    });
                    break;

                case ' koduj':
                    bot.sendMessage({
                        to: channelID,
                        message: 'Tylko w malbolge'
                    });
                    break;
                default:
                    bot.sendMessage({
                        to: channelID,
                        message: 'Co chcesz?'
                    });

                // Just add any case commands if you want to..
            }
        }
    }
});