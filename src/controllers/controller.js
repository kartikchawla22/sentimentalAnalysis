const curl = new(require('curl-request'))();
var oauthSignature = require("oauth-signature");
var request = require('request');
var Promise = require("bluebird");

exports.createGraph = (req, res) => {
    var lat, lng, query;
    query = req.query.query;
    lat = req.query.lat;
    lng = req.query.lng;
    console.log(query, lat, lng);
    
    // if (req.body.city == 'ncr') {
    //     lat = '-37.8143';
    //     lng = '144.963';
    // } else {
    //     lat = '-37.8143';
    //     lng = '144.963';
    // }
    var url = 'https://api.twitter.com/1.1/search/tweets.json?q='+query+'&geocode=' + lat + ',' + lng + ',10km&count=30';
   
    var totalTweetsText = [];
    var options = {
        url: url,
        headers: {
            'Authorization': getSignature(url, query, lat, lng)
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            JSON.parse(response.body)['statuses'].forEach((data) => {
                totalTweetsText.push({
                    tweet: data.text
                });
            })
            let tweetsObj = {};
            return Promise.map(totalTweetsText, async (item) => {
                const language = require('@google-cloud/language');

                // Instantiates a client
                const client = new language.LanguageServiceClient();

                // The text to analyze
                const text = item.tweet;

                const document = {
                    content: text,
                    type: 'PLAIN_TEXT',
                };
                try {
                    const [result] = await client.analyzeSentiment({
                        document: document
                    });
                    const sentiment = result.documentSentiment;
                    tweetsObj = {
                        tweet: item.tweet,
                        sentimentScore: sentiment.score
                    }
                    return tweetsObj;
                } catch (e) {
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>Error: ", e);
                    console.log(tweetsObj);
                    
                    return tweetsObj;
                }
            }).then((result) => {
                let positive = 0;
                let negative = 0;
                result.map((data) => {
                    if(data){
                        if (data.sentimentScore >= 0) {
                            positive++;
                        } else {
                            negative++;
                        }
                    }
                })
                let arr = [];
                positive = positive > 0 ? positive : 0.001;
                negative = negative > 0 ? negative : 0.001;
                arr.push(positive);
                arr.push(negative);

                res.json({
                    data:{
                        arr,
                        tweets: result
                    }
                    
                })
            })
        }
    }

    request(options, callback);

}
getNonce = () => {
    const length = 8
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}



getSignature = (requestUrl, query, lat, lng) => {
    let url = requestUrl;
    let parameters = {
            oauth_consumer_key: 'WAONpFTgKyy1qxyzrOiAOWyV4',
            oauth_token: '846443217021276160-jKhJ7AbmYfYPd1SnuzzTEHZjd9O2jlW',
            oauth_nonce: getNonce(),
            oauth_timestamp: parseInt(Date.now() / 1000),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version: '1.0',
            q: query,
            geocode: lat + ',' + lng + ',10km',
            count: '30'
        },
        consumerSecret = 'puDbIshWHkYLLqAcxTxcoCdmLphUyUYmTlJ5L0COAtEe1CNCFA',
        tokenSecret = 'co4bCGZr4rUM90TQX0M53ZOYyOY1Wx7yL5ozG2j1I8eUI';
    let signature = oauthSignature.generate('GET', url, parameters, consumerSecret, tokenSecret, {
        encodeSignature: false
    })
    console.log('signature', encodeURIComponent(signature));
    const authString = 'OAuth oauth_consumer_key=' + parameters.oauth_consumer_key +
        ', oauth_token=' + parameters.oauth_token +
        ', oauth_signature_method=HMAC-SHA1, oauth_timestamp=' + parameters.oauth_timestamp +
        ', oauth_nonce=' + parameters.oauth_nonce +
        ', oauth_version=1.0, oauth_signature=' + encodeURIComponent(signature);
    return authString;
    // return encodeURIComponent(signature);
}

exports.testGoogleApi = async (req, res) => {
    const language = require('@google-cloud/language');

    // Instantiates a client
    const client = new language.LanguageServiceClient();

    // The text to analyze
    const text = '"Pairing \"useState\" and \"useContext\" together is pretty ✨\n\nLoving these @reactjs hooks! https://t.co/pM9zyJhXAv"';

    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    };
    try {
        const [result] = await client.analyzeSentiment({
            document: document
        });
        const sentiment = result.documentSentiment;
    } catch (e) {
        console.log("*******************************Error: ", e);

    }
    // Detects the sentiment of the text

}
