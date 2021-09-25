import { atom, selector } from "recoil";
import { RecoilAtomKeys, RecoilSelectorKeys } from "./RecoilKeys";

export const todoListState = atom({
  key: RecoilAtomKeys.TODO_LIST_STATE,
  default: [],
});

export const todoListFilterState = atom({
  key: RecoilAtomKeys.TODO_LIST_FILTER_STATE,
  default: 'Show All',
});

export const filteredTodoListState = selector({
  key: RecoilSelectorKeys.FILTERED_TODO_LIST_STATE,
  get: ({get}) => {
    const filter = get(todoListFilterState);
    const list = get(todoListState);

    switch (filter) {
      case 'Show Completed':
        return list.filter((item) => item.isComplete);
      case 'Show Uncompleted':
        return list.filter((item) => !item.isComplete);
      default:
        return list;
    }
  },
});

export const todoListStatsState = selector({
  key: RecoilSelectorKeys.TODO_LIST_SRTATS_STATE,
  get: ({get}) => {
    const todoList = get(todoListState);
    const totalNum = todoList.length;
    const totalCompletedNum = todoList.filter((item) => item.isComplete).length;
    const totalUncompletedNum = totalNum - totalCompletedNum;
    const percentCompleted = totalNum === 0 ? 0 : totalCompletedNum / totalNum * 100;

    return {
      totalNum,
      totalCompletedNum,
      totalUncompletedNum,
      percentCompleted,
    };
  },
});