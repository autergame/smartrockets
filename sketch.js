var crashed = 0;
var finished = 0;
var generation = 0;

var genNumbers = 0;

var countIndex = 0;
var countFinish = true;
var lifespan = 1000;

var target;
var targetSize = 32;

var maxforce = 0.2;

var mutationRate = 0.01;
var mutationRateHistory = [0, mutationRate];

var maxFitnessHistory = [0];
var minFitnessHistory = [0];

var rocketSize = 16;
var lineSize = rocketSize * 1.25;

var population;
var populationSize = 100;

var rx = 0;
var ry = 0;
var rw = 0;
var rh = 0;

var speedSlider;
var maxSpeedSlider = 100;

var graphMutationRate;
var graphMaxFitness;
var graphMinFitness;
var graphSize = 100;

function setup()
{
	createCanvas(windowWidth, windowHeight);

	population = new Population();

	target = createVector(width / 2, height / 5);

	rx = width / 2 - width / 5;
	ry = height / 2;
	rw = width / 2.5;
	rh = height / 50;

	var graphSizeX = width / 4;
	var graphSizeY = height / 3;

	graphMutationRate = createGraph(width - graphSizeX, height - graphSizeY,
		graphSizeX, graphSizeY, 'Mutation rate', 'line', 'green');
	graphMaxFitness = createGraph(width - graphSizeX, height - graphSizeY * 3,
		graphSizeX, graphSizeY, 'Maximum Fitness', 'line', 'blue');
	graphMinFitness = createGraph(width - graphSizeX, height - graphSizeY * 2,
		graphSizeX, graphSizeY, 'Minimum Fitness', 'line', 'cyan');

	speedSlider = createSlider(1, maxSpeedSlider, 1);
}

function draw()
{
	background(16);

	var speed = speedSlider.value();

	for (var i = 0; i < speed && countIndex < lifespan; i++)
	{
		population.run(speed, countIndex);
		countIndex++;
	}

	if (countIndex == lifespan && countFinish) {
		countIndex -= speed;
		countFinish = false;
	}

	if (countIndex == lifespan || !population.allRocketsAlive) {
		population.evaluate();
		population.selection();

		countFinish = true;
		countIndex = 0;
		crashCount = 0;
		generation++;

		//if (generation % pow(10, genNumbers) == 0) {
		//    genNumbers = floor(Math.log10(generation) + 1);
		//if (generation % 10 == 0) {

			mutationRateHistory.push(mutationRate);
			maxFitnessHistory.push(population.maxFitness);
			minFitnessHistory.push(population.minFitness);
		//}
	}

	fill(255);
	rect(rx, ry, rw, rh);

	ellipse(target.x, target.y, targetSize, targetSize);

	if (mutationRateHistory.length > graphSize) {
		mutationRateHistory.splice(0, 1);
	}
	if (maxFitnessHistory.length > graphSize) {
		maxFitnessHistory.splice(0, 1);
	}
	if (minFitnessHistory.length > graphSize) {
		minFitnessHistory.splice(0, 1);
	}

	graphMutationRate.reset();
	graphMaxFitness.reset();
	graphMinFitness.reset();
	for (var i = 0; i < mutationRateHistory.length; i++)
	{
		graphMutationRate.add(i, mutationRateHistory[i]);
	}
	for (var i = 0; i < maxFitnessHistory.length; i++)
	{
		graphMaxFitness.add(i, maxFitnessHistory[i]);
	}
	for (var i = 0; i < minFitnessHistory.length; i++)
	{
		graphMinFitness.add(i, minFitnessHistory[i]);
	}
	graphMutationRate.draw();
	graphMaxFitness.draw();
	graphMinFitness.draw();

	fill(255);
	noStroke();

	var textSizeFont = width / 110 + height / 60;

	push();
	translate(0, height - textSizeFont * 12);
	textSize(textSizeFont);
	textLeading(textSizeFont);
	var textAllSliders =
				'Speed: ' + speed;
	text(textAllSliders, 10, 0);
	pop();

	speedSlider.position(10, height - textSizeFont * 11.6);
	speedSlider.style('width', textSizeFont * 8 + 'px');

	push();
	translate(0, height - textSizeFont * 8.4);
	textSize(textSizeFont);
	textLeading(textSizeFont);
	var textAll =
				'Crashed: ' + crashed + '\n' +
				'Finished: ' + finished + '\n' +
				'Generation: ' + generation + '\n' +
				'Lifespan: ' + countIndex + '/' + lifespan + '\n' +
				'Maximum Distance: ' + population.maxDistance + '\n' +
				'Minimum Distance: ' + population.minDistance + '\n' +
				'Mutation Rate: ' + eToNumber(mutationRate.toFixed(15)) + '\n' +
				'Maximum Fitness: ' + eToNumber(population.maxFitness.toFixed(15)) + '\n' +
				'Minimum Fitness: ' + eToNumber(population.minFitness.toFixed(15)) + '\n';
	text(textAll, 10, 0);
	pop();

	textSize(18);
}

function eToNumber(num)
{
	var sign = '';
	(num += '').charAt(0) == '-' && (num = num.substring(1), sign = '-');
	var arr = num.split(/[e]/ig);
	if (arr.length < 2) return sign + num;
	var dot = (.1).toLocaleString().substr(1, 1), n = arr[0], exp = +arr[1],
		w = (n = n.replace(/^0+/, '')).replace(dot, ''),
		pos = n.split(dot)[1] ? n.indexOf(dot) + exp : w.length + exp,
		L   = pos - w.length, s = '' + BigInt(w);
		w   = exp >= 0 ? (L >= 0 ? s + '0'.repeat(L) : r()) : (pos <= 0 ? '0' + dot + '0'.repeat(Math.abs(pos)) + s : r());
	L = w.split(dot); if (L[0]==0 && L[1]==0 || (+w==0 && +s==0) ) w = 0;
	return sign + w;
	function r() {return w.replace(new RegExp(`^(.{${pos}})(.)`), `$1${dot}$2`)}
}