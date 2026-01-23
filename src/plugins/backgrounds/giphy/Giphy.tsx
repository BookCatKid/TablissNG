import React from "react";
import { useObjectUrl } from "../../../hooks";
import Backdrop from "../../../views/shared/Backdrop";
import { getGif } from "./api";
import Credit from "./Credit";
import "./Giphy.sass";
import { defaultData, Props } from "./types";

const Giphy: React.FC<Props> = ({
  cache,
  data = defaultData,
  setCache,
  loader,
}) => {
  const [gif, setGif] = React.useState(cache);
  React.useEffect(() => {
    const config = { tag: data.tag, nsfw: data.nsfw };
    getGif(config, loader).then(setCache);
    setGif(cache);
  }, [data.tag, data.nsfw]);

  const url = useObjectUrl(gif && gif.data);

  if (!gif || !url) return null;

  return (
    <div className="Giphy fullscreen">
      <Backdrop className="gif fullscreen" url={url}></Backdrop>
      <Credit link={gif.link} />
    </div>
  );
};

export default Giphy;
