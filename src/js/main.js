import { auth, database, storage } from './firebase';

var userImagesRef = database.ref('/userImages');

var imageCapture = document.querySelector('.image-capture');
var submitBtn = document.querySelector('.btn-upload-image');

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
            userImagesRef
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

imageCapture.addEventListener('change', addImages);
submitBtn.addEventListener('click', uploadImage);
