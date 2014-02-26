module.exports = {

    newApplication : function(user, date, company, note, next) {
        if (empty("user", user, next) || empty("date", date, next) || empty("company", company, next) || !userExists(user, next)) {
            return
        }
        var id = applications[user].length
        var app = {"id" : id, date : date, company : company, note : note, nbInterviews: 0, status : "open"}
        applications[user].push(app)
        next(null, app)
    },

    getApplication : function(user, id) {
        if (empty("user", user, next) || empty("id", id, next) || !userExists(user, next) || !appExists(user, id, next)) {
            return
        }
        next(null, applications[user].id)
    },

    getApplications : function(user, next) {
        if (empty("user", user, next) || !userExists(user, next)) {
            return
        }
        var res = applications[user]
        if (!res) {
            res = Array()
            applications[user] = res
        }
        next(null, res)
    },

    incInterview : function(user, id, next) {
        if (empty("user", user, next) || empty("id", id, next) || !userExists(user, next) || !appExists(user, id, next)) {
            return
        }
        applications[user][id].nbInterviews++
        next(null, applications[user][id].nbInterviews)
    },
    setStatus : function(user, id, st, next) {
        if (empty("user", user, next) || empty("id", id, next) || empty("status", st, next) || !userExists(user, next) || !appExists(user, id, next)) {
            return
        }
        if (st == "denied" || st == "granted" || st == "open") {
            applications[user][id].status = st;
            next(null, st)
        } else {
            next(new Error("Unsupported status '" + st + "'"))
        }
    },
    setNote : function(user, id, n, next) {
        if (empty("user", user, next) || empty("id", id, next) || !userExists(user, next) || !appExists(user, id, next)) {
            return
        }
        applications[user].id.note = n;
        next(null)
    },
    isRegistered : function(mail, password, next) {
        users.forEach(function(u) {
            if (u.login == mail && u.password == password) {
                next(null, u)
                return
            }
        })
    }
}

var applications = Array()
nbApplications = 0;

var users = [
    {id :0, login: "fabien.hermenier@unice.fr", password: "foo", major: "CSSR"},
    {id :1, login: "fabien.hermenier@inria.fr", password: "bar", admin:true}
]


function empty(id, x, next) {
    if (x == undefined ||  x.length == 0) {
        next(new Error("Missing parameter for '" + id + "'"), null)
        return true;
    }
    return false
}

function userExists(userId, next) {
    if (userId >= 0 && userId < users.length) {
        return true;
    }
    next(new Error("Unknown user '" + user + "'"))
    return false
}

function appExists(user, id, next) {
    if (userExists(user, next)) {
        if (id >= 0 && id < applications[user].length) {
            return true
        }
        next(new Error("Unknown application id '" + id + "'"))
    }
    return false
}