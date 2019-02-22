import { Component, ViewChild, OnInit } from '@angular/core';
import { DrawableDirective } from './drawable.directive';
import { UiServService } from '../app/ui-serv.service';

import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  linearModel: tf.Sequential;
  prediction: any;

  model: tf.Model;
  predictions: any;

  @ViewChild(DrawableDirective) canvas;

  constructor(private ui: UiServService) {  }
  ngOnInit() {
    this.loadImg();
    // this.loadModel();
  }


  IMAGE_H:number = 28;
  IMAGE_W:number = 28;
  IMAGE_SIZE:number = this.IMAGE_H * this.IMAGE_W;
  NUM_CLASSES:number = 10;
  NUM_DATASET_ELEMENTS:number = 65000;

  NUM_TRAIN_ELEMENTS:number = 5000;
  NUM_TEST_ELEMENTS:number = this.NUM_DATASET_ELEMENTS - this.NUM_TRAIN_ELEMENTS;

  MNIST_IMAGES_SPRITE_PATH:string =
    'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png';
  MNIST_LABELS_PATH:string =
    'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8';
    trainImages;
    trainLabels;
    testImages;
    testLabels;
    datasetImages;
  //// LOAD PRETRAINED KERAS MODEL ////

  async loadImg(){
  var img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const imgRequest = new Promise((resolve, reject) => {
    img.crossOrigin = '';
    img.onload = () => {
      img.width = img.naturalWidth;
      img.height = img.naturalHeight;

      const datasetBytesBuffer =
          new ArrayBuffer(this.NUM_DATASET_ELEMENTS * this.IMAGE_SIZE * 4);

      const chunkSize = 5000;
      canvas.width = img.width;
      canvas.height = chunkSize;

      for (let i = 0; i < this.NUM_DATASET_ELEMENTS / chunkSize; i++) {
        const datasetBytesView = new Float32Array(
            datasetBytesBuffer, i * this.IMAGE_SIZE * chunkSize * 4,
            this.IMAGE_SIZE * chunkSize);
        ctx.drawImage(
            img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width,
            chunkSize);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let j = 0; j < imageData.data.length / 4; j++) {
          // All channels hold an equal value since the image is grayscale, so
          // just read the red channel.
          datasetBytesView[j] = imageData.data[j * 4] / 255;
        }
      }
      this.datasetImages = new Float32Array(datasetBytesBuffer);
      resolve();
      // return this.datasetImages;
    };
    img.src = this.MNIST_IMAGES_SPRITE_PATH;
  });

  const labelsRequest = fetch(this.MNIST_LABELS_PATH);
  const [imgResponse, labelsResponse] =
  await Promise.all([imgRequest, labelsRequest]);
  const datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

  // Slice the the images and labels into train and test sets.

  this.trainImages = this.datasetImages.slice(0, this.IMAGE_SIZE * this.NUM_TRAIN_ELEMENTS);
  this.testImages = this.datasetImages.slice(this.IMAGE_SIZE * this.NUM_TRAIN_ELEMENTS);
  this.trainLabels = datasetLabels.slice(0, this.NUM_CLASSES * this.NUM_TRAIN_ELEMENTS);
  this.testLabels = datasetLabels.slice(this.NUM_CLASSES * this.NUM_TRAIN_ELEMENTS);

  // const xs = tf.tensor4d(this.trainImages,[this.trainImages.length / this.IMAGE_SIZE, this.IMAGE_H, this.IMAGE_W, 1]);
  // const labels = tf.tensor2d(this.trainLabels, [this.trainLabels.length / this.NUM_CLASSES, this.NUM_CLASSES]);
  // return {xs, labels};
}

normdat(){
  const xs = tf.tensor4d(this.trainImages,[this.trainImages.length / this.IMAGE_SIZE, this.IMAGE_H, this.IMAGE_W, 1]);
  const labels = tf.tensor2d(this.trainLabels, [this.trainLabels.length / this.NUM_CLASSES, this.NUM_CLASSES]);
  return {xs, labels};
}


  async loadModel() {
    this.model = await tf.loadModel('/assets/model.json');
    this.model.compile({loss: 'meanSquaredError', optimizer: 'SGD'});

    const valic = this.normdat();

    const batchSize = 320;
    const validationSplit = 0.15;
    const trainEpochs = 2;
    let trainBatchCount = 0;
    const totalNumBatches =Math.ceil(valic.xs.shape[0] * (1 - validationSplit) / batchSize) *trainEpochs;
    let valAcc;
    


    await this.model.fit(valic.xs, valic.labels, {
      batchSize,
      validationSplit,
      epochs: trainEpochs,
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          trainBatchCount++;
          this.ui.logStatus(
              `Training... (` +
              `${(trainBatchCount / totalNumBatches * 100).toFixed(1)}%` +
              ` complete). To stop training, refresh or close page.`);
          await tf.nextFrame();
        },
        onEpochEnd: async (epoch, logs) => {
          valAcc = logs.val_acc;
          await tf.nextFrame();
        }
      }
    });

    // const saveResults = await this.model.save('indexeddb://my-model-1');
    
  }

  async predict(imageData: ImageData) {

    const pred = await tf.tidy(() => {

      // Convert the canvas pixels to 
      let img = tf.fromPixels(imageData, 1);
      img = img.reshape([1, 28, 28, 1]);
      img = tf.cast(img, 'float32');

      // Make and format the predications
      const output = this.model.predict(img) as any;

      // Save predictions on the component
      this.predictions = Array.from(output.dataSync()); 
    });

  }

}

