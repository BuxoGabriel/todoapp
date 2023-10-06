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
    const checked = e.target.checked
    clearTimeout(checkboxTimeout)
    checkboxTimeout = setTimeout(() => {
        const headers = new Headers()
        headers.set("Authorization", "Bearer " + jwt)
        fetch("/api/check", {
            method: "POST",
            headers,
            body: {checked}
        }).then(res => {
            if(!res.ok) window.location.reload()
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

document.querySelector("form").addEventListener("submit", handleSubmit)
document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener("click", handleCheckboxClicked))