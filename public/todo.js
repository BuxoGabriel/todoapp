const jwt = window.location.href.split("?token=")[1]
const throttleTime = 1000 * 0.75
let checkboxTimeout = null
let addTaskTimeout = null

const taskDom = document.querySelector("#task")

/**
 * 
 * @param {Event} e 
 */
function handleCheckboxClicked(e) {
    clearTimeout(checkboxTimeout)
    checkboxTimeout = setTimeout(() => {
        const id = e.target.id.split(" ")[1]
        const completed = e.target.checked
        console.log(completed)
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
            } else window.location.reload()
        })
    }, throttleTime)
}

/**
 * 
 * @param {Event} e 
 */
function handleSubmit(e) {
    e.preventDefault()
    const headers = new Headers()
    headers.set("Authorization", "Bearer " + jwt)
    headers.set("Content-Type", "application/json")
    let task = taskDom.value
    fetch("/api/todo", {
        method: "POST",
        headers,
        body: JSON.stringify({task})
    }).then(res => {
        if(!res.ok) {
            if(res.status == 401) window.location.reload()
            else res.json().then(err => err.forEach(e => console.error(e)))
        }
        else window.location.reload()
    })
    taskDom.value = ""
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
        else window.location.reload()
    })
}

document.querySelector("form").addEventListener("submit", handleSubmit)
document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener("click", handleCheckboxClicked))
document.querySelectorAll(".delete").forEach(db => db.addEventListener("click", handleDeleteClicked))