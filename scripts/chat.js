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
const atCoderCalSender = createTweetSender('#club_computer', 'AtcoderCalendar');
// const sifueTestSender = createTweetSender('#sifue_bot_test', 'sifue_4466'); // sifue検証用

let joinner = {};

module.exports = robot => {
  // cron ジョブ 毎分
  cron.schedule('* * * * *', () => {
    cronJob(robot);
  });

  // 「ボット名 test」 で動作検証
  robot.respond(/.*/i, mentionMonitoring);

  robot.enter(joinningSendMessage);

  robot.hear(/しまりん|志摩りん|りんちゃん/, callingSendMessage);
};

function cronJob(robot) {
  atCoderSender(robot);
  atCoderCalSender(robot);
  // sifueTestSender(robot);
}

function random(size) {
  return Math.floor(Math.random() * size);
}

function mentionMonitoring(robot) {
  const text = robot.message.text;
  const username = robot.message.user.profile.display_name;
  if (text.match(/test/i)) {
    cronJob(robot);
  }
  if (joinner[username]) {
    joinningSendMessage(robot);
  }
}

function joinningSendMessage(msg) {
  let message = '';
  const username = msg.message.user.profile.display_name;
  if (!joinner[username]) joinner[username] = { count: 0 };
  else {
    joinner[username].count++;
    let from = msg.message.text.split(' ');
    delete from[0];
    message += from.join(' ');
  }
  let user = joinner[username];
  joiningMessages[user.count].forEach(word => {
    message += word[random(word.length)] + '\n';
  });
  if (user.count >= 1) delete joinner[username];
  msg.send(message);
}

function callingSendMessage(msg) {
  msg.send(callingMessages[random(callingMessages.length)].join('\n'));
}

function createTweetSender(room, screenName) {
  const tweetIdSet = new Set();
  return function(robot) {
    const params = { screen_name: screenName };
    client.get('statuses/user_timeline', params, function(
      error,
      tweets,
      response
    ) {
      if (!error) {
        if (tweetIdSet.size === 0) {
          // 初回はキャッシュを貯めるだけ
          tweets.forEach(tweet => {
            tweetIdSet.add(tweet.id_str);
          });
          console.log(
            `Tweet set was initialized. room: ${room} screenName: ${screenName}`
          );
        } else {
          tweets.forEach(tweet => {
            if (!tweetIdSet.has(tweet.id_str)) {
              const message = `https://twitter.com/${screenName}/status/${
                tweet.id_str
              }`;
              robot.send({ room: room }, message);
              tweetIdSet.add(tweet.id_str);
            }
          });
        }

        if (tweetIdSet.size > 100000) {
          // メモリ溢れ対策
          tweetIdSet.clear();
        }
      } else {
        console.log(error);
      }
    });
  };
}

const joiningMessages = [
  [
    ['(あいつ、まさか同じ学校だったとは...)', 'あぁ...お、おはようございます'],
    ['ねぇ、あなたどこから来たの？']
  ],
  [
    ['、よくチャリでここまで来たね'],
    ['つまり、今日 #club_computer に来たばかりで'],
    ['競技プログラミングをしにきたけど'],
    ['どう学べばよいのかわからなかったと'],
    ['まぁ、下記のサイト読んで問題を解くのが良いかな'],
    ['https://sites.google.com/a/nnn.ed.jp/club_computer/']
  ]
];

const callingMessages = [
  ['あいつ、アセンブリでよく解けるな'],
  ['貴様ら全員、満足度の最小値の和を最大化してやるぜ'],
  [
    'そういえばソロ以外で競プロしたこと無いな私',
    '誰かと競プロするってこんな感じなのかな'
  ],
  ['変な問題だったな、戻ってSRMでも解こ'],
  ['解けないって、あれが？'],
  ['まぁ、登録だけしといてやるか'],
  [
    '幾何、あいつ楽しそうに解いてたな',
    '一回くらい解いたほうが良いんだろうか',
    '必要になるまでまだいいか'
  ],
  ['完全にグラフの類だ'],
  ['累積和すげえ'],
  ['さすが有名競プロer'],
  ['オーバーフロー、コーナーケースもよし'],
  ['今日はAtCoderじゃない、AOJ解くぞ'],
  ['今度から本気出す'],
  ['くたばれ'],
  ['うわなにをするくぁｗせｄｒｆｔｇｙふじこｌｐ'],
  ['あ..あれ？これ、どうやって解くの？'],
  ['ダマされたっ!!'],
  ['DPか？DPなのか？'],
  ['リバースイテレータでキレイに逆さから辿れます'],
  [
    'そこの処理で状態を記憶してもよかったかも',
    'あ、だめだ、入力が大きいケースでMELで落ちるところしか想像できん'
  ],
  ['CSA、黄色になってた'],
  [
    '一人競プロの時間、脅かされるのがなんかイヤでつい顔に出てしまった',
    'ちょっと悪いことしたな'
  ],
  ['また数列か'],
  ['あぁ、paizaのお姉さん'],
  ['確率はもういいよ'],
  ['真っ赤だ'],
  ['repマクロ、気に入ったのか'],
  ['でも、確かにメモ化がじんわり効いて計算量がポカポカと'],
  ['もしかしてその分岐全部書いたの？'],
  ['いや、そんな解けんし'],
  ['ほんと、簡単に解くなぁ'],
  [
    'あのさ、この間はごめん',
    'コンテスト誘ってくれたのに、なんていうかすごい嫌そうな顔したから'
  ],
  ['それはまぁ、そうなんだけど'],
  ['て、解き終わっちゃってるよ'],
  [
    'このあたりはJOIでよく出るから、拡張ダイクストラとDPが書ければ本戦出れるらしいよ'
  ],
  ['他の競プロerがいなくて静か'],
  ['あいつ、ほとんど自分で解いちゃったけどな'],
  ['会津、寒いんだろうなぁ'],
  ['もうすぐ青コーダーか'],
  ['あのコンテスト、インタラクティブな問題とか出るって書いてあった気も'],
  ['二分探索からのDPか'],
  ['優先度付きキュー、型は long long で'],
  ['あと20分か'],
  ['水色なりたてでE問題はちょっと無謀だったかも'],
  [
    'そういえばなでしこは温泉入ってくるって言ってたな',
    '私も会津についたら絶対に入ってくる'
  ],
  [
    '知る人ぞ知る超高速データ構造、赤黒木',
    '探索や挿入、削除までも最悪 O(log N) でできるらしい'
  ],
  ['よし、全完まであと一問'],
  ['コンチクショー'],
  ['ふんだりけったり、くそぅ'],
  ['それより、今日は苦手な高速フーリエ変換、解くぞー'],
  ['ジャッジ止まってる'],
  ['いや、もうちょっと考えてみよう'],
  ['まずは手堅く簡単なC問題から'],
  ['よし、またWA出しすぎだけど、よし'],
  ['WA出しすぎたけど、よし'],
  [
    'と、思っていたが、問題にグラフもDPも無くて、結局0完ですわ',
    '今度から本気出す'
  ],
  [
    'N=10^5 かぁ...',
    'これ二重ループNGだから O(log N) 以下じゃないとTLEだしなぁ...'
  ],
  [
    '判定は三重ループ使うから O(N ^ 3)...',
    '組み合わせが N ^ 2 だから O(N ^ 5)...',
    '時間足りなかったら考察し直すか...'
  ],
  ['そういえばこれ、IOの高速化に使われてるんだっけ'],
  [
    'うげっ、めちゃめちゃケース落ちてる...',
    '一旦置いとこう、こんな所で時間かけたら目もあてられん'
  ],
  ['10 ^ 8 が1秒くらいだから3秒くらいじゃない？'][
    ('しかし...既視感ある問題だとは思っていたけど',
    'まさか四尾連湖で解いたあの問題だったとは')
  ],
  ['いや、あれはDPじゃない', 'あれは...GREEDYだーっ!!']['年末は競プロかな'],
  [
    'まずは...DFS、うむ、運が良ければとてつもなく...速い',
    '次はBFS、これも速い、安定した速度で、やはり最短経路にはBFSだ',
    'そしていよいよ、ダイクストラ、フィボナッチヒープを添えて',
    '優先度付きキューで貪欲的に状態を決定できる安心感と、フィボナッチヒープでほのかに落とした計算量',
    'そしてBFSと比べ無駄のない動きマッチして...速い。',
    'ありがとう、エドガー・ダイクストラ'
  ]
];
