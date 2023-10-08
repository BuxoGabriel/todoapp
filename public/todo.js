const jwt = window.location.href.split("?token=")[1]
const debounceTime = 1000 * 0.75

const taskClass = "py-4 border-b last:border-b-0 border-gray-300 flex items-center relative"
const checkboxClass = "mr-2"
const labelClass = "ml-2 capitalize"
const deleteButtonClass = "right-2 w-8 h-8 bg-red-400 text-lg font-semibold rounded-md border border-gray-300 absolute delete"

const taskDom = document.querySelector("#task")
const taskList = document.querySelector("#tasklist")

function dbounce(fn) {
    let checkboxTimeout = null
    return (e) => {
        clearTimeout(checkboxTimeout)
        checkboxTimeout = setTimeout(() => fn(e), debounceTime)
    }
}

function handleCheckboxClicked(e) {
    const id = e.target.id.split(" ")[1]
    const completed = e.target.checked
    const headers = new Headers()
    headers.set("Authorization", "Bearer " + jwt)
    headers.set("Content-Type", "application/json")
    fetch("/api/todo", {
        method: "PUT",
        headers,
        body: JSON.stringify({id, completed})
    }).then(res => {
        if(!res.ok) {
            if(res.status == 401) window.location.reload()
            else res.json().then(err => err.forEach(e => console.error(e)))
        }
    })
}

function handleSubmit(e) {
    e.preventDefault()
    const headers = new Headers()
    headers.set("Authorization", "Bearer " + jwt)
    headers.set("Content-Type", "application/json")
    let task = taskDom.value
    if(task) {
        // init new task
        const newTask = document.createElement("li")
        newTask.className = taskClass
        // add checkbox
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.className = checkboxClass
        checkbox.addEventListener("click", handleCheckboxClicked)
        newTask.appendChild(checkbox)
        // add label
        const label = document.createElement("label")
        label.className = labelClass
        label.innerText = task
        newTask.appendChild(label)
        // add delete button
        const deleteButton = document.createElement("button")
        deleteButton.className = deleteButtonClass
        deleteButton.type = "button"
        deleteButton.innerText = "X"
        deleteButton.addEventListener("click", handleDeleteClicked)
        newTask.appendChild(deleteButton)
        // attach list item to dom
        taskList.appendChild(newTask)

        // update ids to have db todo id
        fetch("/api/todo", {
            method: "POST",
            headers,
            body: JSON.stringify({task})
        }).then(res => {
            if(!res.ok) {
                if(res.status == 401) window.location.reload()
                else res.json().then(err => err.forEach(e => console.error(e)))
            }
            else res.json().then(todo => {
                label.innerText = todo.text
                
                const cbid = "checkbox " + todo.id
                checkbox.id = cbid
                label.htmlFor = cbid
                deleteButton.id = todo.id
            })
        })
        
        // reset input
        taskDom.value = ""
    }
}

/**
 * 
 * @param {Event} e 
 */
function handleDeleteClicked(e) {
    e.preventDefault()
    const headers = new Headers()
    headers.set("Authorization", "Bearer " + jwt)
    fetch("/api/todo/" + e.target.id, {
        method: "DELETE",
        headers,
    }).then(res => {
        if(!res.ok) {
            if(res.status == 401) window.location.reload()
            else res.json().then(err => err.forEach(e => console.error(e)))
        }
    })
    // remove from dom
    let element = e.target.parentElement.parentElement.removeChild(e.target.parentElement)
}

document.querySelector("form").addEventListener("submit", handleSubmit)
document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener("click", dbounce(handleCheckboxClicked)))
document.querySelectorAll(".delete").forEach(db => db.addEventListener("click", handleDeleteClicked))