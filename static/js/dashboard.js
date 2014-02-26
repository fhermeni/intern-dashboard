var applications = []

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function showNewModal() {
    $("#dateInput").val(new Date().toDateInputValue())
    $("#modal-valid").html("Submit").attr("onclick", "newApplication()")
    $("#modal-newApplication").modal('show')
}

function newApplication() {
    console.log("send new application")
    var application = {
        company : $("#companyInput").val(),
        note : $("#noteInput").val(),
        date : $("#dateInput").val()
    }
    var id = sessionStorage.getItem("userId")
    $.post("/users/" + id + "/", application, function(data) {
        $("#applications").append(templatizer.application_line(data))
        applications.push(data)
    }).fail(function(data) {$("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")});
}

function updateApplication(id) {
    var app = {}
    //Track the changes
    var c = $("#companyInput").val()
    var n = $("#noteInput").val()
    var d = $("#dateInput").val()
    if (applications[id].company != c) {
        app.company = c
    }
    if (applications[id].note != n) {
        app.note = n
    }
    if (applications[id].date != d) {
        app.date = d
    }

    var userId = sessionStorage.getItem("userId")
    $.ajax({
        type:'PUT',
        url:'/users/' + userId + '/' + id,
        data : app
    }).done(function() {
        applications[id].company = c
        applications[id].note = n
        applications[id].date = d
        //Refresh the UI
        $("#app-" + id + " td:nth-child(1)").html(d)
        $("#app-" + id + " td:nth-child(2)").html(c)
    }).fail(function(xhr) {$("#err").html("<div class='alert alert-danger'>" + xhr.responseText + "</div>")});
}

function showEditModal(id) {
    console.log("edit " + id)
    $("#companyInput").val(applications[id].company)
    $("#dateInput").val(applications[id].date)
    $("#noteInput").val(applications[id].note)
    $("#modal-valid").html("Update").attr("onclick", "updateApplication(" + id + ")")
    $("#modal-newApplication").modal('show')
}

function addInterview(id) {
    var userId = sessionStorage.getItem("userId")
    $.ajax({
        type:'PUT',
        url:'/users/' + userId + '/' + id + "/interviews"
    }).done(function(data) {
        $("#interviews-" + id).html(data)
        applications.push(data)
    }).fail(function(xhr) {$("#err").html("<div class='alert alert-danger'>" + xhr.responseText + "</div>")});
}

function setStatus(id, status) {
    var userId = sessionStorage.getItem("userId")
    $.ajax({
        type:'PUT',
        url:'/users/' + userId + '/' + id + "/status",
        data : {status : status}
    }).done(function() {
        $("#app-" + id).removeClass("app-denied app-granted app-open").addClass("app-"+status)
        applications[id].status = status
    })
    .fail(function(xhr) {$("#err").html("<div class='alert alert-danger'>" + xhr.responseText + "</div>")});
}

function getApplications() {
    var id = sessionStorage.getItem("userId")
    $.get("/users/" + id + "/").done(function(apps) {
        applications = apps
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