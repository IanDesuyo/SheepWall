export const getDomain = (url: string, maxLevel: number = 3) => {
  const domain = url
    .replace(/(https?:\/\/)?(www.)?/i, "")
    .split(".")
    .slice(-maxLevel)
    .join(".");

  return domain;
};

type commonDomains = {
  [key: string]: string;
};

export const commonAppDomains: commonDomains = {
  // Google
  "google.com": "https://www.google.com/favicon.ico",
  // YouTube
  "youtube.com": "https://www.youtube.com/s/desktop/5708b2cc/img/favicon_32x32.png",
  // Facebook
  "fb.com": "https://www.facebook.com/favicon.ico",
  "facebook.com": "https://www.facebook.com/favicon.ico",
  // Instagram
  "instagram.com": "https://www.instagram.com/favicon.ico",
  // Twitter
  "twitter.com": "https://abs.twimg.com/favicons/twitter.2.ico",
  "twimg.com": "https://abs.twimg.com/favicons/twitter.2.ico",
  // Dcard
  "dcard.tw": "https://www.dcard.tw/_next/static/media/5827ea406f756139e46385da47536cc6-48.png",
  // Line
  "linecorp.com": "https://line.me/favicon-32x32.png",
  "line.naver.jp": "https://line.me/favicon-32x32.png",
  "line-apps.com": "https://line.me/favicon-32x32.png",
  "line.me": "https://line.me/favicon-32x32.png",
  // Discord
  "discord.com": "https://i.imgur.com/mQf1Als.png",
  "discord.gg": "https://i.imgur.com/mQf1Als.png",
  // Bahamut
  "gamer.com.tw": "https://www.gamer.com.tw/favicon.ico",
  // Github
  "github.com": "https://github.githubassets.com/favicon.ico",
  // Notion
  "notion.so": "https://www.notion.so/images/favicon.ico",
  // Steam
  "steampowered.com": "https://store.steampowered.com/favicon.ico",
  "steamcommunity.com": "https://store.steampowered.com/favicon.ico",
  // Ubereats
  "ubereats.com": "https://d3i4yxtzktqr9n.cloudfront.net/web-eats-v2/d526ae562360062f.ico",
  // Foodpanda
  "foodpanda.com.tw": "https://assets.foodora.com/a2fdf70/img/favicon/foodpanda/favicon-32x32.png",
  // Shopee
  "shopee.tw": "https://i.imgur.com/xKEX7rP.png",
  // Genshin Impact
  "yuanshen.com": "https://i.imgur.com/fyoOzhF.png",
  // Uma Musume
  "umamusume.cygames.jp": "https://i.imgur.com/fE7Sqz3.png",
  // Project Sekai
  "sekai.colorfulpalette.org": "https://i.imgur.com/gJKVhm3.png",
  // Blue Archive
  "bluearchiveyostar.com": "https://i.imgur.com/fvZLGEi.png",
  "m-api.nexon.com": "https://i.imgur.com/fvZLGEi.png",
  // Princess Connect
  "api-priconne-redive.cygames.jp": "https://i.imgur.com/wyoKXCn.png",
  "pc.so-net.tw": "https://i.imgur.com/wyoKXCn.png",
};
