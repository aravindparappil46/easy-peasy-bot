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
   bot.startConversation(message, function(err, convo) {
    convo.addMessage('This is the end!', 'new');

    convo.addQuestion('Do you know who your Squad Lead is?? ', [
        {
            pattern: 'yes',
            callback: function(response,convo) {
              convo.say('Ask them to check if you are in the right AD group!');
              convo.next();
            }
        }, 
        {
            pattern: 'no',
            callback: function(response,convo) {
                console.log("==>", response)
                convo.addQuestion('Thats bad. Figure that out first and try again!', [
                        {
                            pattern:'ok', 
                            callback: function(response,convo) {
                                    convo.say('See you soon!');
                                    convo.next();
                            } 
                }, 
            {
                                pattern:'no', 
                            callback: function(response,convo) {
                                    convo.say('That is out of my control! Sorry!');
                                    convo.next();
                            } 
            }
                    ])
              convo.next();
            }
        },
        {
            pattern: 'bye',
            callback: function(response,convo) {
             convo.transitionTo("new", "going")
              convo.next();
            }
        }

        ])
   
    convo.activate();
});

});

let faq = require('./faq.json');

controller.hears(['access', 'help'], 'direct_message', function (bot, message) {
    bot.startConversation(message, function(err, convo) {
        convo.ask({
            attachments:[
                {
                    title: 'Can I help you with any of these?',
                    callback_id: '123',
                    attachment_type: 'default',
                    actions: faq
                }
            ]
        },[
            {
                pattern: "bamboo_access",
                callback: function(reply, convo) {
                    convo.say('If you are in the right AD group, you already have Bamboo access!');
                    convo.next();
                }
            },
            {
                pattern: "nr_access",
                callback: function(reply, convo) {
                    convo.say('Raise a ticket lolz');
                    convo.next();
                }
            },
            {
                pattern: "zeus_access",
                callback: function(reply, convo) {
                    convo.say('Ask a Zeus admin to create an account for you!');
                    convo.next();
                }
            },
            {
                pattern: "build_fail",
                callback: function(reply, convo) {
                    convo.say('Have you tried running it again? If it still breaks, raise a ticket and post in our slack channel!');
                    convo.next();
                }
            },
            {
                pattern: "no",
                callback: function(reply, convo) {
                   
                }
            },
            {
                default: true,
                callback: function(reply, convo) {
                    convo.say("I\'m sorry. I didn't understand your request :(")
                }
            }
        ]);
    });
});

controller.on('direct_message', function (bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function (err) {
        if (err) {
            console.log(err)
        }
        bot.reply(message, 'I\'m sorry. I do not understand :(');
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

