var request = require("request");
var cheerio = require("cheerio");

var msg = require('./msg.json');
var config = require('./config.json');

function randomIndex(length){
    return Math.floor((Math.random() * length));
}

function utils() {
    var bot = null;

    this.initBot = function (botCfg) {
        bot = botCfg;
    };

    this.randomArrayIndex = randomIndex;

    this.packtDownload = function(logger) {
        request({
            uri: config.packt.url
        }, function (error, response, body) {
            logger.info("PacktPub daily info");
            var $ = cheerio.load(body);
            var title = $(".dotd-title > h2").text();
            bot.sendMessage({
                to: config.channels.generalChannelId,
                message: msg.packtMsgBeg + title + msg.packtMsgEnd
            });
        });
    }

    this.greet = function(id, logger) {
        logger.info("New Member: " + id);
        bot.sendMessage({
            to: config.channels.generalChannelId,
            message: '<@' + id + '>' + msg.publicMsg
        });
        bot.sendMessage({
            to: id,
            message: msg.privateMsg
        });
    };

    this.pythonZen = function(channel) {
        request({
            uri: config.zen.url
        }, function (error, response, body) {
            var $ = cheerio.load(body);
            var table = [];
            $("blockquote em").each(function(i, elem) {
                table[i] = $(this).text();
            });
            var rand = randomIndex(table.length);
            bot.sendMessage({
                to: channel,
                message: '*' + table[rand] + '* - ' + config.zen.name
            });
        });
    };

    this.holiday = function(channel) {
        request({
            uri: config.holiday.url
        }, function (error, response, body) {
            var holidays = JSON.parse(body).holidays;
            var holidayNames = holidays.map(element => element.text).join('\n');
            bot.sendMessage({
                to: channel,
                embed: {
                    title: config.holiday.info,
                    description: holidayNames,
                    author: {
                        name: config.holiday.author,
                        url: config.holiday.authorUrl
                    }
                }
            });
        });
    };

    this.coffee = function (channelID, photoArray) {
        if(!Array.isArray(photoArray) || !photoArray.length) {
            bot.sendMessage({
                to: channelID,
                message: config.unsplash.errorMsg
            });
        }
        else {
            var photo = photoArray[Math.floor(Math.random() * photoArray.length)];
            bot.sendMessage({
                to: channelID,
                embed: {
                    title: config.unsplash.title,
                    description: config.unsplash.description,
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
                if (error != null)
                    logger.error(error);
            });
        }
    }

}

module.exports = utils;