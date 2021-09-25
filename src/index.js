import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import TodoListApp from './TodoList';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

ReactDOM.render(
  <TodoListApp />,
  document.getElementById('todoList')
);