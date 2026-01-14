import { API } from "../../types";

export type Data = unknown;

export type Cache = File[];

export type Props = API<Data, Cache>;

export const defaultCache: Cache = [];
