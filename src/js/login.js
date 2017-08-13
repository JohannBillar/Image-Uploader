import { auth, GithubAuthProvider } from './firebase';

var loginBtn = document.querySelector('.login-button');
var logoutBtn = document.querySelector('.logout-button');

loginBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);

function login() {
  return auth.signInWithPopup(GithubAuthProvider);
}
function logout() {
  return auth.signOut();
}

auth.onAuthStateChanged(function(user) {
  if (user) {
    loginBtn.parentNode.style.display = 'none';
    logoutBtn.parentNode.style.display = 'block';
    console.log('LOGGEDIN WITH: ', user.displayName);
  } else {
    logoutBtn.parentNode.style.display = 'none';
    loginBtn.parentNode.style.display = 'block';
    console.log('LOGGEDOUT');
  }
});
