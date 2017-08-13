import firebase from 'firebase';

var config = {
  apiKey: 'AIzaSyBq-Dk27N-OxEio0iHV0W1ifiUp3_BJcus',
  authDomain: 'image-uploader-88aa8.firebaseapp.com',
  databaseURL: 'https://image-uploader-88aa8.firebaseio.com',
  projectId: 'image-uploader-88aa8',
  storageBucket: 'image-uploader-88aa8.appspot.com',
  messagingSenderId: '895095955555'
};

export default firebase.initializeApp(config);

export var database = firebase.database();
export var auth = firebase.auth();
export var storage = firebase.storage();
export var GithubAuthProvider = new firebase.auth.GithubAuthProvider();
