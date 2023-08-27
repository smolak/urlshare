module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@urlshare/ui"],
  serverRuntimeConfig: {
    feedQueueApiKey: process.env.FEED_QUEUE_API_KEY,
    urlQueueApiKey: process.env.URL_QUEUE_API_KEY,
    userFeedList: {
      itemsPerPage: 30,
    },
    rss: {
      itemsPerUserChannel: 20,
    },
  },
};
