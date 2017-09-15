var Discord = require('discord.io');
var logger = require('winston');
var ontime = require('ontime');
var request = require("request");
var unsplash = require('unsplash-api');
var natural = require('natural');
var tokenizer = new natural.AggressiveTokenizerPl();
var classifier = new natural.LogisticRegressionClassifier();


var auth = require('./auth.json');
var config = require('./config.json');
var Utils = require('./utils');
var stopwords = require('./stopwords.json');

var photoArray = [];
var utils = new Utils();

function init() {
// Configure logger settings
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {
        colorize: true
    });
    logger.level = 'debug';
    logger.info('Logger ready');
    unsplash.init(auth.unsplashId);
    unsplash.searchPhotos('coffee', null, 1, 30, function (error, photos, link) {
        photoArray = photos;
        logger.info('Unsplash ready');
    });
}



classifier.addDocument([''], 'other');
classifier.addDocument(['dzien dobry', 'dobry wieczor', 'czesc', 'hej', 'witam', 'siemka', 'siemanko'], 'greetings');
classifier.addDocument(['dobranoc', 'papa', 'zegnam', 'zobaczenia', 'widzenia'], 'byebyes');
classifier.train();

classifier.addDocument('dzien dobry', 'greetings');
classifier.train();
classifier.addDocument('dobry wieczor', 'greetings');
classifier.train();

classifier.events.on('trainedWithDocument', function (obj) {
    logger.info('Finished learning' + obj);
    /*classifier.save('classifier.json', function(err, classifier) {
        logger.info('Finished saving');
    });*/
});

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', function (evt) {
    init();
    utils.initBot(bot);
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

ontime({
    cycle: '7:00:00'
}, function (ot) {
    utils.packtDownload(logger);
    ot.done();
});

ontime({
    cycle: '8:00:00'
}, function (ot) {
    utils.holiday(config.channels.generalChannelId);
    ot.done();
});
bot.on("guildMemberAdd", function(member) {
    utils.greet(member.id, logger);
});

bot.on('message', function (user, userID, channelID, message, evt) {
    var tokenized = tokenizer.tokenize(message.toLowerCase().escapeDiacritics());
    tokenized = tokenized.filter(function (el) {
        return stopwords.indexOf(el) === -1;
    });
    //logger.info(tokenized);
    message = message.toLowerCase().escapeDiacritics();
    if(channelID != config.channels.helpChannelId && userID != config.malbotId) {
        console.log(classifier.getClassifications(message));
        if(classifier.getClassifications(message)[0].label === 'greetings')  {
            classifier.addDocument(message, 'greetings');
            classifier.train();
            bot.sendMessage({
                to: channelID,
                message: 'Witaj, <@' + userID + '>!'
            });
        }
        else if(classifier.getClassifications(message)[0].label === 'byebyes') {
            classifier.addDocument(message, 'byebyes');
            classifier.train();
            bot.sendMessage({
                to: channelID,
                message: 'Żegnaj, <@' + userID + '>!'
            });
        }
        else {
            classifier.addDocument(message, 'other');
            classifier.train();

        }
        if (message.indexOf('python') !== -1)
            utils.pythonZen(channelID);
        if (message.indexOf('!test') !== -1)
            utils.coffee(channelID, photoArray);

        if (message.indexOf('definitywnie') !== -1)
            bot.sendMessage({
                to: channelID,
                message: 'I ostatecznie!'
            });
        else if (message.indexOf('malbocie') !== -1) {
            if (message.indexOf('czy') !== -1) {
                var answers = ['Oczywiście', 'No co ty!', 'Niewykluczone', 'No', 'Tiaaa...', 'Definitywnie!'];
                var randomNumber = utils.randomArrayIndex(answers.length);
                bot.sendMessage({
                    to: channelID,
                    message: answers[randomNumber]
                });
            }
            else if (message.indexOf(',') !== -1) {
                var args = message.substring(message.indexOf(',') + 1);
                switch (args) {
                    case ' podaj kawe':
                        utils.coffee(channelID, photoArray);
                        break;

                    case ' koduj':
                        bot.sendMessage({
                            to: channelID,
                            message: 'Tylko w malbolge'
                        });
                        break;
                    default:
                        break;

                    // TODO: Just add any case commands if you want to...
                }
            }
        }
    }
});

String.prototype.escapeDiacritics = function()
{
    return this.replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z');
};