const populationSize = 100;

let canvas = [];
let ctx = []; //canvas.getContext("2d");

const cell = 4;
const speed = 0.1;
const countdownDefault = 100;
//const selectionPercent = 0.1;

const inputSize = 16 + 1;
const hiddenSize = 10 + 1;
const outputSize = 4;
const mutationChance = 0.02;

const upVector = {x: 0, y: -1};
const upRightVector = {x: 1, y: -1};
const rightVector = {x: 1, y: 0};
const downRightVector = {x: 1, y: 1};
const downVector = {x: 0, y: 1};
const downLeftVector = {x: -1, y: 1};
const leftVector = {x: -1, y: 0};
const upLeftVector = {x: -1, y: -1};
const vectors = [upVector, upRightVector, rightVector, downRightVector, downVector, downLeftVector, leftVector, upLeftVector];

const possibleDir = ["up", "right", "left", "down"]

let aliveSnakesCount = populationSize;

let generation = 1;

let highScore = 0;

for(let i = 0; i < populationSize; i++){
  document.write("<canvas id=" + i + " width=" + (21 * cell) + " height=" + (21 * cell) + "></canvas>|");
  canvas[i] = document.getElementById(i);
  ctx[i] = canvas[i].getContext("2d");
}


//=====================================================================================================================

let score = [];
let canMove = [];
let isDead = [];
let time = [];
let countdown = [];
let food = [];

let inputLayer = [];
let hiddenLayer = [];
let outputLayer = [];

let inputWeightMatrix = [];
let outputWeightMatrix = [];
outputWeightMatrix[0] = [];

let newInputWeightMatrix = [];
let newOutputWeightMatrix = [];

let snake = [];

let dir = [];

for(let i = 0; i < populationSize; i++){
  score[i] = 0;
  canMove[i] = true;
  isDead[i] = false;
  time[i] = 0;
  countdown[i] = countdownDefault;
  food[i] = {
    x: Math.floor(Math.random() * 20) * cell,
    y: Math.floor(Math.random() * 20) * cell,
  };

  inputLayer[i] = [];
  hiddenLayer[i] = [];
  outputLayer[i] = [];

  inputWeightMatrix[i] = [];
  outputWeightMatrix[i] = [];
  outputWeightMatrix[i][0] = [];

  snake[i] = [];
  snake[i][0] = {
    x: 10 * cell,
    y: 10 * cell,
  }

  dir[i] = "up";
}

function fillWeightMatrix(matrix, width, height){
  for(let i = 0; i < height; i++)
  {
    matrix[i] = [];
    for(let j = 0; j < width; j++)
    {
      matrix[i][j] = Math.random() * 2 - 1;
    }
  }
}

function printMatrixToDocument(matrix){
  document.write('Matrix===============================================================<br>');
  for(let i = 0; i < matrix.length; i++)
  {
    for(let j = 0; j < matrix[i].length; j++)
    {
      document.write(matrix[i][j] + ' ');
    }
    document.write('<br>');
  }
}

function printVectorToDocument(vector){
  document.write('Vector===============================================================<br>');
  for(let i = 0; i < vector.length; i++)
  {
    document.write(vector[i] + ' ');
  }
  document.write('<br>');
}

function activation(x){
  //ReLu

  if(x < 0){
    return 0;
  } else {
    return x;
  }

  //LReLu
  /*
  if(x < 0){
    return x*0.01;
  } else {
    return x;
  }*/
  //return x;
}

function multiplyWeightByLayer(matrix, vector){
  let result = [];
  let sum;
  for(let i = 0; i < matrix.length; i++){
    sum = 0;
    for(let j = 0; j < matrix[0].length; j++)
    {
        sum = sum + vector[j] * matrix[i][j];
    }
    result[i] = activation(sum);
  }
  return result;
}

function inversion(distance){
  if(distance == 0){
    return 0;
  } else {
    return 1 / distance;
  }
}

function fillInputLayer(index){
  inputLayer[index] = [];
  for(let i = 0; i < 8; i++)
  {
    inputLayer[index][i] = inversion(findDistanceToSnake(vectors[i], index));
    inputLayer[index][i + 8] = inversion(findDistanceToFood(vectors[i], index));
  }
  inputLayer[index].push(1);


}

function findDistanceToSnake(vector, index){
  let xShift;
  let yShift;
  for(let i = 1; i < 22; i++)
  {
    xShift = i;
    yShift = i;
    if(snake[index][0].x / cell + i > 20 && vector.x > 0 ||  snake[index][0].x / cell - i < 0 && vector.x < 0) xShift =  i - 21;
    if(snake[index][0].y / cell + i > 20 && vector.y > 0 ||  snake[index][0].y / cell - i < 0 && vector.y < 0) yShift =  i - 21;
    for(let j = 0; j < snake[index].length; j++){
      if((snake[index][0].x / cell + vector.x * xShift) * cell == snake[index][j].x && (snake[index][0].y / cell + vector.y * yShift) * cell == snake[index][j].y)
      {
        return i;
      }
    }
  }
  return "error";
}

function findDistanceToFood(vector, index){
  let xShift;
  let yShift;
  for(let i = 1; i < 22; i++)
  {
    xShift = i;
    yShift = i;
    if(snake[index][0].x / cell + i > 20 && vector.x > 0 ||  snake[index][0].x / cell - i < 0 && vector.x < 0) xShift =  i - 21;
    if(snake[index][0].y / cell + i > 20 && vector.y > 0 ||  snake[index][0].y / cell - i < 0 && vector.y < 0) yShift =  i - 21;
    if((snake[index][0].x / cell + vector.x * xShift) * cell == food[index].x && (snake[index][0].y / cell + vector.y * yShift) * cell == food[index].y)
    {
      return i;
    }
  }
  return 0;
}

function spawnFood(index){
  food[index] = {
    x: Math.floor(Math.random() * 20) * cell,
    y: Math.floor(Math.random() * 20) * cell,
  };

  for(let i = 0; i < snake[index].length; i++)
  {
    if(food[index].x == snake[index][i].x && food[index].y == snake[index][i].y) spawnFood(index);
  }
}

function direction(index) {
  let previousDir = dir[index];
  if(canMove[index]){
    canMove[index] = false;
    let max = 0;
    for(let i = 0; i < outputLayer[index].length; i++){
      if(outputLayer[index][i] > max){
        max = outputLayer[index][i];
        dir[index] = possibleDir[i];
      }
    }

    if(previousDir == "up" && dir[index] == "down") dir[index] = "up";
    if(previousDir == "down" && dir[index] == "up") dir[index] = "down";
    if(previousDir == "left" && dir[index] == "right") dir[index] = "left";
    if(previousDir == "right" && dir[index] == "left") dir[index] = "right";
/*
    if(event.keyCode == 37 && dir != "right")
      dir = "left";
    if(event.keyCode == 38 && dir != "down")
      dir = "up";
    if(event.keyCode == 39 && dir != "left")
      dir = "right";
    if(event.keyCode == 40 && dir != "up")
      dir = "down";
    */
  }
}

function randomizeNewMatrix(index){
  newInputWeightMatrix[index] = [];
  for(let i = 0; i < inputWeightMatrix[0].length; i++){
    newInputWeightMatrix[index][i] = [];
    for(let j = 0; j < inputWeightMatrix[0][0].length; j++){
      newInputWeightMatrix[index][i][j] =  Math.random() * 2 - 1;
    }
  }

  newOutputWeightMatrix[index] = [];
  for(let i = 0; i < outputWeightMatrix[0].length; i++){
    newOutputWeightMatrix[index][i] = [];
    for(let j = 0; j < outputWeightMatrix[0][0].length; j++){
        newOutputWeightMatrix[index][i][j] =  Math.random() * 2 - 1;
    }
  }
}

function fitness(index){
  return time[index] * time[index] * (Math.pow(2, score[index]));
}

function selection(fitnessSum){
/*
    let best = [];
    for(let k = 0; k < Math.floor(populationSize * selectionPercent); k++){
      let max = 0;
      let bestID = 0;
      if(best.length < 1){
        for(let i = 0; i < populationSize; i++){
          if(max < fitness(i)){
            max =  fitness(i);
            bestID = i;
          }
        }
        best[0] = bestID;
      } else {
        //for(let i = 0; i < best.length; i++){
          for(let j = 0; j < populationSize; j++){
            if(max < fitness(j) && best.every(elem => elem != j)){
              max = fitness(j);
              bestID = j;
            }
          }
        //}
        best[k] = bestID;
      }
    }
    return best[Math.floor(Math.random() * (best.length - 1))];

*/

  let random = Math.random() * fitnessSum;
  let sum = 0;
  for(let i = 0; i < populationSize; i++)
  {
    sum += fitness(i);
    if(sum > random){
      return i;
    }
  }
  return populationSize - 1;

}

function recombination(fitnessSum, index){

  let father = selection(fitnessSum);
  let mother = selection(fitnessSum);

  newInputWeightMatrix[index] = [];
  for(let i = 0; i < inputWeightMatrix[0].length; i++){
    //let random = Math.floor(Math.random() * inputWeightMatrix[0][0].length);
    newInputWeightMatrix[index][i] = [];
    for(let j = 0; j < inputWeightMatrix[0][0].length; j++){
      let mutation = Math.random();
      if(mutation <= mutationChance)
      {
          newInputWeightMatrix[index][i][j] =  Math.random() * 2 - 1;
      }else {
        //if(j < random){
        let random = Math.random();
        if(random < 0.5){
          newInputWeightMatrix[index][i][j] = inputWeightMatrix[father][i][j];
        }else {
          newInputWeightMatrix[index][i][j] = inputWeightMatrix[mother][i][j];
        }
      }
    }
    //document.write('father: ' + father + ' mother: ' + mother + "<br>")
  }

  newOutputWeightMatrix[index] = [];
  for(let i = 0; i < outputWeightMatrix[0].length; i++){
    //let random = Math.floor(Math.random() * outputWeightMatrix[0][0].length);
    newOutputWeightMatrix[index][i] = [];
    for(let j = 0; j < outputWeightMatrix[0][0].length; j++)
    {
      let mutation = Math.random();
      if(mutation <= mutationChance)
      {
          newOutputWeightMatrix[index][i][j] =  Math.random() * 2 - 1;
      }else{
        //if(j < random){
        let random = Math.random()
        if(random < 0.5){
          newOutputWeightMatrix[index][i][j] = outputWeightMatrix[father][i][j];
        }else {
          newOutputWeightMatrix[index][i][j] = outputWeightMatrix[mother][i][j];
        }
      }
    }
  }
}

function newGeneration(){
  let fitnessSum = 0;
  for(let i = 0; i < populationSize; i++)
  {
    fitnessSum += fitness(i);
    //document.write('' + time[i] + ' ' + score[i] + ' ' + fitness(i) + "<br>")
  }

  for(let i = 0; i < populationSize; i++)
  {
    recombination(fitnessSum, i);
  }
/*
  for(let i = populationSize - Math.floor(populationSize * 0.2); i < populationSize; i++)
  {
    randomizeNewMatrix(i);
  }
*/
  for(let i = 0; i < populationSize; i++){
    //printMatrixToDocument(inputWeightMatrix[i]);
    //printMatrixToDocument(newInputWeightMatrix[i]);
    //document.write(fitness(i) + " ");
    inputWeightMatrix[i] = newInputWeightMatrix[i];
    outputWeightMatrix[i] = newOutputWeightMatrix[i];
  }

}

function eventTick(){
  let maxScore = 0;
  for(let i = 0; i < populationSize; i++)
  {
    if(!isDead[i]){
      let headX = snake[i][0].x;
      let headY = snake[i][0].y;

      if(headX == food[i].x && headY == food[i].y)
      {
        score[i]++;
        spawnFood(i);
        countdown[i] += countdownDefault;
      } else {
        snake[i].pop();
      }


      direction(i);

      if(dir[i] == "left") headX -= cell;
      if(dir[i] == "right") headX += cell;
      if(dir[i] == "up") headY -= cell;
      if(dir[i] == "down") headY += cell;

      let newHead = {
        x: headX,
        y: headY,
      };

      snake[i].unshift(newHead);

      ctx[i].fillStyle = "green";
      ctx[i].fillRect(0, 0, 21 * cell, 21 * cell);

      ctx[i].fillStyle = "red";
      ctx[i].fillRect(food[i].x, food[i].y, cell, cell) ;

      for(let j = 1; j < snake[i].length; j++)
      {

        if(j%2 == 0) ctx[i].fillStyle = "MediumBlue";
        else ctx[i].fillStyle = "blue";
        ctx[i].fillRect(snake[i][j].x, snake[i][j].y, cell, cell);
        if(headX == snake[i][j].x && headY == snake[i][j].y) gameOver(i);
      }

      ctx[i].fillStyle = "Navy";
      ctx[i].fillRect(snake[i][0].x, snake[i][0].y, cell, cell) ;

      ctx[i].fillStyle = "white";
      ctx[i].font = "32px Arial";
      ctx[i].fillText(" " + score[i], cell, 10 *cell);
/*
      ctx[i].fillText("Time: " + time[i].toFixed(1), cell, 4 *cell);
      ctx[i].fillText("Countdown: " + countdown[i].toFixed(1), cell, 6 *cell);
      ctx[i].fillText("generation: " + generation, cell, 8 *cell);
      ctx[i].fillText("input: " + inputLayer[i], cell, cell);
*/
      fillInputLayer(i);

      //document.write("" + inputLayer[i]);

      hiddenLayer[i] = multiplyWeightByLayer(inputWeightMatrix[i], inputLayer[i]);
      hiddenLayer[i].push(1);
      outputLayer[i] = multiplyWeightByLayer(outputWeightMatrix[i], hiddenLayer[i]);

      time[i] += 1 /*/ (1000 / speed)*/;
      countdown[i] -= 1 /*/ (1000 / speed)*/;

      canMove[i] = true;

      if (countdown[i] <= 0) {
        gameOver(i);
      }
      if(headX < 0 || headX > 20 * cell || headY < 0 || headY > 20 * cell) gameOver(i);
    }
    if(score[i] >= maxScore){
      maxScore = score[i];
      document.getElementById("bestFitness").innerHTML = " " + fitness(i);
      if(maxScore > highScore)
      {
        highScore = maxScore
      }
    }

    document.getElementById("genValue").innerHTML = " " + generation;
    document.getElementById("maxScore").innerHTML = " " + maxScore;
    document.getElementById("highScore").innerHTML = " " + highScore;
  }
}

function gameOver(index){
  aliveSnakesCount--;
  isDead[index] = true;

  if(aliveSnakesCount <= 0){
    generation++;
    aliveSnakesCount = populationSize;
    newGeneration();
    for(let i = 0; i < populationSize; i++){
      snake[i] = [];
      snake[i][0] = {
        x: 10 * cell,
        y: 10 * cell,
      }
      time[i] = 0;
      score[i] = 0;
      countdown[i] = countdownDefault;
      isDead[i] = false;

      spawnFood(i);
    }
  }
}


for(let i = 0; i < populationSize; i++){
  fillWeightMatrix(inputWeightMatrix[i], inputSize, hiddenSize - 1);
  fillWeightMatrix(outputWeightMatrix[i], hiddenSize, outputSize);
}

let game = setInterval(eventTick, speed)
