import { auth, database, GithubAuthProvider } from './firebase';

var usersRef = database.ref('/users');

var loginBtn = document.querySelector('.login-button');
var logoutBtn = document.querySelector('.logout-button');
var currentUser = null;

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
    currentUser = user;

    var userRef = usersRef.child(currentUser.uid);
    var userObject = {
      name: currentUser.displayName,
      email: currentUser.email,
      photoURL: currentUser.photoURL,
      uid: currentUser.uid
    };

    userRef.update(userObject);

    loginBtn.parentNode.style.display = 'none';
    logoutBtn.parentNode.style.display = 'block';

    console.log('LOGGEDIN WITH: ', currentUser.displayName);
  } else {
    logoutBtn.parentNode.style.display = 'none';
    loginBtn.parentNode.style.display = 'block';
    console.log('LOGGEDOUT');
  }
}),
  function(error) {
    console.log('LOGIN ON AUTHSTATECHANGED ->', error);
  };

export var user = currentUser;
