import React from "react";
import { useState, useEffect } from "react";
import {
  RecoilRoot,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useRecoilSnapshot,
  useRecoilTransactionObserver_UNSTABLE,
  useGetRecoilValueInfo_UNSTABLE,
} from 'recoil';
import { 
  todoListState,
  todoListFilterState,
  filteredTodoListState,
  todoListStatsState,
} from "./states/todoList";

export default function TodoListApp() {
  return (
    <RecoilRoot>
      {/* Debug用 */}
      <DebugObserver />
      <ButtonToShowCurrentSubscriptions />
      <SetSameTodoListState />
      <div>Todo List</div>
      <TodoListStats />
      <TodoListFilters />
      <TodoItemCreator />
      <TodoList />
    </RecoilRoot>
  );
}

function TodoList() {
  const todoList = useRecoilValue(filteredTodoListState);

  return (
    <>
      {todoList.map((todoItem) => (
        <TodoItem key={todoItem.id} item={todoItem} />
      ))}
    </>
  );
}

// =================================================================
// この実装だとTodoが編集された時にTodoListFiltersも再renderingされる．
// export default function TodoListApp() {
//   return (
//     <RecoilRoot>
//       <TodoList />
//     </RecoilRoot>
//   );
// }

// function TodoList() {
//   const todoList = useRecoilValue(todoListState);

//   return (
//     <>
//       <div>Todo List</div>
//       <TodoListStats />
//       <TodoListFilters />
//       <TodoItemCreator />

//       {todoList.map((todoItem) => (
//         <TodoItem key={todoItem.id} item={todoItem} />
//       ))}
//     </>
//   );
// }
// =================================================================

// NOTE: TodoItemのtextを編集しただけでも再レンダーされる．
function TodoListStats() {
  const {
    totalNum,
    totalCompletedNum,
    totalUncompletedNum,
    percentCompleted,
  } = useRecoilValue(todoListStatsState);

  const formattedPercentCompleted = Math.round(percentCompleted);

  return (
    <ul>
      <li>Total items: {totalNum}</li>
      <li>Items completed: {totalCompletedNum}</li>
      <li>Items not completed: {totalUncompletedNum}</li>
      <li>Percent completed: {formattedPercentCompleted}</li>
    </ul>
  );
}

function TodoListFilters() {
  const [filter, setFilter] = useRecoilState(todoListFilterState);

  const updateFilter = ({target: {value}}) => {
    setFilter(value);
  };

  return (
    <>
      Filter:
      <select value={filter} onChange={updateFilter}>
        <option value="Show All">All</option>
        <option value="Show Completed">Completed</option>
        <option value="Show Uncompleted">Uncompleted</option>
      </select>
    </>
  );
}

function TodoItemCreator() {
  const [inputValue, setInputValue] = useState(''); // なぜatomを使わないのか？ local stateだからか？
  const setTodoList = useSetRecoilState(todoListState);

  const addItem = () => {
    setTodoList((oldTodoList) => [
      ...oldTodoList,
      {
        id: getId(),
        text: inputValue,
        isComplete: false,
      },
    ]);
    setInputValue('');
  }

  const onChange = ({target: {value}}) => {
    setInputValue(value);
  };

  return (
    <div>
      <input type="text" value={inputValue} onChange={onChange} />
      <button onClick={addItem}>Add</button>
    </div>
  )
};

// Dev Tool ===================================================
function DebugObserver() {
  const snapshot = useRecoilSnapshot();

  // useEffectで監視 --------------------------------------------
  // 全atomの変更を観測
  // useEffect(() => {
  //   console.debug('The following atoms were modified:');
  //   for (const node of snapshot.getNodes_UNSTABLE({isModified: true})) {
  //     console.debug(node.key, snapshot.getLoadable(node));
  //   }
  // }, [snapshot]);

  // todoListStatsStateの変更を観測
  // useEffectの第２引数は差分検知をObject.isで行っている．
  // const stats = snapshot.getLoadable(todoListStatsState);
  // useEffect(() => {
  //   console.debug('todoListStatsState is modified:', stats);
  // }, [stats]);
  // ------------------------------------------------------------

  //
  useRecoilTransactionObserver_UNSTABLE(({ snapshot, previousSnapshot }) => {
    console.debug('The following atoms were modified:');
    for (const node of snapshot.getNodes_UNSTABLE()) {
      // console.debug(node.key, snapshot.getLoadable(node)); // 値
      console.debug(node.key, snapshot.getInfo_UNSTABLE(node)); // debug用の情報
    }

    // todoListStatsStateの変更前後を確認できる． 
    const previousStats = previousSnapshot.getLoadable(todoListStatsState);
    const currentStats = snapshot.getLoadable(todoListStatsState);
    if (previousStats.is(currentStats)) { // Object.isで等価性を確認．
      console.log("Stats is not modified");
    } else {
      console.log("Stats is modified");
    }
  });
  
  return null;
}

function ButtonToShowCurrentSubscriptions() {
  const getRecoilValueInfo = useGetRecoilValueInfo_UNSTABLE();
  function onClick() {
    const {subscribers} = getRecoilValueInfo(todoListState);
    console.debug(
      'Current Subscriber Nodes:',
      Array.from(subscribers.nodes).map(({key})=>key),
    );
    console.debug(
      'Current Subscriber Components:',
      Array.from(subscribers.components).map(({key})=>key),
    );
  }

  return <button onClick={onClick} >See Current Subscribers of todoListState</button>;
}

function SetSameTodoListState() {
  const [list, setList] = useRecoilState(todoListState);
  function onClick() {
    // setList(list); // 初回以外 isModifiedと判定されない．
    setList([...list]); // いつもisModifiedと判定される．
  }
  return <button onClick={onClick}>Set same todoListState</button>
}
// =============================================================

// global 良くない
let id = 0;
function getId() {
  return id++;
}

function TodoItem({item}) {
  const [todoList, setTodoList] = useRecoilState(todoListState);
  const index = todoList.findIndex((listItem) => listItem === item);

  const editItemText = ({target: {value}}) => {
    const newList = replaceItemAtIndex(todoList, index, {
      ...item,
      text: value,
    });

    setTodoList(newList);
  };

  const toggleItemCompletion = () => {
    const newList = replaceItemAtIndex(todoList, index, {
      ...item,
      isComplete: !item.isComplete,
    });

    setTodoList(newList);
  };

  const deleteItem = () => {
    const newList = removeItemAtIndex(todoList, index);

    setTodoList(newList);
  };

  return (
    <div>
      <input type="text" value={item.text} onChange={editItemText} />
      <input
        type="checkbox"
        checked={item.isComplete}
        onChange={toggleItemCompletion}
      />
      <button onClick={deleteItem}>X</button>
    </div>
  );
}

// util func
function replaceItemAtIndex(arr, index, newValue) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}

function removeItemAtIndex(arr, index) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}