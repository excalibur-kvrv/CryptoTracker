'use strict';

const {
  dialogflow,
  SimpleResponse,
  BasicCard,
} = require('actions-on-google');
const fetch =require('node-fetch');
const functions = require('firebase-functions');
const app = dialogflow({debug: true});

app.intent('Default Welcome Intent', (conv) => {
     conv.ask(new SimpleResponse({
       speech: 'Hi, Welcome to CryptoTracker i can tell you about a CryptoCurrency price, it\'s Market Cap, Available Supply,etc. Which coin would you like to know about?',
       text: 'Hi, Welcome to CryptoTracker i can tell you about a CryptoCurrency price, it\'s Market Cap, Available Supply,etc. What coin would you like to know about?',
     }));
});

app.intent('getCrypto', (conv,{crypto="ethereum",cryptoactions="price"}={}) =>{
     return new Promise(function(resolve,reject){
          fetch('http://api.coinmarketcap.com/v1/ticker/?limit=1899').then(response => {
               return response.json();
          }).then((data,status) => {
               for (let i = 0; i < data.length - 1; i++) {
                 if ((data[i].id == crypto)||(data[i].name==crypto)||(data[i].symbol==crypto)) {
                    if(cryptoactions == "price")
                         conv.data.price="$"+data[i].price_usd;
                    else if((cryptoactions == "marketcap")||(cryptoactions == "market cap"))
                         conv.data.price="$"+data[i].market_cap_usd;
                    else if((cryptoactions == "availablesupply")||(cryptoactions == "available supply"))
                         conv.data.price=data[i].available_supply;
                    else if(cryptoactions == "rank")
                         conv.data.price=data[i].rank;
                    else if((cryptoactions == "total supply")||(cryptoactions == "totalsupply"))
                         conv.data.price=data[i].total_supply;
                    else if((cryptoactions.indexOf("1h")!=-1)||(cryptoactions.indexOf("1hr")!=-1)||(cryptoactions.indexOf("an hour")!=-1))
                         conv.data.price=data[i].percent_change_1h;
                    else if((cryptoactions.indexOf("1 day")!=-1)||(cryptoactions.indexOf("1d")!=-1)||(cryptoactions.indexOf("a day")!=-1)||(cryptoactions.indexOf("24h")!=-1)||(cryptoactions.indexOf("24hr")!=-1))
                         conv.data.price=data[i].percent_change_24h;
                    else if((cryptoactions.indexOf("7d")!=-1)||(cryptoactions.indexOf("7 days")!=-1)||(cryptoactions.indexOf("7 d")!=-1))
                         conv.data.price=data[i].percent_change_7d;
                    else if((cryptoactions == "price in btc")||(cryptoactions == "price in bitcoin")||(cryptoactions == "price btc"))
                         conv.data.price=data[i].price_btc;
                 }
               }
               conv.ask(`The ${cryptoactions} of ${crypto} is ${conv.data.price}. Would you like to know about another one?`);
               resolve();
          }).catch(err => {
               conv.ask(`${cryptoactions} of ${crypto} is not available. Would you like to know about another one?`);
               reject(err);
               console.log('error');
          });
     });
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
