import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

import { MathService } from '../math.service';
import { MathRequest } from '../math.requests';

@Component({
  selector: 'calculator',
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.css'
})
export class CalculatorComponent {

  isTrigonometric = false;
  isLoading = false;
  showHelp = false;
  isDoneLoading = false;
  progressPercent = 'width: 0%';
  progressValue = 0;

  mathFunctions = {
    derivative: '',
    xIntercept: '',
    yIntercept: '',
    plot: '',
    amplitude: '',
    periodicy: ''
  }

  mathForm = new FormGroup({
    mathFunction: new FormControl('')
  });

  constructor(private mathService: MathService, private cdr: ChangeDetectorRef) {}


  toggleSyntax() {
    if (this.showHelp === false) {
      this.showHelp = true;
    } else {
      this.showHelp = false;
    }
    this.cdr.detectChanges();
  }


  fetchDerivative(mathString: string): void {
    this.mathService.getMathResult(mathString, MathRequest.Derivative)
      .subscribe(derivative => {
        this.mathFunctions.derivative = this.mathService.decodeMathFunction(derivative);
        this.addProgress(10);
      });
  }

  fetchXIntercept(mathString: string): void {
    this.mathService.getMathResult(mathString, MathRequest.XIntercept)
      .subscribe(xIntercept =>{
        this.mathFunctions.xIntercept = this.mathService.decodeMathFunction(xIntercept);
        this.addProgress(10);
      });
  }

  fetchYIntercept(mathString: string): void {
    this.mathService.getMathResult(mathString, MathRequest.YIntercept)
      .subscribe(yIntercept => {
        this.mathFunctions.yIntercept = this.mathService.decodeMathFunction(yIntercept);
        this.addProgress(10);
      });
  }

  fetchPlot(mathString: string): void {
    this.mathService.getMathPlot(mathString, MathRequest.Plot)
      .subscribe(plot => {
        this.mathFunctions.plot = URL.createObjectURL(plot);
        this.addProgress(30);
      })
  }

  fetchAmplitude(mathString: string): void {
    this.mathService.getMathResult(mathString, MathRequest.Amplitude)
     .subscribe(amplitude => {
      this.mathFunctions.amplitude = this.mathService.decodeMathFunction(amplitude);
      if (amplitude === ' ') {
        //console.log("periodicy is empty");
        this.isTrigonometric = false;
      } else {
        this.isTrigonometric = true;
      }
      //this.cdr.detectChanges();
      this.addProgress(20);
     });
     
  }

  fetchPeriodicy(mathString: string): void {
    this.mathService.getMathResult(mathString, MathRequest.Periodicy)
      .subscribe(periodicy => {
        if (periodicy === 'pi') {
          this.mathFunctions.periodicy = 'π';
        } else {
          this.mathFunctions.periodicy = this.mathService.decodeMathFunction(periodicy);
          if (periodicy === ' ') {
            //console.log("periodicy is empty");
            this.isTrigonometric = false;
          } else {
            this.isTrigonometric = true;
          }
          //console.log(`periodicy: '${periodicy}'`);
          //this.cdr.detectChanges();
          this.addProgress(20);
        }
      })
  }

  addProgress(progress: number): void {
    this.progressValue = this.progressValue + progress;
    this.progressPercent = `width: ${this.progressValue}%`;
    if (this.progressValue >= 100) {
      this.isLoading = false;
      this.isDoneLoading = true;
    } else {
      this.isLoading = true;
    }
    this.cdr.detectChanges();
  }

  onSubmit() {
    this.progressValue = 0;
    this.isDoneLoading = false;
    this.isTrigonometric = false;
    this.cdr.detectChanges();
    const userInput = this.mathForm.get('mathFunction')?.getRawValue();
    //this.currentMathFunction = userInput;
    //console.log(`Submitted: ${this.currentMathFunction}`);
    this.fetchDerivative(userInput);
    this.fetchXIntercept(userInput);
    this.fetchYIntercept(userInput);
    this.fetchPlot(userInput);
    this.fetchAmplitude(userInput);
    this.fetchPeriodicy(userInput);
    //console.log(`is trigonometric ${this.isTrigonometric}`);
  }
}
