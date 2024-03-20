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
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Failed to load model:', error);
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
                let width = img.width;
                let height = img.height;

                // Check if image dimensions exceed 512x512
                if (width > 512 || height > 512) {
                    // Resize the image
                    if (width > height) {
                        height = Math.round((512 / width) * height);
                        width = 512;
                    } else {
                        width = Math.round((512 / height) * width);
                        height = 512;
                    }
                }

                // Create a canvas to draw the resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert the canvas to a data URL
                const dataUrl = canvas.toDataURL();

                // Create a new image element with the resized image
                const resizedImgElement = new Image();
                resizedImgElement.src = dataUrl;
                resizedImgElement.width = width;
                resizedImgElement.height = height;

                // Display the resized image
                imageContainer.innerHTML = '';
                imageContainer.appendChild(resizedImgElement);

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
window.onload = loadModel;
