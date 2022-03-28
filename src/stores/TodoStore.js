import React from 'react';
import { observable, action, computed, runInAction } from 'mobx';
import axios from 'axios';
axios.defaults.baseURL = 'https://jsonplaceholder.typicode.com';

class TodoStore {
  @observable todoInput = React.createRef();
  @observable filter = 'all';
  @observable beforeEditCache = '';
  @observable idForTodo = 3;
  @observable todos = [];


  @action addTodo = event => {
    if (event.key === 'Enter') {
      const todoInput = this.todoInput.current.value;

      if (todoInput.trim().length === 0) {
        return;
      }

      axios.post('/todos', {
        title: todoInput,
        completed: false,
      })
        .then(response => {
          runInAction(() => {
            this.todos.push({
              id: this.idForTodo,
              title: response.data.title,
              completed: response.data.completed,
              editing: false,
            });
          });
          console.log(response.data)              // To see data coming from api || Post request
        })
        .catch(error => {
          console.log(error);
        });

      this.idForTodo++;
      this.todoInput.current.value = '';
    }
  }



  @action deleteTodo = id => {
    axios.delete('/todos/' + id)
      .then(response => {
        runInAction(() => {
          const index = this.todos.findIndex(item => item.id === id);
          this.todos.splice(index, 1);
        });
        console.log(response.data)        // To see data coming from api || delete request
      })
      .catch(error => {
        console.log(error);
      });

      this.idForTodo--;
  }

  @action checkTodo = (todo, event) => {
    todo.completed = !todo.completed;

    const index = this.todos.findIndex(item => item.id === todo.id);

    this.todos.splice(index, 1, todo);
  }

  @action editTodo = (todo, event) => {
    todo.editing = true;
    this.beforeEditCache = todo.title;

    const index = this.todos.findIndex(item => item.id === todo.id);

    this.todos.splice(index, 1, todo);
  }

  @action doneEdit = (todo, event) => {
    todo.editing = false;

    if (event.target.value.trim().length === 0) {
      todo.title = this.beforeEditCache;
    } else {
      todo.title = event.target.value;
    }


    axios.put('/todos/' + todo.id, {
      title: todo.title,
      completed: todo.completed,
    })
      .then(response => {
        runInAction(() => {
          const index = this.todos.findIndex(item => item.id === todo.id);
          this.todos.splice(index, 1, todo);
        });
        console.log(response.data)              // To see data coming from api || Put request
      })
      .catch(error => {
        console.log(error);
      });

  }

  @action cancelEdit = (todo, event) => {
    todo.title = this.beforeEditCache;
    todo.editing = false;

    const index = this.todos.findIndex(item => item.id === todo.id);

    this.todos.splice(index, 1, todo);
  }

  @action checkAllTodos = (event) => {
    this.todos.forEach((todo) => todo.completed = event.target.checked);
  }

  @action updateFilter = filter => {
    this.filter = filter;
  }


  @action clearCompleted = () => {
    this.todos = this.todos.filter(todo => !todo.completed);
  }

  @computed get todosCompletedCount() {
    return this.todos.filter(todo => todo.completed).length;
  }

  @computed get todosFiltered() {
    if (this.filter === 'all') {
      return this.todos;
    } else if (this.filter === 'active') {
      return this.todos.filter(todo => !todo.completed);
    } else if (this.filter === 'completed') {
      return this.todos.filter(todo => todo.completed);
    }

    return this.todos;
  }

  @computed get remaining() {
    return this.todos.filter(todo => !todo.completed).length;
  }

  @computed get anyRemaining() {
    return this.remaining !== 0;
  }
}

const store = new TodoStore();
export default store;
