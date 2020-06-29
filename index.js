require('dotenv').config();

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}


/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */
if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    console.log("THIS IS AN APPPPPPP")
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}

/*
TOKEN=xoxb-668260705975-1210452763826-170nGxY5cjAdac9Dl8djUICu
var customIntegration = require('./lib/custom_integrations');
var token = 'xoxb-668260705975-1210452763826-170nGxY5cjAdac9Dl8djUICu'//(process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
var controller = customIntegration.configure(token, config, onInstallation);
*/


controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!


controller.hears(['bamboo access', 'hi'], 'direct_message', function (bot, message) {
    /*
     bot.reply(message, {
        attachments:[
            {
                title: 'Do you want to interact with my buttons?',
                callback_id: '1237',
                attachment_type: 'default',
                actions: [
                    {
                        "name":"yes",
                        "text": "Yes",
                        "value": "yes",
                        "type": "button",
                    },
                    {
                        "name":"no",
                        "text": "No",
                        "value": "no",
                        "type": "button",
                    }
                ]
            }
        ]
    });*/

   bot.startConversation(message, function(err, convo) {
convo.addMessage('This is the end!', 'new');

    convo.addQuestion('what to do now?', [
        {
            pattern: 'yes',
            callback: function(response,convo) {
              convo.say('OK you are done!');
              convo.next();
            }
        }, 
        {
            pattern: 'noo',
            callback: function(response,convo) {
                console.log("==>", response)
                convo.addQuestion('why not?', [
                        {
                            pattern:'idk', 
                            callback: function(response,convo) {
                                    convo.say('doofus');
                                    convo.next();
                            } 
                }, 
            {
                                pattern:'bcoz', 
                            callback: function(response,convo) {
                                    convo.say('kaay');
                                    convo.next();
                            } 
            }
                    ])
              convo.next();
            }
        },
        {
            pattern: 'go',
            callback: function(response,convo) {
             convo.transitionTo("new", "going")
              convo.next();
            }
        }

        ])
   
    convo.activate();
});

});

/*
// receive an interactive message, and reply with a message that will replace the original
controller.on('interactive_message_callback', function(bot, message) {
    console.log("===============herererere")
    bot.replyInteractive(message, {
        text: '...Lets gooooo',
        attachments: [
            {
                title: 'My buttons',
                callback_id: '123',
                attachment_type: 'default',
                actions: [
                    {
                        "name":"yes",
                        "text": "Yes!",
                        "value": "yes",
                        "type": "button",
                    },
                    {
                       "text": "No!",
                        "name": "no",
                        "value": "delete",
                        "style": "danger",
                        "type": "button",
                        "confirm": {
                          "title": "Are you sure?",
                          "text": "This will do something!",
                          "ok_text": "Yes",
                          "dismiss_text": "No"
                        }
                    }
                ]
            }
        ]
    });
});
*/


controller.hears(['access', 'blah'], 'direct_message', function (bot, message) {
    bot.reply(message, 'wassss!');
});


/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
controller.on('direct_message', function (bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function (err) {
        if (err) {
            console.log(err)
        }
        bot.reply(message, 'I.....dont understand');
    });
});
