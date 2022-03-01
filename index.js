const { ETwitterStreamEvent, TwitterApi } = require('twitter-api-v2');
require("dotenv").config();

const phrases = [
  "meteu essa?",
  "dentro",
  "simplesmente o rei do entretenimento",
  "VASCO",
  "que papinho hein",
  "aceitas pix?",
  "ih, mané",
  "se não é isso eu sou um abajur",
  "tá pras pica",
  "é brincadeira doidao",
  "à moda caralha",
];

const randomAnswer = () => phrases[Math.floor(Math.random() * phrases.length)];

async function replyTweet(tweetId) {
  const userClientV1 = new TwitterApi({
    appKey: process.env.CONSUMER_KEY,
    appSecret: process.env.CONSUMER_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
  });
  await userClientV1.v1.reply(randomAnswer(), tweetId);
}

async function openStream() {
  const userClientV2 = new TwitterApi(process.env.BEARER_TOKEN);

  const rules = await userClientV2.v2.streamRules();
  if (rules.data?.length) {
    await userClientV2.v2.updateStreamRules({
      delete: { ids: rules.data.map(rule => rule.id) },
    });
  }

  await userClientV2.v2.updateStreamRules({
    add: [
      { value: '@bot_do_caze' },
    ],
  });

  const stream = await userClientV2.v2.searchStream({
    'tweet.fields': ['referenced_tweets', 'author_id'],
    expansions: ['referenced_tweets.id', 'in_reply_to_user_id'],
  });

  stream.autoReconnect = true;

  stream.on(ETwitterStreamEvent.Data, async tweet => {
    const { data: { text, referenced_tweets, in_reply_to_user_id, id } } = tweet;
    const hasMentionText = text.includes("@bot_do_caze");
    const isARt = tweet.data.referenced_tweets?.some(tweet => tweet.type === 'retweeted') ?? false;
    const isAReplyForMention = (referenced_tweets && in_reply_to_user_id === '1498415154962350085')
    if (isARt || !hasMentionText || isAReplyForMention) {
      return;
    }

    replyTweet(id);
  });
}
openStream();
