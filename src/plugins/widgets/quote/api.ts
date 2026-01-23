import { API } from "../../types";
import { bibleVerses } from "./bibleVerses";
import { Quote } from "./types";

// Get developer excuse
async function getDeveloperExcuse(): Promise<{ quote: string }> {
  try {
    const res = await fetch("https://api.tabliss.io/v1/developer-excuses");
    const body = await res.json();

    return {
      quote: body.data,
    };
  } catch (err) {
    return {
      quote: "Unable to get a new developer excuse.",
    };
  }
}

async function getRandomQuotableQuote(): Promise<{
  quote: string;
  author: string | undefined;
}> {
  try {
    let res;
    try {
      res = await fetch("http://api.quotable.io/quotes/random?limit=1");
    } catch (err) {
      try {
        res = await fetch("https://api.quotable.io/quotes/random?limit=1");
      } catch (err2) {
        res = await fetch("https://quotable.vercel.app/quotes/random?limit=1");
      }
    }
    const body = await res.json();
    const quote = body[0];

    return {
      quote: quote.content,
      author: quote.author,
    };
  } catch (err) {
    return {
      quote: "Unable to get quotable quote.",
      author: undefined,
    };
  }
}

async function getRandomDwylQuote(): Promise<{
  quote: string;
  author: string | undefined;
}> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/dwyl/quotes/refs/heads/main/quotes.json",
    );
    const body = await res.json();
    const quote = body[Math.floor(Math.random() * body.length)];

    return {
      quote: quote.text,
      author: quote.author,
    };
  } catch (err) {
    return {
      quote: "Unable to get dwyl quote.",
      author: undefined,
    };
  }
}

async function getRandomBibleVerse(): Promise<{
  quote: string;
  author: string | undefined;
}> {
  try {
    // Try to fetch from remote source first
    const res = await fetch(
      "https://raw.githubusercontent.com/lquartararo/versescraper/refs/heads/main/bibleVerses.ts",
    );
    const text = await res.text();

    // Extract the array from the text content
    const match = text.match(/export const bibleVerses = (\[[\s\S]*\]);/);
    if (!match) {
      throw new Error("Could not parse remote bible verses");
    }

    const remoteVerses = JSON.parse(match[1]);
    const verse = remoteVerses[Math.floor(Math.random() * remoteVerses.length)];

    return {
      quote: verse.quote,
      author: verse.author,
    };
  } catch (err) {
    // Fall back to local verses if fetch fails
    const verse = bibleVerses[Math.floor(Math.random() * bibleVerses.length)];
    return {
      quote: verse.quote,
      author: verse.author,
    };
  }
}

// Get quote of the day
// async function getQuoteOfTheDay(category?: string) {
//   const res = await fetch(
//     "https://quotes.rest/qod.json" + (category ? `?category=${category}` : ""),
//   );
//   const body = await res.json();

//   if (res.status === 429) {
//     return {
//       author: body.error.message.split(".")[1] + ".",
//       quote: "Too many requests this hour.",
//     };
//   }

//   if (
//     body &&
//     body.contents &&
//     body.contents.quotes &&
//     body.contents.quotes[0]
//   ) {
//     return {
//       author: body.contents.quotes[0].author,
//       quote: body.contents.quotes[0].quote,
//     };
//   }

//   return {
//     author: null,
//     quote: null,
//   };
// }

// Get bible verse of the day
// async function getBibleVerse() {
//   const res = await fetch("https://quotes.rest/bible/vod.json");

//   const body = await res.json();

//   if (res.status === 429) {
//     return {
//       author: body.error.message.split(".")[1] + ".",
//       quote: "Too many requests this hour.",
//     };
//   }

//   if (body && body.contents) {
//     return {
//       author:
//         body.contents.book +
//         " " +
//         body.contents.chapter +
//         ":" +
//         body.contents.number,
//       quote: body.contents.verse,
//     };
//   }

//   return {
//     author: null,
//     quote: null,
//   };
// }

export async function getQuote(
  loader: API["loader"],
  category: string,
): Promise<Quote> {
  loader.push();

  const data =
    category === "developerexcuses"
      ? await getDeveloperExcuse()
      : category === "randomBible"
        ? await getRandomBibleVerse()
        : category === "dwyl"
          ? await getRandomDwylQuote()
          : category === "quotable"
            ? await getRandomQuotableQuote()
            : {
                quote:
                  "Selected category is invalid, pease create an issue on the <a href='https://github.com/bookcatkid/TablissNG/issues'>github repo</a>.",
                author: "Simon",
              };
  // : category === "bible"
  //   ? await getBibleVerse()
  //   : await getQuoteOfTheDay(category);

  loader.pop();

  const quote = cleanQuote(data.quote);

  return {
    ...data,
    quote,
    timestamp: Date.now(),
  };
}

function cleanQuote(quote: string) {
  // We remove whitespaces at the beginning and the end of the quote.
  quote = quote.trim();

  // We change all straight quotes (' and ") following a non-whitespace character by
  // a closing curvy quote (’).
  const singleStraightQuote = new RegExp(/(\S)'|"/, "g");
  quote = quote.replace(singleStraightQuote, "$1’");

  // We now change all remaining straight quotes (all following a whitespace
  // character) by an opening curvy quote (‘).
  const openingStraightQuote = new RegExp(/(^|\s)'|"/, "g");
  quote = quote.replace(openingStraightQuote, "$1‘");

  // We replace all series of three dots or more by a proper ellipsis (…).
  const threeDots = new RegExp(/\.{3,}/, "g");
  quote = quote.replace(threeDots, "…");

  // We replace all series of spaces by a single one.
  const spaces = new RegExp(/\s{2,}/, "g");
  quote = quote.replace(spaces, " ");

  // We replace all dashes between whitespace characters by a proper em dash (—).
  const dash = new RegExp(/\s-\s/, "g");
  quote = quote.replace(dash, "—");

  // We add a period at the end of the quote if need be.
  const closingPunctuation = new RegExp(/[.?!…’]$/);
  if (!quote.match(closingPunctuation)) quote = quote + ".";

  return quote;
}
