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
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('selected-file').textContent = 'Selected file: ' + file.name;
        
        // Show preview
        const preview = document.getElementById('imagePreview');
        const ctx = preview.getContext('2d');
        preview.style.display = 'block';
        
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            preview.width = img.width;
            preview.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Show the "Analyze" button
            document.getElementById('analyzeButton').style.display = 'block';
        };
    }
});

// Function to analyze the image
async function analyzeImage() {
    try {
        const canvas = document.getElementById('imagePreview');
        let tensor = tf.browser.fromPixels(canvas)
            .resizeNearestNeighbor([64, 64])
            .toFloat()
            .expandDims();
            
        tensor = tensor.div(255.0);

        // Show loader
        document.querySelector('.loader').style.display = 'block';
        
        // Make prediction
        const prediction = await model.predict(tensor).data();
        const probability = prediction[0];
        
        // Display results
        displayResults(probability);
        
    } catch (error) {
        console.error('Error analyzing image:', error);
        alert('Error analyzing image. Please try again.');
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
