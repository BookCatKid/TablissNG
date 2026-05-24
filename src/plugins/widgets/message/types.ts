import { API } from "../../types";

export type MessageData = { messages: string[]; richTextEnabled?: boolean };

export type Props = API<MessageData>;

export const defaultData: MessageData = { messages: [""] };
