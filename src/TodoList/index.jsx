import React from "react";
import { useState } from "react";
import {
  RecoilRoot,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { 
  todoListState,
  todoListFilterState,
  filteredTodoListState,
  todoListStatsState
} from "./states/todoList";

export default function TodoListApp() {
  return (
    <RecoilRoot>
      <div>Todo List</div>
      <TodoListStats />
      <TodoListFilters />
      <TodoItemCreator />
      <TodoList />
    </RecoilRoot>
  );
}

// この実装だとTodoが編集された時にTodoItemCreatorも再renderingされる．
// function TodoList() {
//   const todoList = useRecoilValue(todoListState);

//   return (
//     <>
//       <div>Todo List</div>
//       {/* <TodoListStats /> */}
//       {/* <TodoListFilters /> */}
//       <TodoItemCreator />

//       {todoList.map((todoItem) => (
//         <TodoItem key={todoItem.id} item={todoItem} />
//       ))}
//     </>
//   );
// }

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