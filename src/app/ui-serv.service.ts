import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';


// @Injectable({
//   providedIn: 'root'
// })



export class UiServService {


  constructor() { }

 
  messageElement = document.getElementById('message');
  imagesElement = document.getElementById('images');
  // lossValues = [[], []];
  // accuracyValues = [[], []];
  // lossLabelElement = document.getElementById('loss-label');
  // accuracyLabelElement = document.getElementById('accuracy-label');
   
  logStatus(message) {
    const statusElement = document.getElementById('status');
    statusElement.innerText = message
  }
  
  // trainingLog(message) {
  //   this.messageElement.innerText = `${message}\n`;
  //   console.log(message);
  // }
  
  showTestResults(batch, predictions, labels) {
    const testExamples = batch.xs.shape[0];
    this.imagesElement.innerHTML = '';
    for (let i = 0; i < testExamples; i++) {
      const image = batch.xs.slice([i, 0], [1, batch.xs.shape[1]]);
  
      const div = document.createElement('div');
      div.className = 'pred-container';
  
      const canvas = document.createElement('canvas');
      canvas.className = 'prediction-canvas';
      this.draw(image.flatten(), canvas);
  
      const pred = document.createElement('div');
  
      const prediction = predictions[i];
      const label = labels[i];
      const correct = prediction === label;
  
      pred.className = `pred ${(correct ? 'pred-correct' : 'pred-incorrect')}`;
      pred.innerText = `pred: ${prediction}`;
  
      div.appendChild(pred);
      div.appendChild(canvas);
  
      this.imagesElement.appendChild(div);
    }
  }
  

  // plotLoss(batch, loss, set) {
  //   const series = set === 'train' ? 0 : 1;
  //   this.lossValues[series].push({x: batch, y: loss});
  //   const lossContainer = document.getElementById('loss-canvas');
  //   tfvis.render.linechart(
  //       {values: this.lossValues, series: ['train', 'validation']}, lossContainer, {
  //         xLabel: 'Batch #',
  //         yLabel: 'Loss',
  //         width: 400,
  //         height: 300,
  //       });
  //       this.lossLabelElement.innerText = `last loss: ${loss.toFixed(3)}`;
  // }
  

  // plotAccuracy(batch, accuracy, set) {
  //   const accuracyContainer = document.getElementById('accuracy-canvas');
  //   const series = set === 'train' ? 0 : 1;
  //   this.accuracyValues[series].push({x: batch, y: accuracy});
  //   tfvis.render.linechart(
  //       {values: this.accuracyValues, series: ['train', 'validation']},
  //       accuracyContainer, {
  //         xLabel: 'Batch #',
  //         yLabel: 'Accuracy',
  //         width: 400,
  //         height: 300,
  //       });
  //       this.accuracyLabelElement.innerText =
  //       `last accuracy: ${(accuracy * 100).toFixed(1)}%`;
  // }
  
  draw(image, canvas) {
    const [width, height] = [28, 28];
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(width, height);
    const data = image.dataSync();
    for (let i = 0; i < height * width; ++i) {
      const j = i * 4;
      imageData.data[j + 0] = data[i] * 255;
      imageData.data[j + 1] = data[i] * 255;
      imageData.data[j + 2] = data[i] * 255;
      imageData.data[j + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }
  
  // getModelTypeId() {
  //   return document.getElementById('model-type');
  // }
  
  getTrainEpochs() {
    return Number.parseInt(document.getElementById('train-epochs').nodeValue);
  }
 
  // setTrainButtonCallback(callback) {
  //   const trainButton = document.getElementById('train');
  //   const modelType = document.getElementById('model-type');
  //   trainButton.addEventListener('click', () => {
  //     trainButton.setAttribute('disabled', 'true');
  //     modelType.setAttribute('disabled', 'true');
  //     callback();
  //   });
  // }

}
