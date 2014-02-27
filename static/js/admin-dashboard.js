var students = []
var applications = []
var majors = {}
var view = {}
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
})

function hide(m, doStats) {
    $("#" + m).attr("onclick","show('" + m + "', true)")
    $("#" + m).removeClass("active")
    delete view[m]
    if (doStats) {
        makeStats()
    }

}

function showAll() {
    majors.forEach(function (m) {
        show(m, false)
    })
    makeStats()
}

function hideAll() {
    majors.forEach(function (m) {
        hide(m, false)
    })
    makeStats()
}
function show(m, doStats) {
        $("#" + m).attr("onclick","hide('" + m + "', true)")
        $("#" + m).addClass("active")
        view[m] = true
        if (doStats) {
            makeStats()
        }
}

function getMajors2() {
    $.get("/majors.json", function(data){
        majors = Object.keys(data)
        $("#majors").html(templatizer.majors_button({"majors" : majors}))
        showAll()
        getUsers()
    }).fail(function(data) {$("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")})
}

function loadApplications() {
    $.get("/applications/", function(apps) {
        console.log(apps.length + " application(s) at total")
        applications = apps
        makeStats()
    }).fail(function(data) {$("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")})
}

function makeStats() {
    var toKeep = applications.filter(function(app) {
        var userId = app.userId
        var m = students[userId].major
        return view.hasOwnProperty(m)
    })
    console.log(toKeep.length + " application(s) to analyse")
    var studentStats = {}
    var nbGranted = 0
    var nbDenied = 0
    var nbPending = 0
    var nbOpen = 0
    toKeep.forEach(function(app) {
        var uId = app.userId
        if (!studentStats.hasOwnProperty(uId)) {
            studentStats[uId] = {granted : false, nbOpen : 0, nbPending : 0, nbDenied : 0}
        }
        if (app.status == "granted") {
            studentStats[uId].granted = true
        } else if (app.status == "open") {
            if (app.nbInterviews > 0) {
                studentStats[uId].nbPending++
            } else {
                studentStats[uId].nbOpen++
            }
        } else if (app.status == "denied") {
            studentStats[uId].nbDenied++
        }
    })

    var ids = Object.keys(studentStats)
    ids.forEach(function(uid) {
        var s = studentStats[uid]
        studentStats[uid].grade = 1
        if (s.granted) {
            studentStats[uid].grade = 4
        } else if (s.nbPending > 0) {
            studentStats[uid].grade = 3
        } else if (s.nbOpen > 0) {
            studentStats[uid].grade = 2
        }
    })
    ids.sort(function (a, b) {
        return studentStats[b].grade - studentStats[a].grade
    })
    var tableBuf = ""
    ids.forEach(function(uid) {
        var s = studentStats[uid]
        var username = students[uid].username
        var style = "rejected"
        if (s.granted) {
            nbGranted++
            style = "granted"
        } else if (s.nbPending > 0) {
            nbPending++
            style = "pending"
        } else if (s.nbOpen > 0) {
            nbOpen++
            style = "open"
        }
        console.log(students[uid])
        tableBuf += templatizer.student_line({stats: {username : username, id : uid, email : students[uid].email, style : style}})
    })

    //Progress bar
    var nbStudents = Object.keys(studentStats).length
    console.log(nbStudents + " has these major(s)")
    var stats = {
        waiting : Math.floor((nbOpen / nbStudents) * 100),
        pending : Math.floor((nbPending / nbStudents) * 100),
        granted : Math.floor((nbGranted / nbStudents) * 100)
    }
    stats.rejected  = 100 - stats.waiting - stats.pending - stats.granted
    $("#student-progress").html(templatizer.student_progress_bar(stats))


    $("#studentTable").html(tableBuf)
}

function getUsers() {
    $.get("/users/", function(data) {
        students = data
        console.log(students.length + " student(s) total")
        loadApplications()
    }).fail(function(data) {$("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")})
}
$( document ).ready(function () {
    getMajors2()
})