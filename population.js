function Population()
{
	this.rockets = [];

	this.allRocketsAlive = false;

	this.maxFitness = 0;
	this.minFitness = 0;

	this.maxDistance = 0;
	this.minDistance = 0;

	for (var i = 0; i < populationSize; i++)
	{
		this.rockets[i] = new Rocket(null, i);
	}

	this.evaluate = function()
	{
		this.maxDistance = -Infinity;
		this.minDistance = Infinity;

		for (var i = 0; i < populationSize; i++)
		{
			var distace = this.rockets[i].distance;
			if (distace > this.maxDistance) {
				this.maxDistance = distace;
			}
			if (distace < this.minDistance) {
				this.minDistance = distace;
			}
		}

		this.maxDistance = floor(this.maxDistance);
		this.minDistance = floor(this.minDistance);

		for (var i = 0; i < populationSize; i++)
		{
			var rocket = this.rockets[i];
			this.rockets[i].fitness = map(rocket.distance,
				this.minDistance-1, this.maxDistance+1, 1, 0);
			if (rocket.completed) {
				this.rockets[i].fitness *= 10;
			}
			else if (rocket.crashed) {
				this.rockets[i].fitness *= 0.01;
			}
		}

		this.maxFitness = -Infinity;
		this.minFitness = Infinity;

		for (var i = 0; i < populationSize; i++)
		{
			var fitness = this.rockets[i].fitness;
			if (fitness > this.maxFitness) {
				this.maxFitness = fitness;
			}
			if (fitness < this.minFitness) {
				this.minFitness = fitness;
			}
		}

		for (var i = 0; i < populationSize; i++)
		{
			this.rockets[i].fitness = map(this.rockets[i].fitness,
				this.minFitness, this.maxFitness, 0, 1);
		}
	}

	this.selection = function()
	{
		var newRockets = [];
		for (var i = 0; i < populationSize; i++)
		{
			var partnerA = this.choosePartner();
			var partnerB = this.choosePartner();

			var child = partnerA.crossover(partnerB);
			child.mutation();

			newRockets[i] = new Rocket(child, i);
		}
		this.rockets = newRockets;
	}

	this.choosePartner = function()
	{
		var sumFitness = 0;
		for (var i = 0; i < populationSize; i++)
		{
			sumFitness += this.rockets[i].fitness;
		}
		var rand = random(sumFitness);
		for(var i = 0; i < populationSize; i++)
		{
			var rocket = this.rockets[i];
			rand -= rocket.fitness;
			if (rand <= 0) {
				return rocket.dna;
			}
		}
		var index = floor(random(populationSize));
		return this.rockets[index].dna;

		// var s = 0;
		// var num = random();
		// for(var i = 0; i < populationSize; i++)
		// {
		//     var rocket = this.rockets[i];
		//     s += rocket.fitness;
		//     if(num < s) {
		//         return rocket.dna;
		//     }
		// }
		// var index = floor(random(populationSize));
		// return this.rockets[index].dna;

		// var cumulativeWeights = [];
		// for (var i = 0; i < populationSize; i++)
		// {
		//     cumulativeWeights[i] = this.rockets[i].fitness + (cumulativeWeights[i - 1] || 0);
		// }
		// var maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
		// var randomNumber = maxCumulativeWeight * random();
		// for (var i = 0; i < populationSize; i++)
		// {
		//     if (cumulativeWeights[i] >= randomNumber) {
		//         return this.rockets[i].dna;
		//     }
		// }

		// var index = floor(random(populationSize));
		// return this.rockets[index].dna;
		// var r = random(this.maxFitness);
		// for(var i = 0; i < populationSize; i++)
		// {
		//     var partner = this.rockets[i].dna;
		//     var weight = partner.fitness;
		//     if(r < weight) {
		//         return partner;
		//     }
		//     else {
		//         r -= weight;
		//     }
		// }
		// var index = floor(random(populationSize));
		// return this.rockets[index].dna;

		// var besafe = 0;
		// while(true)
		// {
		//     var index = floor(random(populationSize));
		//     var partner = this.rockets[index].dna;
		//     var r = random(this.maxFitness);
		//     if (r < partner.fitness) {
		//         return partner;
		//
		//     besafe++;
		//     if (besafe > populationSize) {
		//         return partner;
		//     }
		// }
	}

	this.run = function(speed, geneindex)
	{
		for (var i = 0; i < populationSize; i++)
		{
			this.rockets[i].update(geneindex);
		}

		this.allRocketsAlive = false;
		for (var i = 0; i < populationSize; i++)
		{
			if (!this.rockets[i].crashed && !this.rockets[i].completed) {
				this.allRocketsAlive = true;
				break;
			}
		}

		var closestRockets = [];

		for (var i = 0; i < populationSize; i++)
		{
			var rocket = this.rockets[i];
			this.rockets[i].theBest = false;
			if (!rocket.crashed && !rocket.completed) {
				closestRockets.push({rocket, i});
			}
		}

		closestRockets = closestRockets.sort(function (a, b) {
			return a.rocket.distance - b.rocket.distance;
		});

		closestRockets = closestRockets.slice(0, populationSize * 0.10);

		for (var i = 0; i < closestRockets.length; i++)
		{
			this.rockets[closestRockets[i].i].theBest = true;
		}

		if (geneindex % speed == 0) {
			for (var i = 0; i < populationSize; i++)
			{
				this.rockets[i].show(this.minDistance, this.maxDistance);
			}
		}
	}
}