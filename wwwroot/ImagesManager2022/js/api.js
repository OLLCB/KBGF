const url = "https://201704370-ocbkbg-f.glitch.me";
//const url = "http://localhost:5000";
const apiBaseURL = url + "/api/images";
const loginBaseUrl = url + "/token";
const registerBaseUrl = url + "/accounts/register";
const modifyUserBaseUrl = url + "/accounts/modify";
const verifyCodeBaseUrl = url + "/accounts/verify?";
const getUserIdBaseUrl = url + "/accounts/index";
const logoutBaseUrl = url + "/accounts/logout";
const deleteUserBaseUrl = url + "/accounts/remove";

// IMAGES -----------------------------------------------------------------------------------------------------------------------------------------------------
function HEAD(successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL,
        type: 'HEAD',
        contentType: 'text/plain',
        complete: request => { successCallBack(request.getResponseHeader('ETag')) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function GET_ID(id, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/" + id,
        type: 'GET',
        success: data => { successCallBack(data); },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function GET_ALL(successCallBack, errorCallBack, queryString = null) {
    let url = apiBaseURL + (queryString ? queryString : "");
    $.ajax({
        url: url,
        type: 'GET',
        success: (data, status, xhr) => { successCallBack(data, xhr.getResponseHeader("ETag")) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function POST(data, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        headers: getAutorizationBearerToken(),
        success: (data) => { successCallBack(data) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function PUT(bookmark, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/" + bookmark.Id,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(bookmark),
        headers: getAutorizationBearerToken(),
        success: () => { successCallBack() },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function DELETE(id, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/" + id,
        type: 'DELETE',
        headers: getAutorizationBearerToken(),
        success: () => { successCallBack() },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

// ACCOUNTS -----------------------------------------------------------------------------------------------------------------------------------------------------
// Misc
function getAndStoreUserInfo(userId, successCallBack, errorCallBack) {
    GETUSER_ID(userId, successCallBack, errorCallBack);
}
function storeTokenInfo(tokenInfo) {
    localStorage.setItem("UserId", tokenInfo.UserId);
    localStorage.setItem("Access_token", tokenInfo.Access_token);
}
function storeUser(user) {
    localStorage.setItem("User", user);
}
function getAutorizationBearerToken() {
    return { 'Authorization': 'Bearer ' + getAccessToken() }
}
function getAccessToken() {
    return localStorage.getItem("Access_token");
}

// Ajax
function REGISTER(data, successCallBack, errorCallBack) {
    $.ajax({
        url: registerBaseUrl,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (newData) => { successCallBack(newData) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function LOGIN(data, successCallBack, errorCallBack) {
    $.ajax({
        url: loginBaseUrl,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (data) => {
            storeTokenInfo(data);
            getAndStoreUserInfo(data.UserId, successCallBack);
        },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function USERPUT(user, successCallBack, errorCallBack) {
    $.ajax({
        url: modifyUserBaseUrl + "/" + user.Id,
        type: 'PUT',
        contentType: 'application/json',
        headers: getAutorizationBearerToken(),
        data: JSON.stringify(user),
        success: () => {
            getAndStoreUserInfo(user.Id, successCallBack);
        },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function LOGOUT(id, successCallBack, errorCallBack) {
    $.ajax({
        url: logoutBaseUrl + "/" + id,
        type: 'GET',
        success: data => { successCallBack(JSON.stringify(data)); },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function GETUSER_ID(id, successCallBack, errorCallBack) {
    $.ajax({
        url: getUserIdBaseUrl + "/" + id,
        type: 'GET',
        success: data => { storeUser(JSON.stringify(data)); successCallBack(data); },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function GETUSER(id, successCallBack, errorCallBack) {
    $.ajax({
        url: getUserIdBaseUrl + "/" + id,
        type: 'GET',
        success: data => { successCallBack(data); },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function VERIFYCODE(id, code, successCallBack, errorCallBack) {
    $.ajax({
        url: verifyCodeBaseUrl + "id=" + id + "&code=" + code,
        type: 'GET',
        success: data => { 
            if(localStorage.getItem("User")){
                let user = JSON.parse(localStorage.getItem("User"));
                user.VerifyCode = "verified";
                console.log(user);
                storeUser(JSON.stringify(user));
            }
            successCallBack(data); 
        },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function DELETEUSER(id, successCallBack, errorCallBack) {
    let token = getAutorizationBearerToken();
    $.ajax({
        url: deleteUserBaseUrl + "/" + id,
        type: 'GET',
        headers: token,
        success: () =>{
            successCallBack();
        },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}