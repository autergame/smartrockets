function Rocket(dna, index)
{
	this.pos = createVector(width / 2, height-25);
	this.vel = createVector();
	this.acc = createVector();

	this.angle = 0;
	this.distance = 0;
	this.rocketHead = createVector();

	this.crashed = false;
	this.completed = false;

	this.fitness = 0;
	this.theBest = false;

	this.index = index;

	if (dna) {
		this.dna = dna;
	}
	else {
		this.dna = new DNA();
	}

	this.update = function(geneindex)
	{
		if (!this.completed && !this.crashed) {
			this.angle = lerpAngle(this.angle, this.vel.heading(), 0.2);

			this.rocketHead.x = this.pos.x + cos(this.angle) * lineSize;
			this.rocketHead.y = this.pos.y + sin(this.angle) * lineSize;

			this.distance = dist(this.rocketHead.x, this.rocketHead.y, target.x, target.y);

			if (this.distance <= targetSize/2) {
				this.completed = true;
				mutationRate -= 0.00001;
				finished++;
			}
			else {
				if (this.rocketHead.x < 0 || this.rocketHead.x > width ||
					this.rocketHead.y < 0 || this.rocketHead.y > height){
					this.crashed = true;
				}

				if (this.rocketHead.x > rx && this.rocketHead.x < rx + rw &&
					this.rocketHead.y > ry && this.rocketHead.y < ry + rh) {
					this.crashed = true;
				}

				if (this.crashed) {
					mutationRate += 0.000001;
					crashed++;
				}
			}

			this.acc.add(this.dna.genes[geneindex]);

			this.vel.add(this.acc);
			this.pos.add(this.vel);
			this.acc.mult(0);
			this.vel.limit(6);
		}
	}

	this.show = function(minDistance, maxDistance)
	{
		push();
		noStroke();

		if (this.crashed) {
			fill(255, 0, 0);
		}
		else if (this.completed) {
			fill(0, 255, 0);
		}
		else {
			fill(0, 0, 255);
		}

		beginShape();
		for (let i = 0; i < 3; ++i)
		{
			var theta = this.angle + i * TWO_PI / 3;
			vertex(this.pos.x + cos(theta) * rocketSize,
				   this.pos.y + sin(theta) * rocketSize);
		}
		endShape(CLOSE);
		pop();

		strokeWeight(2);
		stroke(color(255, 0, 255));
		line(this.pos.x, this.pos.y, this.rocketHead.x, this.rocketHead.y);

		noStroke();

		if (this.theBest) {
			colorMode(HSB);
			strokeWeight(1);
			var hue = map(this.distance, maxDistance, minDistance, 0, 360);
			var satbright = map(this.distance, maxDistance, minDistance, 0, 100);
			stroke(color(hue, satbright, satbright));
			line(this.rocketHead.x, this.rocketHead.y, target.x, target.y);
			colorMode(RGB);

			noStroke();

			push();
			rotate(0);
			textSize(16);
			textAlign(CENTER, CENTER);
			text('' + this.index, this.pos.x, this.pos.y);
			textSize(18);
			pop();

			push();
			translate((this.rocketHead.x + target.x) / 2, (this.rocketHead.y + target.y) / 2);
			//rotate(atan2(target.y - this.rocketHead.y,  target.x - this.rocketHead.x));
			textAlign(CENTER, CENTER);
			text('' + floor(this.distance), 0, 0);
			//text('' + floor(this.distance), 0, -5);
			pop();
		}
	}
}

function lerpAngle(a, b, step)
{
	const delta = b - a;
	if (delta == 0.0) {
		return a;
	}
	else if (delta < -PI) {
		b += TWO_PI;
	}
	else if (delta > PI) {
		a += TWO_PI;
	}
	return (1.0 - step) * a + step * b;
}