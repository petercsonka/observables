import { Component } from '@angular/core';
import { AsyncSubject, BehaviorSubject, from, fromEvent, interval, Observable, ReplaySubject, Subject, Subscription, connectable } from 'rxjs';
import { filter, first, take, tap, takeUntil, debounceTime, throttleTime, distinctUntilChanged, share } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public dataStream: any[] = [];
  public emittedValues: any[] = [];
  public clickCounts = 0;
  public description = '';
  public hideDataStream = true;
  public hideClickCounts = true;
  public hideDescription = true;

  private observable$!: Observable<number>;
  private subscription!: Subscription;

  private readonly defaultDataStream = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  private readonly unorderedDataStream = [10, 2, 2, 4, 2, 6, 8, 8, 8, 10];
  private readonly filterDescription = '(using the filter operator - only the even numbers will be emitted):';
  private readonly firstDescription = '(using the first operator - only the first number will be emitted):';
  private readonly distinctUntilChangedDescription = '(using the distinctUntilChanged operator - only emits the current value when it is different than the previous one):';
  private readonly takeDescription = '(using the take operator - only the first four numbers will be emitted):';
  private readonly takeUntilDescription = '(using the takeUntil operator - values will be emitted until the first double click):'
  private readonly debounceTimeDescription = '(using the debounceTime operator - emits the latest value of the source after 2000 ms passed without other source emission (click event)):'
  private readonly throttleTimeDescription = '(using the throttleTime operator - emits a value from the source, then ignores source values for 2000 ms, then repeats this process):';
  private readonly tapDescription = '(using the tap operator - every number will be emitted, but they will be also logged to the console):';

  private readonly observableDescription = '(using Observable - unicast execution):';
  private readonly subjectDescription = '(using Subject - multicast execution):';
  private readonly behaviorSubjectDescription = '(using BehaviorSubject):';
  private readonly replaySubjectDescription = '(using ReplaySubject - buffers the last 3 values for new subscribers):';
  private readonly asyncSubjectDescription = '(using AsyncSubject - emits only the last value to its observers, and only when the execution completes):';


  //Filtering operators
  public useFilter(): void {
    this.setupExecution(this.filterDescription, this.defaultDataStream);
    this.observable$.pipe(filter((value: number) => value % 2 === 0)).subscribe((value: number) => this.emittedValues.push(value));
  }
  public useFirst(): void {
    this.setupExecution(this.firstDescription, this.defaultDataStream);
    this.observable$.pipe(first()).subscribe((value: number) => this.emittedValues.push(value));
  }

  public useDistinctUntilChanged(): void {
    this.setupExecution(this.distinctUntilChangedDescription, this.unorderedDataStream);
    this.observable$.pipe(distinctUntilChanged()).subscribe((value: number) => this.emittedValues.push(value));
  }

  public useTake(): void {
    this.setupExecution(this.takeDescription, this.defaultDataStream);
    this.observable$.pipe(take(4)).subscribe((value: number) => this.emittedValues.push(value));
  }

  public useTakeUntil(): void {
    this.reset();
    this.setDescription(this.takeUntilDescription);
    this.setElementVisibility(true, false, true);
    //const source = this.createIntervalObservable(1000, 0);
    const source$ = interval(1000);
    const clicks$ = fromEvent(document, 'dblclick');
    const result$ = source$.pipe(takeUntil(clicks$));
    this.subscription = result$.subscribe((value: number) => this.emittedValues.push(value));
  }

  public useDebounceTime(): void {
    this.reset();
    this.setDescription(this.debounceTimeDescription);
    this.setElementVisibility(true, false, false);
    const clicks = fromEvent(document, 'click');
    const result = clicks.pipe(tap((x) => this.clickCounts++), debounceTime(2000));
    this.subscription = result.subscribe(x => this.emittedValues.push(x.type+ `(${this.clickCounts}.)`));
  }

  public useThrottleTime(): void {
    this.reset();
    this.setDescription(this.throttleTimeDescription);
    this.setElementVisibility(true, false, false);
    const clicks = fromEvent(document, 'click');
    const result = clicks.pipe(tap((x) => this.clickCounts++), throttleTime(2000));
    this.subscription = result.subscribe(x => this.emittedValues.push(x.type+ `(${this.clickCounts}.)`));
  }

  //Utility operators
  public useTap(): void {
    this.setupExecution(this.tapDescription, this.defaultDataStream);
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

  private setupExecution(description: string, dataStream: number[]): void {
    this.reset();
    this.setDescription(description);
    this.dataStream = dataStream;
    this.setElementVisibility(false, false, true);
    this.observable$ = from(this.dataStream);
  }

  private setDescription(description: string): void {
    this.description = description;
  }

  private setElementVisibility(hideDataStream: boolean, hideDescription: boolean, hideClickCounts: boolean): void {
    this.hideDataStream = hideDataStream;
    this.hideDescription = hideDescription;
    this.hideClickCounts = hideClickCounts;
  }

  public useUnicastObservable(): void {
    this.reset();
    this.setDescription(this.observableDescription);
    this.setElementVisibility(true, false, true);

    let subscription1: Subscription;
    let subscription2: Subscription;
    const source = interval(500);

    subscription1 = source.subscribe({
      //next: (v: any) => console.log(`observerA: ${v}`)
      next: (v: any) => this.emittedValues.push(`observerA: ${v}`)
    });

    setTimeout(() => {
      subscription2 = source.subscribe({
        //next: (v: any) => console.log(`observerB: ${v}`)
        next: (v: any) => this.emittedValues.push(`observerB: ${v}`)
      });
    }, 1000);

    setTimeout(() => {
      subscription1.unsubscribe();
    }, 2000);

    setTimeout(() => {
      subscription2.unsubscribe();
    }, 3100);
  }

  public useMulticastObservable(): void {
    this.reset();
    this.setDescription(this.subjectDescription);
    this.setElementVisibility(true, false, true);

    let subscription1: Subscription;
    let subscription2: Subscription;
    let subscriptionConnect: Subscription;

    const source = interval(500);
    const connectableObservable = connectable(source, { connector: () => new Subject() });

    subscription1 = connectableObservable.subscribe({
      //next: (v: any) => console.log(`observerA: ${v}`)
      next: (v: any) => this.emittedValues.push(`observerA: ${v}`)
    });
    // We should call `connect()` here, because the first subscriber to `multicasted` is interested in consuming values.
    subscriptionConnect = connectableObservable.connect();

    setTimeout(() => {
      subscription2 = connectableObservable.subscribe({
        //next: (v: any) => console.log(`observerB: ${v}`)
        next: (v: any) => this.emittedValues.push(`observerB: ${v}`)
      });
    }, 1000);

    setTimeout(() => {
      subscription1.unsubscribe();
    }, 2000);

    // We should unsubscribe the shared Observable execution here, because `multicasted` would have no more subscribers after this.
    setTimeout(() => {
      subscription2.unsubscribe();
      subscriptionConnect.unsubscribe(); // for the shared Observable execution
    }, 3100);
  }

  public useShareOperator(): void {
    this.reset();
    this.setDescription(this.subjectDescription);
    this.setElementVisibility(true, false, true);

    let subscription1: Subscription;
    let subscription2: Subscription;

    const source = interval(500);
    const multicastedObservable = source.pipe(share({ connector: () => new Subject()}));

    subscription1 = multicastedObservable.subscribe({
      //next: (v: any) => console.log(`observerA: ${v}`)
      next: (v: any) => this.emittedValues.push(`observerA: ${v}`)
    });

    setTimeout(() => {
      subscription2 = multicastedObservable.subscribe({
        //next: (v: any) => console.log(`observerB: ${v}`)
        next: (v: any) => this.emittedValues.push(`observerB: ${v}`)
      });
    }, 1000);

    setTimeout(() => {
      subscription1.unsubscribe();
    }, 2000);
    setTimeout(() => {
      subscription2.unsubscribe();
    }, 3000);
  }

  public useBehaviorSubject(): void {
    this.reset();
    this.setDescription(this.behaviorSubjectDescription);
    this.setElementVisibility(true, false, true);

    const subject = new BehaviorSubject(0); // 0 is the initial value

    subject.subscribe({
      next: (v) => this.emittedValues.push(`observerA: ${v}`)
    });

    subject.next(1);
    subject.next(2);

    subject.subscribe({
      next: (v) => this.emittedValues.push(`observerB: ${v}`)
    });

    subject.next(3);
    this.emittedValues.push(`current value of the BehaviorSubject: ${subject.value}`)
  }

  public useReplaySubject(): void {
    this.reset();
    this.setDescription(this.replaySubjectDescription);
    this.setElementVisibility(true, false, true);

    const subject = new ReplaySubject(3); // buffer 3 values for new subscribers

    subject.subscribe({
      next: (v) => this.emittedValues.push(`observerA: ${v}`)
    });

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    subject.subscribe({
      next: (v) => this.emittedValues.push(`observerB: ${v}`)
    });

    subject.next(5);
  }

  public useAsyncSubject(): void {
    this.reset();
    this.setDescription(this.asyncSubjectDescription);
    this.setElementVisibility(true, false, true);

    const subject = new AsyncSubject();

    subject.subscribe({
      next: (v) => this.emittedValues.push(`observerA: ${v}`)
    });

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    subject.subscribe({
      next: (v) => this.emittedValues.push(`observerB: ${v}`)
    });

    subject.next(5);
    subject.complete();
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
