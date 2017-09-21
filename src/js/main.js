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
              .push({ url: url, name: file.name });
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
      var newImageURL = snapshot.val().url;
      var pushKey = snapshot.key;
      var altText = snapshot.val().name;
      createImageUI(newImageURL, pushKey, altText);
    });

    userImagesRef.on('child_changed', function(snapshot, prevChildKey) {
      var changedImage = snapshot.val();
    });

    userImagesRef.on('child_removed', function(snapshot, prevChildKey) {
      var pushKey = snapshot.key;
      var liArray = Array.prototype.slice.call(imageContainer.querySelectorAll('li'));
      deleteImageUI(liArray, pushKey);
    });
  } else {
    mainContainer.style.display = 'none';
    imageContainer.innerHTML = '';
  }
});

function createImageUI(URL, pushKey, altText) {
  imageContainer.innerHTML +=
    '<li id="' +
    pushKey +
    '">' +
    '<span class="fa fa-pencil" aria-label="Edit image"></span>' +
    '<span class="fa fa-trash" aria-label="Delete image"></span>' +
    '<img src="' +
    URL +
    '" alt="' +
    altText +
    '">' +
    '</li>';
  if (imageContainer.innerHTML !== '') {
    addEditImageClickListeners();
    addDeleteImageClickListeners();
  }
}

function updateImageUI(URL) {}

function deleteImageUI(liArray, pushKey) {
  liArray.forEach(function(li) {
    if (li.id === pushKey) {
      li.remove();
    }
  });
}

function editImage() {
  console.log('EDIT IMAGE -> ', this.parentNode.id);
}

function deleteImage() {
  var pushKey = this.parentNode.id;
  var imageRef = usersImagesRef
    .child(auth.currentUser.uid)
    .child('downloadURLs')
    .child(pushKey);
  if (window.confirm('Are you sure you want to delete your image?')) {
    imageRef.remove();
  }
}

function addEditImageClickListeners() {
  var editPencilsNodeList = document.querySelectorAll('.fa-pencil');
  var editPencilsArray = Array.prototype.slice.call(editPencilsNodeList);
  editPencilsArray.forEach(function(editPencil) {
    editPencil.addEventListener('click', editImage);
  });
}

function addDeleteImageClickListeners() {
  var deleteIconsNodeList = document.querySelectorAll('.fa-trash');
  var deleteIconsArray = Array.prototype.slice.call(deleteIconsNodeList);
  deleteIconsArray.forEach(function(deleteIcon) {
    deleteIcon.addEventListener('click', deleteImage);
  });
}
