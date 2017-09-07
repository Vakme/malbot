var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var msg = require('./msg.json');
var ontime = require('ontime');
var request = require("request");
var cheerio = require("cheerio");
var unsplash = require('unsplash-api');

var helpChannelId = 342377931772919828;
var malbotId = 352478053877678082;
var generalChannelId = 342050278964592640;
var photoArray = [];

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
    unsplashInit();
});


ontime({
    cycle: '7:00:00'
}, function (ot) {
    packtDownload();
    ot.done();
});

function unsplashInit() {
    unsplash.init(auth.unsplashId);
    unsplash.searchPhotos('coffee', null, 1, 30, function (error, photos, link) {
        photoArray = photos;
        logger.info('Unsplash ready');
    });
}

function packtDownload() {
    request({
        uri: "https://www.packtpub.com/packt/offers/free-learning"
    }, function (error, response, body) {
        logger.info("PacktPub daily info");
        var $ = cheerio.load(body);
        var title = $(".dotd-title > h2").text();
        bot.sendMessage({
            to: generalChannelId,
            message: msg.packtMsgBeg + title + msg.packtMsgEnd
        });
    });
}

function greet(id) {
    logger.info("New Member: " + id);
    bot.sendMessage({
        to: generalChannelId,
        message: '<@' + id + '>' + msg.publicMsg
    });
    bot.sendMessage({
        to: id,
        message: msg.privateMsg
    });
}

function pythonZen(channel) {
    request({
        uri: "http://misztal.edu.pl/logs/the-zen-of-python/"
    }, function (error, response, body) {
        var $ = cheerio.load(body);
        var table = [];
         $("blockquote em").each(function(i, elem) {
             table[i] = $(this).text();
         });
        var rand = Math.floor((Math.random() * table.length));
        bot.sendMessage({
            to: channel,
            message: '*' + table[rand] + '* - The Zen of Python'
        });
    });
}

function coffee(channelID) {
    var photo = photoArray[Math.floor(Math.random() * photoArray.length)];
    bot.sendMessage({
        to: channelID,
        embed: {
            title: 'Kawa!',
            description: 'Oto kawa specjalnie dla ciebie!',
            url: photo.links.self,
            image: {
                url: photo.urls.small
            },
            author: {
                name: photo.user.name,
                url: photo.user.portfolio_url
            }
        }
    }, function (error, response) {
        if(error != null)
            logger.error(error);
    });
}
bot.on("guildMemberAdd", function(member) {
    greet(member.id);
});

bot.on('message', function (user, userID, channelID, message, evt) {
    message = message.toLowerCase();
    if(channelID != helpChannelId && userID != malbotId) {
        if (message.indexOf('python') !== -1)
            pythonZen(channelID);
        if (message.indexOf('definitywnie') !== -1)
            bot.sendMessage({
                to: channelID,
                message: 'I ostatecznie!'
            });
        else if (message.indexOf('malbocie') !== -1) {
            if (message.indexOf('czy') !== -1) {
                var answers = ['Oczywiście', 'No co ty!', 'Niewykluczone', 'No', 'Tiaaa...', 'Definitywnie!'];
                var randomnumber = Math.floor(Math.random() * answers.length);
                bot.sendMessage({
                    to: channelID,
                    message: answers[randomnumber]
                });
            }
            else if (message.indexOf(',') !== -1) {
                var args = message.substring(message.indexOf(',') + 1);
                switch (args) {
                    case ' podaj kawę':
                        coffee(channelID);
                        break;

                    case ' koduj':
                        bot.sendMessage({
                            to: channelID,
                            message: 'Tylko w malbolge'
                        });
                        break;
                    default:
                        break;

                    // Just add any case commands if you want to...
                }
            }
        }
    }
});