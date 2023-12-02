//=============== AWS IDs ===============
var userPoolId = '<User Pool ID>';
var clientId = '<App Client ID>';
var region = '<Region>';
var identityPoolId = '<Identity Pool ID>';
//=============== AWS IDs ===============

var cognitoUser;
var idToken;
var userPool;
        
var poolData = { 
    UserPoolId : userPoolId,
    ClientId : clientId
};

document.addEventListener('DOMContentLoaded', () => {
    // Verify User Session
    // console.log("[user-auth.js] addEventListener : " + idToken);
    
});

/*
If user has logged in before, get the previous session so user doesn't need to log in again.
*/
function getCurrentLoggedInSession(){
    // console.log("[user-auth.js] getCurrentLoggedInSession : " + idToken);
    //idToken = 'Init';
}