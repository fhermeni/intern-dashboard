/*
* Author: Fabien Hermenier
*/

function login() {

    $.post("/login", {login: $("#login").val(), password : $("#password").val()}
    , function(data, status) {
            sessionStorage.setItem("userId", data.id)
            sessionStorage.setItem("email", data.email)
            sessionStorage.setItem("major", data.major)
            window.location.href = "/"
        }
    ).fail(function (data) {
            $("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")}
    )
}

function logout() {
    $.post("/logout", function (data, status) {
        sessionStorage.clear();
        window.location.href = "/"
    }).fail(function(data) {
            console.log("Unable to log out: " + data.responseText)
        })
}