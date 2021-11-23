import { Component } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { filter, first, map, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  description = '';
  public dataStream = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public emittedValues: number[] = [];

  private observable$!: Observable<number>;

  private filter$!: Observable<number>;
  private distinctUntilChanged$!: Observable<number>;
  private debounceTime$!: Observable<number>;
  private throttleTime$!: Observable<number>;
  private first$!: Observable<number>;
  private take$!: Observable<number>;
  private takeUntil$!: Observable<number>;
  private tap$!: Observable<number>;

  private setupExecution(description: string): void {
    this.reset();
    this.description = description;
    this.observable$ = from(this.dataStream);
  }

  public useFilter(): void {
    this.setupExecution('(using the filter operator - only the even numbers will be emitted):');
    this.observable$.pipe(filter((value: number) => value % 2 === 0)).subscribe((value: number) => this.emittedValues.push(value));
  }

  public useDistinctUntilChanged(): void {
    
  }

  public useDebounceTime(): void {

  }

  public useThrottleTime(): void {

  }

  public useFirst(): void {
    this.setupExecution('(using the first operator - only the first number will be emitted):');
    this.observable$.pipe(first()).subscribe((value: number) => this.emittedValues.push(value));
  }

  public useTake(): void {
    this.setupExecution('(using the take operator - only the first four number will be emitted):');
    this.observable$.pipe(take(4)).subscribe((value: number) => this.emittedValues.push(value));
  }

  public useTakeUntil(): void {

  }

  public useTap(): void {
    this.setupExecution('(using the tap operator - every number will be emitted, but they will be also logged):');
    this.observable$.pipe(tap((value: number) => console.log(value))).subscribe((value: number) => this.emittedValues.push(value));
  }

  public reset(): void {
    this.emittedValues = [];
    this.description = '';
  }

  public useFilter2(): void {
    this.setupExecution('(using the filter operator - only the even numbers will be emitted):');
    this.observable$.pipe(filter((value: number) => value % 2 === 0)).subscribe((value: number) => this.emittedValues.push(value));

    // const values = filter((value: number) => value % 2 === 0);
    // values(this.observable$);

    // this.observable$.pipe(filter((value: number) => value % 2 === 0)).subscribe({
    //   next: (value: number) => this.emittedValues.push(value),
    //   complete: () => this.emittedValues.push(200)
    // });
  }

  private executeObservables() {
    //Converts the arguments to an observable sequence.
    const nums = of(1, 2, 3);

    const squareValues = map((val: number) => val * val);
    const squaredNums = squareValues(nums);
    
    squaredNums.subscribe(x => console.log(x));
  }

  public demo(): void {
    const customIntervalObservable = new Observable(observer => {
      let count = 0;
      setInterval(() => { 
        console.log(count);
        observer.next(count);
        count++;
      }, 1000);
    });

    customIntervalObservable.subscribe((count) => {
      this.emittedValues.push(count as number);
    });
  }
}
