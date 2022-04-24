function DNA(genes)
{
	if (genes) {
		this.genes = genes;
	}
	else {
		this.genes = [];

		for (var i = 0; i < lifespan; i++)
		{
			this.genes[i] = p5.Vector.random2D();
			this.genes[i].setMag(maxforce);
		}
	}

	this.crossover = function(partner)
	{
		var newDNA = [];
		var midpoint = floor(random(this.genes.length));

		for (var i = 0; i < this.genes.length; i++)
		{
			if (i > midpoint) {
				newDNA[i] = this.genes[i];
			} else {
				newDNA[i] = partner.genes[i];
			}
		}

		var child = new DNA(newDNA);
		return child;
	}

	this.mutation = function()
	{
		for (var i = 0; i < this.genes.length; i++)
		{
			if (random(1) < mutationRate)  {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxforce);
			}
		}
	}
}