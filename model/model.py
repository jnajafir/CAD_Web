import tensorflow as tf
import tensorflowjs as tfjs

# Load your existing model
model = tf.keras.models.load_model('CAD_Flask.h5')

# Convert and save the model to TensorFlow.js format
tfjs.converters.save_keras_model(model, 'model')
