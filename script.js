let model;
const classes = {
    0: 'Baked Potato',
    1: 'Burger',
    2: 'Crispy Chicken',
    3: 'Donut',
    4: 'Fries',
    5: 'Hot Dog',
    6: 'Pizza',
    7: 'Sandwich',
    8: 'Taco',
    9: 'Taquito'
};

async function loadModel() {
    try {
        model = await tf.loadLayersModel('Model/model.json');
        const modeltag = document.getElementById('modelTag');
        modeltag.innerHTML = `<u>Try Model( Loaded! )</u>`;
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Failed to load model:', error);
    }
}

function handleImageUpload() {
    const imageInput = document.getElementById('imageInput');
    const imageContainer = document.getElementById('imageContainer');
    const file = imageInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                // Display the selected image
                imageContainer.innerHTML = '';
                imageContainer.appendChild(img);
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }
}

function detectImage() {
    if (!model) {
        console.error('Model not loaded yet');
        return;
    }
    const imageInput = document.getElementById('imageInput');
    const imageContainer = document.getElementById('imageContainer');
    const file = imageInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = async function (e) {
            const img = new Image();
            img.onload = async function () {

                // Convert the resized image to a TensorFlow tensor for prediction
                const imageTensor = tf.browser.fromPixels(img)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat()
                    .expandDims();
                const scaledImg = imageTensor.div(255);

                // Make predictions on the scaled image
                const prediction = await model.predict(scaledImg).data();
                const predictedClass = classes[prediction.indexOf(Math.max(...prediction))];

                imageContainer.innerHTML += `<p class='mt-2 fw-bold fs-1'>Predicted Class: ${predictedClass}</p>`;
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }
}

// Load the model when the page is loaded
window.onload = function () {
    loadModel();
    // Call the handleImageUpload function when an image is chosen
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);
};
