import { auth, database, storage } from './firebase';
import login, { user } from './login';

var usersImagesRef = database.ref('/userImages');

var imageCapture = document.querySelector('.image-capture');
var submitBtn = document.querySelector('.btn-upload-image');

imageCapture.addEventListener('change', addImages);
submitBtn.addEventListener('click', uploadImageTask);

var files = [];
function addImages() {
  if (!this.files[0].type.match('image/.*')) {
    alert('You can only add images at the moment.');
    return;
  }
  return files.push(this.files[0]);
}

function uploadImageTask() {
  var file = files[0];
  var uid = auth.currentUser.uid;
  var filePath = 'userImages/' + uid + '/' + 'images/' + file.name + '-' + Math.floor(Math.random() * 100);
  var uploadTask = storage.ref(filePath).put(file);

  uploadTask.on(
    'state_changed',
    function progress(snapshot) {
      var progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
      console.log('Upload is ' + progress + '% done');
    },
    function(error) {
      console.log('ERROR UPLOAD IMAGE TASK', error);
    },
    function() {
      var downloadURL = uploadTask.snapshot.downloadURL;
      usersImagesRef
        .child(uid)
        .child('downloadURLs')
        .push({ url: downloadURL, name: file.name });
    }
  );
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
      var pushKey = snapshot.key;
      var liArray = Array.prototype.slice.call(imageContainer.querySelectorAll('li'));
      var changedImageURL = snapshot.val().url;
      var altText = snapshot.val().name;
      updateImageUI(liArray, pushKey, changedImageURL, altText);
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
    '<label for="edit-image' +
    pushKey +
    '">' +
    '<span class="fa fa-pencil" aria-label="Edit image"></span>' +
    '<input class="edit-image-capture hide-component" id="edit-image' +
    pushKey +
    '" type="file" accept="image/*,capture=camera">' +
    '</label>' +
    '<span class="fa fa-trash" aria-label="Delete image"></span>' +
    '<img src="' +
    URL +
    '" alt="' +
    altText +
    '">' +
    '</li>';
  if (imageContainer.innerHTML !== '') {
    addEditImagesListener();
    addDeleteImagesClickListeners();
  }
}

function updateImageUI(liArray, pushKey, changedImageURL, altText) {
  liArray.forEach(function(li) {
    if (li.id === pushKey) {
      var imgEl = li.childNodes[2];
      imgEl.src = changedImageURL;
      imgEl.alt = altText;
    }
  });
}

function deleteImageUI(liArray, pushKey) {
  liArray.forEach(function(li) {
    if (li.id === pushKey) {
      li.remove();
    }
  });
}

function editImage() {
  var files = [];
  var pushKey = this.parentNode.parentNode.id;

  if (!this.files[0].type.match('image/.*')) {
    alert('You can only add images at the moment.');
    return;
  }
  files.push(this.files[0]);

  var file = files[0];
  var uid = auth.currentUser.uid;
  var filePath = 'userImages/' + uid + '/' + 'images/' + file.name + '-' + Math.floor(Math.random() * 100);
  var uploadTask = storage.ref(filePath).put(file);

  uploadTask.on(
    'state_changed',
    function progress(snapshot) {
      var progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
      console.log('Upload is ' + progress + '% done');
    },
    function(error) {
      console.log('ERROR UPLOAD IMAGE TASK', error);
    },
    function() {
      var downloadURL = uploadTask.snapshot.downloadURL;
      usersImagesRef
        .child(uid)
        .child('downloadURLs')
        .child(pushKey)
        .set({ url: downloadURL, name: file.name });
    }
  );
  files = [];
  this.value = '';
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

function addEditImagesListener() {
  var editImageCaptureArray = Array.prototype.slice.call(document.querySelectorAll('.edit-image-capture'));
  editImageCaptureArray.forEach(function(imageCapture) {
    imageCapture.addEventListener('change', editImage);
  });
}

function addDeleteImagesClickListeners() {
  var deleteIconsArray = Array.prototype.slice.call(document.querySelectorAll('.fa-trash'));
  deleteIconsArray.forEach(function(deleteIcon) {
    deleteIcon.addEventListener('click', deleteImage);
  });
}
