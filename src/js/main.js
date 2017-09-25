import { auth, database, storage } from './firebase';
import login, { user } from './login';

var usersImagesRef = database.ref('/userImages');

var imageCapture = document.querySelector('.image-capture');
var submitBtn = document.querySelector('.btn-upload-image');

imageCapture.addEventListener('change', addImages);
submitBtn.addEventListener('click', uploadImageTask);

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
  var fileName = file.name + '-' + Math.floor(Math.random() * 100);
  var filePath = 'userImages/' + uid + '/' + 'images/' + fileName;
  var uploadTask = storage.ref(filePath).put(file, { contentType: file.type });

  uploadTask.on(
    'state_changed',
    function progress(snapshot) {
      var progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
      console.log('Upload is ' + progress + '% done');
    },
    function(error) {
      error.code === 'storage/unauthorized'
        ? window.alert('Your image could not be uploaded :( \n The size cannot exceed 1Mb')
        : console.log('ERROR UPLOAD IMAGE TASK', error);
    }
  );
  uploadTask.then(function(snapshot) {
    var downloadURL = snapshot.downloadURL;
    usersImagesRef
      .child(uid)
      .child('downloadURLs')
      .push({ url: downloadURL, name: fileName });
  });

  files = [];
  imageCapture.value = '';
}

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
  if (!this.files[0].type.match('image/.*')) {
    alert('You can only add images at the moment.');
    return;
  }
  files.push(this.files[0]);

  var file = files[0];
  var uid = auth.currentUser.uid;
  var fileName = file.name + '-' + Math.floor(Math.random() * 100);
  var filePath = 'userImages/' + uid + '/' + 'images/' + fileName;
  var uploadTask = storage.ref(filePath).put(file, { contentType: file.type });
  var pushKey = this.parentNode.parentNode.id;
  var currentFileName = this.parentNode.parentNode.lastChild.alt;

  var imageRef = usersImagesRef
    .child(uid)
    .child('downloadURLs')
    .child(pushKey);

  uploadTask.on(
    'state_changed',
    function progress(snapshot) {
      var progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
      console.log('Upload is ' + progress + '% done');
    },
    function(error) {
      error.code === 'storage/unauthorized'
        ? window.alert('Your image could not be uploaded :( \n The size cannot exceed 1Mb')
        : console.log('ERROR EDIT IMAGE TASK', error);
    }
  );

  uploadTask
    .then(function(snapshot) {
      var downloadURL = snapshot.downloadURL;
      imageRef.set({ url: downloadURL, name: fileName });
    })
    .then(function() {
      var filePath = 'userImages/' + uid + '/' + 'images/';
      var storageRef = storage.ref(filePath);
      storageRef.child(currentFileName).delete();
    });

  files = [];
  this.value = '';
}

function deleteImage() {
  var uid = auth.currentUser.uid;
  var pushKey = this.parentNode.id;
  var fileName = this.nextSibling.alt;
  var filePath = 'userImages/' + uid + '/' + 'images/';
  var storageRef = storage.ref(filePath);
  var imageRef = usersImagesRef
    .child(uid)
    .child('downloadURLs')
    .child(pushKey);

  if (window.confirm('Are you sure you want to delete your image?')) {
    storageRef
      .child(fileName)
      .delete()
      .then(function() {
        imageRef.update({
          url: null,
          name: null
        });
      })
      .catch(function(error) {
        console.log('DELETE IMAGE ERROR: ', error);
      });
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
