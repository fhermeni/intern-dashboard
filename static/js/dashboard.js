/**
 * Created by fhermeni on 26/02/2014.
 */
function newApplication() {
    console.log("send new application")
    var application = {
        company : $("#companyInput").val(),
        description : $("#descInput").val(),
        date : $("#dateInput").val()
    }
    var id = sessionStorage.getItem("userId")
    $.post("/users/" + id + "/", application, function(data) {
        $("#applications").append(templatizer.application_line(data))
    }).fail(function(data) {$("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")});
}

function addInterview(id) {
    var userId = sessionStorage.getItem("userId")
    $.ajax({
        type:'PUT',
        url:'/users/' + userId + '/' + id + "/interviews"
    }).done(function(data) {$("#interviews-" + id).html(data)})
        .fail(function(xhr) {$("#err").html("<div class='alert alert-danger'>" + xhr.responseText + "</div>")});
}

function setStatus(id, status) {
    var userId = sessionStorage.getItem("userId")
    $.ajax({
        type:'PUT',
        url:'/users/' + userId + '/' + id + "/status",
        data : {status : status}
    }).done(function() {
        $("#app-" + id).removeClass("app-denied app-granted app-open")
        $("#app-" + id).addClass("app-"+status)
    })
    .fail(function(xhr) {$("#err").html("<div class='alert alert-danger'>" + xhr.responseText + "</div>")});
}

function getApplications() {
    var id = sessionStorage.getItem("userId")
    $.get("/users/" + id + "/").done(function(apps) {
        var buf = ""
        apps.forEach(function(app) {
            buf += templatizer.application_line(app)
        })

        $("#applications").append(buf)

    }).fail(function(data) {
        $("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")
    })
}
$( document ).ready(function () {
    var mail = sessionStorage.getItem("email")
    var major = sessionStorage.getItem("major")
    $("#user").html("[" + major + "] " + mail)

    getApplications()
})