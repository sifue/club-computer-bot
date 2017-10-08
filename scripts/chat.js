'use strict';

const Twitter = require('twitter');
const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});
const cron = require('node-cron');
const atCoderSender = createTweetSender('#club_computer', 'atcoder');
// const sifueTestSender = createTweetSender('#sifue_bot_test', 'sifue_4466'); // sifue検証用

module.exports = (robot) => {
  // cron ジョブ 毎分
  cron.schedule('* * * * *', () => { 
    cronJob(robot);
  });

  // 「ボット名 test」 で動作検証
  robot.respond(/test/i, (msg) => {
    cronJob(robot);
  });
};

function cronJob(robot) {
  atCoderSender(robot);
  // sifueTestSender(robot);
}

function createTweetSender(room, screenName) {
  const tweetIdSet = new Set();
  return function (robot) {
    const params = {screen_name: screenName};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (!error) {
        if(tweetIdSet.size === 0) { // 初回はキャッシュを貯めるだけ
          tweets.forEach((tweet) => {
            tweetIdSet.add(tweet.id_str);
          });
          console.log(`Tweet set was initialized. room: ${room} screenName: ${screenName}`);
        } else {
          tweets.forEach((tweet) => {
            if(!tweetIdSet.has(tweet.id_str)) {
              const message = `https://twitter.com/${screenName}/status/${tweet.id_str}`;
              robot.send({room: room}, message);
              tweetIdSet.add(tweet.id_str);
            }
          });
        }

        if(tweetIdSet.size > 100000) { // メモリ溢れ対策
          tweetIdSet.clear();
        }
      } else {
        console.log(error);
      }
    });
  };
}
