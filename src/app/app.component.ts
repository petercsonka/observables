import { Component } from '@angular/core';
import { from, fromEvent, interval, Observable, Subscription } from 'rxjs';
import { filter, first, take, tap, takeUntil, debounceTime, throttleTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public dataStream = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public emittedValues: any[] = [];
  public clickCounts = 0;
  public description = '';
  public hideDataStream = true;
  public hideClickCounts = true;
  public hideDescription = true;

  private observable$!: Observable<number>;
  private subscription!: Subscription;

  //Filtering operators
  public useFilter(): void {
    this.setupExecution('(using the filter operator - only the even numbers will be emitted):');
    this.observable$.pipe(filter((value: number) => value % 2 === 0)).subscribe((value: number) => this.emittedValues.push(value));
  }
  public useFirst(): void {
    this.setupExecution('(using the first operator - only the first number will be emitted):');
    this.observable$.pipe(first()).subscribe((value: number) => this.emittedValues.push(value));
  }

  public useDistinctUntilChanged(): void {
    this.setupExecution('(using the distinctUntilChanged operator - emits value only when the current value is different than the last one):');
    this.dataStream = [10, 2, 2, 4, 2, 6, 8, 8, 8, 10];
    this.observable$.pipe(distinctUntilChanged()).subscribe((value: number) => this.emittedValues.push(value));
  }

  public useTake(): void {
    this.setupExecution('(using the take operator - only the first four numbers will be emitted):');
    this.observable$.pipe(take(4)).subscribe((value: number) => this.emittedValues.push(value));
  }

  public useTakeUntil(): void {
    this.reset();
    this.setDescription('(using the takeUntil operator - values will be emitted until the first double click):');
    this.setElementVisibility(true, false, true);
    //const source = this.createIntervalObservable(1000, 0);
    const source$ = interval(1000);
    const clicks$ = fromEvent(document, 'dblclick');
    const result$ = source$.pipe(takeUntil(clicks$));
    this.subscription = result$.subscribe((value: number) => this.emittedValues.push(value));
  }

  public useDebounceTime(): void {
    this.reset();
    this.setDescription('(using the debounceTime operator - emits the latest value of the source after 2000 ms passed without other source emission (click event)):');
    this.setElementVisibility(true, false, false);
    const clicks = fromEvent(document, 'click');
    const result = clicks.pipe(tap((x) => this.clickCounts++), debounceTime(2000));
    this.subscription = result.subscribe(x => this.emittedValues.push(x.type));
  }

  public useThrottleTime(): void {
    this.reset();
    this.setDescription('(using the throttleTime operator - emits a value from the source, then ignores source values for 2000 ms, then repeats this process):');
    this.setElementVisibility(true, false, false);
    const clicks = fromEvent(document, 'click');
    const result = clicks.pipe(tap((x) => this.clickCounts++), throttleTime(2000));
    this.subscription = result.subscribe(x => this.emittedValues.push(x.type));
  }

  //Utility operators
  public useTap(): void {
    this.setupExecution('(using the tap operator - every number will be emitted, but they will be also logged to the console):');
    this.observable$.pipe(tap((value: number) => console.log(value))).subscribe((value: number) => this.emittedValues.push(value));
  }

  public reset(): void {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
    this.setElementVisibility(true, true, true);
    this.emittedValues = [];
    this.description = '';
    this.clickCounts = 0;
  }

  private setupExecution(description: string): void {
    this.reset();
    this.setDescription(description);
    this.setElementVisibility(false, false, true);
    this.dataStream = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    this.observable$ = from(this.dataStream);
  }

  private setDescription(description: string): void {
    this.description = description;
  }

  private setElementVisibility(hideDataStream: boolean, hideDescription: boolean, hideClickCounts: boolean) {
    this.hideDataStream = hideDataStream;
    this.hideDescription = hideDescription;
    this.hideClickCounts = hideClickCounts;
  }


  private createIntervalObservable(interval: number, emittedValue: number): Observable<number> {
    return new Observable<number>(observer => {
      setInterval(() => {
        console.log(emittedValue);
        observer.next(emittedValue);
      }, interval);
    });
  }
  private createIntervalObservable2(interval: number): Observable<number> {
    return new Observable<number>(observer => {
      let count = 0;
      setInterval(() => {
        console.log(count);
        observer.next(count);
        count++;
      }, 100);
    });
  }
}
