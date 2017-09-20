import { auth, database, storage } from './firebase';
import login, { user } from './login';

var usersImagesRef = database.ref('/userImages');

var imageCapture = document.querySelector('.image-capture');
var submitBtn = document.querySelector('.btn-upload-image');

imageCapture.addEventListener('change', addImages);
submitBtn.addEventListener('click', uploadImage);

var files = [];
function addImages() {
  if (!this.files[0].type.match('image/.*')) {
    alert('You can only add images at the moment.');
    return;
  }
  return files.push(this.files[0]);
}

function uploadImage() {
  var uid = auth.currentUser.uid;

  files.forEach(function(file) {
    var filePath = 'userImages/' + uid + '/' + 'images/' + file.name;
    storage
      .ref(filePath)
      .put(file)
      .then(function(snapshot) {
        var path = snapshot.metadata.fullPath;
        storage
          .ref(path)
          .getDownloadURL()
          .then(function(url) {
            usersImagesRef
              .child(uid)
              .child('downloadURLs')
              .push(url);
          })
          .catch(function(error) {
            console.log('URL UPLOAD IMAGE ERROR -> ', error);
          });
      })
      .catch(function(error) {
        console.log('UPLOAD IMAGE ERROR -> ', error);
      });
  });
  files = [];
  imageCapture.value = '';
}

var mainContainer = document.querySelector('main.container');
var imageContainer = document.querySelector('.images-container');

auth.onAuthStateChanged(function(user) {
  if (user) {
    mainContainer.style.display = 'block';

    var uid = user.uid;
    var userImagesRef = usersImagesRef.child(uid).child('downloadURLs');

    userImagesRef.on('child_added', function(snapshot, prevChildKey) {
      var newImageURL = snapshot.val();
      createImageUI(newImageURL);
    });

    userImagesRef.on('child_changed', function(snapshot, prevChildKey) {
      var changedImage = snapshot.val();
    });

    userImagesRef.on('child_removed', function(snapshot, prevChildKey) {
      var deletedImage = snapshot.val();
    });
  } else {
    mainContainer.style.display = 'none';
    imageContainer.innerHTML = '';
  }
});

function createImageUI(URL) {
  imageContainer.innerHTML += '<li>' + '<img src="' + URL + '" alt="">' + '</li>';
}

function updateImageUI(URL) {}
function deleteImageUI(URL) {}
