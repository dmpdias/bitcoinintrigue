import { BriefingData } from './types';

export const BRIEFING_CONTENT: BriefingData = {
  date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  issueNumber: 421,
  intro: {
    headline: "Bitcoin just pulled off a comeback",
    content: "Bouncing back above $70,000 after a rough week. Today we're unpacking why markets swing like a pendulum, what big players are doing quietly, and how you can understand the game."
  },
  stories: [
    {
      id: 'price-story',
      category: 'THE PRICE STORY',
      headline: 'Why is Bitcoin at $70K?',
      image: 'https://picsum.photos/800/400?grayscale',
      intrigueTake: "Volatility is the price of admission for Bitcoin's performance. While a $8.7B drop sounds scary, zooms out: the long-term trend is being driven by institutional adoption, not day-trader panic. When inflation cools, scarce assets win.",
      content: [
        "Imagine Bitcoin prices like a seesaw. Last week, investors got nervous about rising costs (inflation), so they panic-sold and Bitcoin dropped $8.7 billion in value in one day. That sharp swing? That's what happens when big money moves fast.",
        "But here's the twist: this week, news came that inflation is cooling down. Less inflation means your dollar stays worth more, which makes Bitcoin look attractive again.",
        "Smart investors stepped back in. Bitcoin bounced. Welcome to the dance."
      ]
    },
    {
      id: 'world-news',
      category: 'WHAT\'S HAPPENING AROUND THE WORLD',
      headline: 'America\'s States Want Bitcoin Too',
      intrigueTake: "This is a massive signal shift. Just five years ago, states were banning crypto mining. Now, they are treating it like a strategic reserve asset. Watch for other states to copy Texas's homework in 2025.",
      content: [
        "Texas and other US states are now buying Bitcoin like it's digital gold. They're adding it to their official government treasuries—the same places they keep their emergency cash reserves.",
        "Why? Because Bitcoin is scarce (only 21 million will ever exist) and can't be printed like dollars. Governments are finally asking: \"Can we have some of that?\" The answer is yes."
      ]
    },
    {
      id: 'regulations',
      category: 'INSTITUTIONAL MOVES',
      headline: 'Regulation is Making Big Banks Comfortable',
      intrigueTake: "Regulation often feels annoying, but for Wall Street, it's a green light. Banks don't mind rules; they mind uncertainty. With clear rules appearing, the floodgates for trillions of dollars in capital are slowly opening.",
      content: [
        "Goldman Sachs (one of the world's biggest banks) just said something huge: new regulations are making major financial companies feel safe buying Bitcoin for the first time.",
        "Think of regulations as safety guardrails. When the guardrails are in place, the grown-ups join the party. And when Goldman Sachs shows up, smaller banks follow."
      ]
    },
    {
      id: 'whales',
      category: 'MARKET DYNAMICS',
      headline: 'The Whales Are Watching You',
      intrigueTake: "Don't get shaken out by the chop. Whales rely on retail investors panicking to buy cheap coins. If BlackRock is buying, you probably shouldn't be selling.",
      content: [
        "Here's something interesting: right now, the big players (we call them \"whales\"—people holding massive amounts of Bitcoin) are quietly buying while everyday investors are panic-selling.",
        "It's like watching a poker game where the experienced players are putting chips on the table while beginners are folding. Why does this matter? Because whale movements are like a cheat code.",
        "When they buy, markets usually follow. They see opportunity others miss. Right now, positive investment flows (money coming in from ETFs—investment baskets you can buy like stocks) just turned upward. Translation: smart money is positioning itself. You're watching the game. What will you do?"
      ]
    },
    {
      id: 'lesson',
      category: 'THE DAILY LESSON',
      headline: 'Whales and Opportunity',
      highlight: true,
      intrigueTake: "Information asymmetry is real. Whales have better data than you. But you have one advantage: you can move faster. Watch the wallet flows, ignore the headlines.",
      content: [
        "A whale is someone holding an enormous amount of Bitcoin—think of them as the cryptocurrency equivalent of a billionaire with insider knowledge.",
        "The lesson here is simple: pay attention to what whales do, not just what they say. When whales move quietly, beginners should listen. They're not emotional. They're calculating. And right now, they're buying."
      ]
    },
    {
      id: 'lightning',
      category: 'DEEP DIVE',
      headline: 'Bitcoin\'s Secret Shortcut: The Lightning Network',
      intrigueTake: "Lightning solves Bitcoin's biggest criticism: speed. If Bitcoin is digital gold (store of value), Lightning makes it digital cash (medium of exchange). The combination is unbeatable.",
      content: [
        "Imagine Bitcoin as the main highway—it's secure and permanent, but it can get congested. The Lightning Network is like a faster back road. It lets you send Bitcoin almost instantly with fees that cost less than a penny.",
        "How? Think of it like a bar tab. Instead of writing down every single drink on a permanent record book (the blockchain—Bitcoin's permanent record that nobody can erase), you just keep a running tally with the bartender and settle up once at the end. Same money, faster, cheaper.",
        "Apps like Phoenix and Breez make this so simple that you don't need to understand the technical details. Over $490 million in Bitcoin already moves through these shortcuts every day."
      ]
    }
  ]
};