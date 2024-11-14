// js/script.js
let model = null;

// Load the model when the page loads
async function loadModel() {
    try {
        model = await tf.loadLayersModel('model/model.json');
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

// Load the model when the page loads
loadModel();

// Handle image upload
document.getElementById('imageUpload').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('selected-file').textContent = 'Selected file: ' + file.name;
        
        // Show preview
        const preview = document.getElementById('imagePreview');
        preview.style.display = 'block';
        
        // Process image
        await processImage(file);
    }
});

async function processImage(file) {
    try {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        await img.decode(); // Make sure image is loaded
        
        // Resize image to match model input size (64x64)
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 64, 64);
        
        // Convert to tensor
        let tensor = tf.browser.fromPixels(canvas)
            .toFloat()
            .expandDims();
            
        // Normalize the tensor
        tensor = tensor.div(255.0);
        
        // Show loader
        document.querySelector('.loader').style.display = 'block';
        
        // Make prediction
        const prediction = await model.predict(tensor).data();
        const probability = prediction[0];
        
        // Display results
        displayResults(probability);
        
    } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
    } finally {
        document.querySelector('.loader').style.display = 'none';
    }
}

function displayResults(probability) {
    const resultSection = document.getElementById('result-section');
    const predictionText = document.getElementById('prediction-text');
    const confidenceText = document.getElementById('confidence-text');
    
    resultSection.style.display = 'block';
    
    const prediction = probability > 0.5 ? 'Positive' : 'Negative';
    const confidence = Math.abs(probability - 0.5) * 200;
    
    const resultColor = prediction === 'Positive' ? '#ff4444' : '#44aa44';
    predictionText.innerHTML = `Prediction: <strong style="color: ${resultColor}">${prediction}</strong>`;
    confidenceText.textContent = `Confidence: ${confidence.toFixed(2)}%`;
}
