var students = []
var applications = []
var majors = {}
var view = {}
var selected = []
var autoClose = {}
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
})

/*
 * Manage the view
 */

function hide(m, doStats) {
    $("#" + m).attr("onclick","show('" + m + "', true)").removeClass("active")
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
    $("#" + m).attr("onclick","hide('" + m + "', true)").addClass("active")
    view[m] = true
    if (doStats) {
        makeStats()
    }
}

function updateAutoClose(id, r) {
    v = $("#"+id).val()
    autoClose[id] =  v
    if (r) {
        makeStats()
    }
}
/*
 Manage the student selection
 */
function selectAll() {
    console.log("all")
    $("input[type='checkbox']").attr('checked', true)
}

function selectNone() {
    console.log("none")
    $("input[type='checkbox']").attr('checked', false)
}

function invertSelection() {
    console.log("invert")
    $("input[type='checkbox']").each( function() {
        console.log("hop")
        $(this).attr('checked', !$(this).attr('checked'))
    })
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
    var currentDate = new Date().getTime()
    toKeep.forEach(function(app) {
        var uId = app.userId
        app["ignore"] = false
        if (!studentStats.hasOwnProperty(uId)) {
            studentStats[uId] = {granted : false,
                                nbOpen : 0,
                                nbPending : 0,
                                nbClosedPending: 0,
                                nbDenied : 0,
                                nbApplications : 0}
        }
        if (app.status == "granted") {
            studentStats[uId].granted = true
        } else if (app.status == "open") {
            if (app.nbInterviews > 0) {
                studentStats[uId].nbPending++
            } else {
                if (app.status == "open") {
                    d = parseInt(app.date)
                    if (currentDate - d < autoClose["openDeadlineInput"] * 1000 * 3600 * 24) {
                        studentStats[uId].nbOpen++
                    } else {
                        app["ignore"] = true
                    }
                }
            }
        } else if (app.status == "denied") {
            studentStats[uId].nbDenied++
            if (app.nbInterviews > 0) {
                studentStats[uId].nbClosedPending++
            }
        }
        studentStats[uId].nbApplications++
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
        var style = "danger"
        if (s.granted) {
            nbGranted++
            style = "success"
        } else if (s.nbPending > 0) {
            nbPending++
            style = "active"
        } else if (s.nbOpen > 0) {
            nbOpen++
            style = "warning"
        }
        var toRender = {username : username,
                        id : uid,
                        email : students[uid].email,
                        style : style,
                        major: students[uid].major,
                        strLastUpdate : new Date(parseInt(students[uid].lastUpdate)).toDateString(),
                        granted : s.granted,
                        nbOpenPending : s.nbPending,
                        nbInterwiews: s.nbClosedPending + s.nbPending,
                        nbOpen : s.nbOpen,
                        nbApplications : s.nbApplications
        }
        tableBuf += templatizer.student_line(toRender)
    })

    var nbStudents = Object.keys(studentStats).length
    drawProgressBar(nbOpen, nbPending, nbGranted, nbStudents)
    $("#studentTable").html(tableBuf)
    $("#nbStudents").html(nbStudents)
}

function drawProgressBar(nbOpen, nbPending, nbGranted, nbStudents) {
    var stats = {
        waiting_pct : Math.floor((nbOpen / nbStudents) * 100),
        waiting: nbOpen,
        pending_pct : Math.floor((nbPending / nbStudents) * 100),
        pending: nbPending,
        granted_pct : Math.floor((nbGranted / nbStudents) * 100),
        granted: nbGranted
    }
    stats.rejected_pct  = 100 - stats.waiting - stats.pending - stats.granted
    stats.rejected = nbStudents - stats.waiting - stats.pending - stats.granted
    console.log(stats)
    console.log(nbStudents)
    $("#student-progress").html(templatizer.student_progress_bar(stats))

}
function getUsers() {
    $.get("/users/", function(data) {
        students = data
        console.log(students.length + " student(s) total")
        loadApplications()
    }).fail(function(data) {$("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")})
}
$( document ).ready(function () {
    updateAutoClose("pendingDeadlineInput", false)
    updateAutoClose("pendingOpenInput", false)
    getMajors2()
})