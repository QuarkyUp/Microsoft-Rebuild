const dotenv = require('dotenv').config({path: `../.env`});
const builder = require('botbuilder');

module.exports = [
    (session, args, next) => {
        let typeReservation_arr = builder.EntityRecognizer.findAllEntities(args.intent.entities, 'TypeDeReservation');
        let date_arr = builder.EntityRecognizer.findAllEntities(args.intent.entities, 'builtin.datetimeV2.date');
        let prix_arr = builder.EntityRecognizer.findAllEntities(args.intent.entities, 'builtin.currency');
        let ville_arr = builder.EntityRecognizer.findAllEntities(args.intent.entities, 'Ville');

        let res = `Confirmation d'une réservation `;
        if (typeReservation_arr.length) res += (typeReservation_arr[0].resolution.values[0] == 'vol' ? `d'avion  ` : `d'un hôtel `);
        if (ville_arr.length == 2) {
            let startDestination = ville_arr.reduce((l, e) => {return e.endIndex < l.endIndex ? e : l;});
            let endDestination = ville_arr.reduce((l, e) => {return e.endIndex > l.endIndex ? e : l;});

            session.dialogData.destination = [startDestination, endDestination];
            res+=`pour aller de ${startDestination.entity} à ${endDestination.entity} `
        } else if (ville_arr.length == 1) {
            session.dialogData.destination = [ville_arr[0].entity];            
            res += `à ${ville_arr[0].entity} `;
        }
        if (date_arr.length){
            if (!/^\d+$/.test(date_arr[0].entity)) {
                res += `le ${date_arr[0].resolution.values[0].value} `;
            }
        }
        if (prix_arr.length) res += `pour ${prix_arr[0].resolution.value} ${prix_arr[0].resolution.unit}`;
        
        builder.Prompts.choice(session, res, [`Oui`, `Non`], { listStyle: 3 });
    },
    (session, args, next) => {
        if (args.response.entity === `Oui`) {
            if (session.dialogData.destination.length) session.send(`Bon voyage à ${session.dialogData.destination[0]} !`)
            else session.send(`Bon Voyage !`);
        } else {
            session.send(`Pas de soucis, à la prochaine !`);
        }
    }
]