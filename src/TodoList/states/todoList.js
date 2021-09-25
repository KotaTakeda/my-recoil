import { atom } from "recoil";
import { RecoilAtomKeys } from "./RecoilKeys.ts";

export const todoListState = atom({
  key: RecoilAtomKeys.TODO_LIST_STATE,
  default: [],
});