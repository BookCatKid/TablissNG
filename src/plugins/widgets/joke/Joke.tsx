import React, { useState, useEffect } from "react";
import { useCachedEffect, useKeyPress } from "../../../hooks";
import { db } from "../../../db/state";
import { useValue } from "../../../lib/db/react";
import { getJoke } from "./api";
import "./Joke.sass";
import {
  defaultData,
  Props,
  isSingleJoke,
  isTwoPartJoke,
  TwoPartJokeAPIResponse,
  isJokeError,
} from "./types";

const Joke: React.FC<Props> = ({
  cache,
  data = defaultData,
  setCache,
  loader,
}) => {
  // Grab the user's locale
  const locale = useValue(db, "locale");

  // Map to supported language
  const mapLocaleToJokeAPILang = (locale: string): string => {
    const defaultLanguage = "en";
    const supportedLanguages: string[] = ["cs", "de", "en", "es", "fr", "pt"];
    const [lang] = locale.split("-");
    return supportedLanguages.includes(lang) ? lang : defaultLanguage;
  };

  useCachedEffect(
    () => {
      loader.push();

      const apiLocale = mapLocaleToJokeAPILang(locale);

      getJoke(data.categories, apiLocale)
        .then((joke) => {
          const text = isTwoPartJoke(joke)
            ? joke.setup
            : isSingleJoke(joke)
              ? joke.joke
              : "";

          // if joke is too long, retry
          if (text.length > data.maxPreviewLength) {
            console.log("Joke too long, retrying...");
            return getJoke(data.categories, apiLocale);
          }

          return joke;
        })
        .then((finalJoke) => {
          setCache(finalJoke);
        })
        .finally(() => {
          loader.pop();
        });
    },
    cache?.timestamp ? cache.timestamp + data.timeout : 0,
    [data.categories],
  );

  if (!cache) {
    return null;
  }

  if (isJokeError(cache)) {
    return (
      <>
        {cache.causedBy.map((errorMessage, index) => {
          return <p key={index}>{errorMessage}</p>;
        })}
      </>
    );
  }

  return (
    <div className="joke-container">
      {isSingleJoke(cache) && <h5>{cache.joke}</h5>}

      {isTwoPartJoke(cache) && (
        <TwoPartJoke joke={cache} keyBind={data.keyBind} />
      )}
    </div>
  );
};

const TwoPartJoke: React.FC<{
  joke: TwoPartJokeAPIResponse;
  keyBind?: string;
}> = ({ joke, keyBind = "J" }) => {
  const isJokeAQuestion = joke.setup.slice(-1) === "?";
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
  }, [joke]);

  useKeyPress(
    (event: KeyboardEvent) => {
      if (isJokeAQuestion) {
        event.preventDefault();
        setShowAnswer(!showAnswer);
      }
    },
    [keyBind.toUpperCase(), keyBind.toLowerCase()],
  );

  if (!isJokeAQuestion) {
    return (
      <>
        <h5>{joke.setup}</h5>
        <h5>{joke.delivery}</h5>
      </>
    );
  }

  return (
    <>
      <h5
        className="question-joke-setup"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        {joke.setup}
      </h5>
      {showAnswer && (
        <h5 className="question-joke-delivery">{joke.delivery}</h5>
      )}
    </>
  );
};

export default Joke;
