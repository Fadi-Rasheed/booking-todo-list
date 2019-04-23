const addTodo = document.querySelector('.add-todo');
const todoList = document.querySelector('.todo-items');
const addCategory = document.querySelector('.add-category');
const categoriesList = document.querySelector('.div__categories');
const categoryNameList = document.querySelector('.category-name-list');
const todoActionsEvents = document.querySelector('.todo-actions');
const todoActions = todoActionsEvents.cloneNode(true);
const categoryActionsEvents =document.querySelector('.category-actions'); 
const categoryActions = categoryActionsEvents.cloneNode(true);
const countTodo = document.querySelector('.count-todo');
const deleteBox = document.querySelector('.delete-box');
const deleteCatElem = document.querySelector('.delete-cat-elem')
const deleteJustCat = document.querySelector('.delete-just-cat')

const todos = JSON.parse(localStorage.getItem("todos")) || [];
const categories = JSON.parse(localStorage.getItem("categories")) || [];
let id = 0;

let elemParentNode;
let lastChecked;
let categoryOpen;
let parentCategory;

function todoTmpl(item,alt) { 
    return `<li class="todo-item" data-index="${item.id}">
            <input id="${item.id}" class="list__checkbox" type="checkbox" ${item.done ? "checked" : ""}/>
            <label for="${item.id}">${item.name}</label>
            <button type="button" class=${alt || "button-todo"}>...</button>
            </li>`
}
                
function categoryTmpl(item){
    return `<div class="category" data-index="${item.id}" id="${item.id}">
            <h3 class="category-name">${item.categoryName}</h3>
            <span class="count">Count: <span class="count-items">${item.list.length}</span></span>
            <button type="button" class="button-category">...</button>
            <ul class="category-list">
            ${item.list.map((item)=>{
                return todoTmpl(item,"cat-todo");
            }).join("")}</ul>
            </div>`
}

makingList(todos,todoList,todoTmpl);
makingList(categories,categoriesList,categoryTmpl);

addTodo.addEventListener('submit',addItem);
addCategory.addEventListener('submit',addTodosCategory);
todoList.addEventListener('click', findClick);
categoriesList.addEventListener('click', findClick);
document.addEventListener('click', clearDropdown);
deleteCatElem.addEventListener('click',deleteCat);
deleteJustCat.addEventListener('click',deleteOnlyCat)

function clearDropdown(e){
    if (!e.target.parentElement.classList.contains('show')) {
        todoActions.classList.remove('show');
        categoryActions.classList.remove('show');
        categoryNameList.classList.remove('show');
        if (typeof categoryOpen !== "undefined") categoryOpen.classList.remove('show');
    }
}

function addItem(e){
    e.preventDefault();
    const name = (this.querySelector('[name=item]')).value;
    const todo = {
        name,
        done:false,
        id
    }
    todos.push(todo);
    localStorage.setItem("todos",JSON.stringify(todos))
    this.reset();
    makingList(todos,todoList,todoTmpl)
    countTodos(todos.length);
    id++;
}

function addTodosCategory(e){
    e.preventDefault();
    const categoryName = (this.querySelector('[name=item]')).value;
    const category = {
        categoryName,
        list: [],
        id
    }
    categories.push(category);
    localStorage.setItem("categories",JSON.stringify(categories));
    this.reset();
    makingList(categories,categoriesList,categoryTmpl);    
}

function makingList(items= [],list,cb){
    list.innerHTML = items.map((item)=>{
        return cb(item);
    }).join("");
    countTodos(todos.length);
}

function findClick(e) {
    const elem = e.target;
    const datasetTitle = elem.dataset.title;
    if (elem.matches('input')) {
        toggleDone(e);
        checkHandler.call(elem,e);
    } else if (elem.matches('button')){
        e.stopPropagation();
        showActions(e)
    } else if (datasetTitle === "delete-todo"){
        removeTodo()
    } else if (datasetTitle === "move-todo"){
        moveTodo()
    } else if (datasetTitle === "create-cat"){
        createCat()
    } else if (datasetTitle === "edit-todo"){
        editTodo()
    } else if (datasetTitle === "open-cat"){
        openCat()
    } else if (datasetTitle === "rename-cat"){
        renameCat()
    } else if (datasetTitle === "delete-cat"){
        showDeleteBox()
    }
  }

function toggleDone(e) {
    const elem = e.target.parentNode;
    const id = parseInt(elem.dataset.index);
    todos.forEach(elem=>{
        if (elem.id === id) elem.done = !elem.done;
    })
    localStorage.setItem("todos",JSON.stringify(todos))
 }

function checkHandler(e){
    let between = false;
    let listitems = todoList.childNodes;
    if(e.shiftKey){
        listitems.forEach(listitem => {
            let checkbox = listitem.childNodes[1];
            if (checkbox === this || checkbox === lastChecked) {
                between = !between;
            }
            if (between) {
                checkbox.checked = true;
            }
        });
    }
    lastChecked =this;
}

function showActions(e){
    let action
    const elem = e.target;
    elemParentNode = elem.parentNode
    e.target.classList.value === "button-todo" ? action = todoActions : action = categoryActions;
    action.classList.add('show')
    elemParentNode.appendChild(action)
}

function removeAction(action){
    action.classList.remove('show')
}

function countTodos(count){
    countTodo.innerHTML = count;
}

function removeTodo() {
    const id = parseInt(elemParentNode.dataset.index);
    todoList.removeChild(elemParentNode)
    todos.forEach((elem,i)=>{
        if (elem.id === id) todos.splice(i,1);
    })
    localStorage.setItem("todos",JSON.stringify(todos));
    countTodos(todos.length);
}

function moveTodo(){
    const categoriesNames = categories.map(category=> {
        return `<li>${category.categoryName}</li>`
        }).join("");
    categoryNameList.innerHTML = categoriesNames;
    categoryNameList.classList.add("show");
    elemParentNode.appendChild(categoryNameList);
    categoryNameList.addEventListener("click",selecCategory);
}

function selecCategory(e){
    const selectedCategoryName = e.target.innerText;
    let elemName = elemParentNode.querySelector("label").innerText;
    let elemcheckbox = elemParentNode.querySelector(".list__checkbox").checked;
    const id = parseInt(elemParentNode.dataset.index);
    categoriesList.querySelectorAll('h3').forEach((name,i)=>{
        if (name.innerHTML === selectedCategoryName){
            let itemObj = {
                name: elemName,
                done:elemcheckbox,
                id
            }
            let liElem = todoTmpl(itemObj,"cat-todo");
            name.parentNode.querySelector("ul").innerHTML += liElem; 
            categories[i].list.push(itemObj)
            name.parentNode.querySelector(".count-items").innerHTML = categories[i].list.length;
            localStorage.setItem("categories",JSON.stringify(categories));
        }
    })
    removeTodo();
}

function createCat(){
    let categoryName = elemParentNode.querySelector("label").innerText;
    const category = {
        categoryName,
        list: [],
        id
    }
    categories.push(category);
    localStorage.setItem("categories",JSON.stringify(categories));
    makingList(categories,categoriesList,categoryTmpl);
    removeTodo();
}

function editTodo(){
    const id = parseInt(elemParentNode.dataset.index);
    let label = elemParentNode.querySelector("label");
    let newLabel = prompt("Please enter the new name");
    if(newLabel !== null) label.innerHTML = newLabel;
    todos.forEach((elem)=>{
        if (elem.id === id) elem.name = newLabel;
    })
    localStorage.setItem("todos",JSON.stringify(todos));
}

function openCat(){
    categoryOpen = elemParentNode.querySelector(".category-list");
    categoryOpen.classList.add('show');
}

function renameCat(){
    const id = parseInt(elemParentNode.dataset.index);
    let label = elemParentNode.querySelector("h3");
    let newLabel = prompt("Please enter the new name");
    if(newLabel !== null) label.innerHTML = newLabel;
    categories.forEach((elem)=>{
        if (elem.id === id) elem.categoryName = newLabel;
    })
}

function showDeleteBox(){
    parentCategory = elemParentNode;
    deleteBox.classList.add("show-box");
}

function deleteCat(){
    const id = parseInt(parentCategory.dataset.index);
    categoriesList.removeChild(parentCategory)
    categories.forEach((elem,i)=>{
        if (elem.id === id) categories.splice(i,1);
    })
    deleteBox.classList.remove("show-box");
    localStorage.setItem("categories",JSON.stringify(categories));
}

function deleteOnlyCat(){
    const id = parseInt(parentCategory.dataset.index);
    categories.forEach((elem) => { 
        if (elem.id === id) {
            elem.list.map((li ) => { 
            let todo = {
                name:li.name,
                done:li.done,
                id:li.id
            }
            todos.push(todo)
            localStorage.setItem("todos",JSON.stringify(todos))
            makingList(todos,todoList,todoTmpl)
            countTodos(todos.length)
        })}
    })
    deleteCat()
}