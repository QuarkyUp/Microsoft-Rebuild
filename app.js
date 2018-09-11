const dotenv = require('dotenv').config();
const builder = require('botbuilder');
const restify = require ('restify');

const callback_reservation = require('./callback_intent/callback_reservation');

// Serveur restify
const server = restify.createServer();
server.listen(process.env.PORT || 5050, () => {
    console.log(`Server listening on port ${process.env.PORT}.`)
});

// Connecteur permettant de communiquer avec Bot Framework
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PWD
});

// Endpoint permettant de recevoir les messages de l'utilisateur
server.post(`/api/messages`, connector.listen());

const bot = new builder.UniversalBot(connector, session => {
    let welcome = new builder.HeroCard(session)
        .title(`Bienvenue, je suis Rebuild Bot !`)
        .images([new builder.CardImage(session)
            .url(process.env.WELCOME_CARD_URL)
            .alt(`welcome_card`)
        ])
        .text(process.env.MESSAGE_WELCOME);

    session.send(new builder.Message(session).addAttachment(welcome));
});

// Recognizer qui recupère les intentions depuis LUIS
const recognizer_luis = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer_luis);

// Callback appelée lorsqu'un utilisateur se connecte au chatbot
bot.on(`conversationUpdate`, property => {
    if (property.membersAdded) {
        property.membersAdded.forEach(member => {
            if (member.id === property.address.bot.id) {
                bot.beginDialog(property.address, '/');
            }
        });
    }
});

// Callbacks appelées pour chaque intentions que LUIS reconnaît
bot.dialog('/reservation', callback_reservation)
    .triggerAction({matches: 'Reservation'});

