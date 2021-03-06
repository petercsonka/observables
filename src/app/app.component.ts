import { Component } from '@angular/core';
import { AsyncSubject, BehaviorSubject, from, fromEvent, interval, Observable, ReplaySubject, Subject, Subscription, connectable, merge, race, forkJoin, combineLatest, of } from 'rxjs';
import { filter, first, take, tap, takeUntil, debounceTime, throttleTime, distinctUntilChanged, share, concatMap, map, delay, mergeMap, switchMap } from 'rxjs/operators';
import * as Rx from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public dataStream: any[] = [];
  public dataStream2: any[] = [];
  public emittedValues: any[] = [];
  public clickCounts = 0;
  public description = '';
  public hideDataStream = true;
  public hideDataStream2 = true;
  public hideClickCounts = true;
  public hideDescription = true;
  public window2: any;
  public sub: any;
  public coldHidden = true;
  public hotHidden = true;

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

  private readonly mapDescription = '(using the map operator - every number will be multiplied by 2):';
  private readonly concatMapDescription = '(using the concatMap operator - concatenate numbers with strings (wait for completion)):';
  private readonly mergeMapDescription = '(using the mergeMap operator - concatenate numbers with strings (doesn\'t wait for completion)):';
  private readonly switchMapDescription = '(using the switchMap operator - concatenate numbers with strings (emit the most recently projected Observable)):';

  private readonly observableDescription = '(using Observable - unicast execution):';
  private readonly subjectDescription = '(using Subject - multicast execution):';
  private readonly behaviorSubjectDescription = '(using BehaviorSubject):';
  private readonly replaySubjectDescription = '(using ReplaySubject - buffers the last 3 values for new subscribers):';
  private readonly asyncSubjectDescription = '(using AsyncSubject - emits only the last value to its observers, and only when the execution completes):';

  private readonly ofDescription = '(using the of operator - sources can be turned into an Observable):';
  private readonly fromDescription = '(using the from operator - any Array, Promise or Iterable can be turned into an Observable):';

  private readonly combineLatestDescription = '(using combineLatest operator - two or more sources can be combined into one observable):';
  private readonly forkJoinDescription = '(using forkJoin operator - two or more sources can be forked together on completion):';
  private readonly mergeDescription = '(using merge operator - two or more sources can be merged together into one observable):';
  private readonly raceDescription = '(using race operator - a "winner" source observable can be mirrored out of several observables):'


  //Hot and cold observable examples
  public showColdObservable(){
    this.coldHidden = false;
    const observable = Rx.Observable.create((observer: { next: (arg0: number) => void; }) => {
      observer.next(Math.random());
    });
    // subscription 1
    observable.subscribe((value: number) => this.emittedValues.push(value));
    // subscription 2
    observable.subscribe((value: number) => this.emittedValues.push(value));
  }

  public showHotObservable(){
    this.hotHidden = false;
    const random = Math.random()
    const observable = Rx.Observable.create((observer: { next: (arg0: number) => void; }) => {
        observer.next(random);
    });
    // subscription 1
    observable.subscribe((value: number) => this.emittedValues.push(value));
    // subscription 2
    observable.subscribe((value: number) => this.emittedValues.push(value));

  }

  //Creation operators
  public useOf(): void{
    this.reset();
    this.dataStream = this.defaultDataStream;
    this.setDescription(this.ofDescription);
    this.setElementVisibility(false,false,false,false);
    this.observable$ = of(this.dataStream) as any;
    this.observable$.pipe().subscribe((value: number) => this.emittedValues.push(value));
  }

  public useFrom(): void{
    this.reset();
    this.dataStream = this.defaultDataStream;
    this.setDescription(this.fromDescription);
    this.setElementVisibility(false,false,false,false);
    this.observable$ = from(this.dataStream);
    this.observable$.pipe().subscribe((value: number) => this.emittedValues.push(value));
  }

  //Join creation operators
  public useCombineLatest(): void{
    this.setDescription(this.combineLatestDescription);
    this.dataStream = this.defaultDataStream;
    this.setElementVisibility(false,false,true,false);

    const firstTimer = Rx.timer(0, 1000);
    const secondTimer = Rx.timer(0, 2500);
    const combinedTimers = combineLatest([firstTimer, secondTimer]);
    this.sub = combinedTimers.subscribe((value: any) =>  this.emittedValues.push(value));

    setTimeout(() => {
      this.sub.unsubscribe();
    }, 10000)
  }
  public useForkJoin(): void{
    this.setDescription(this.forkJoinDescription);
    this.setElementVisibility(false,false,true,false);
    this.dataStream = this.defaultDataStream;

    const timer1 = interval(500).pipe(take(5));
    const timer2 = interval(1000).pipe(take(3));
    const forkJoined = forkJoin([timer1, timer2]);
    this.sub = forkJoined.subscribe(value =>  this.emittedValues.push(value));

    setTimeout(() => {
      this.sub.unsubscribe();
    }, 7000)
  }
  public useMerge(): void{
    this.setDescription(this.mergeDescription);
    this.setElementVisibility(false,false,true,false);
    this.dataStream = this.defaultDataStream;

    const timer1 = Rx.timer(0, 1000);
    const timer2 = Rx.timer(0, 2000);
    const merged = merge(timer1, timer2);
    this.sub = merged.subscribe((value: any) =>  this.emittedValues.push(value));

    setTimeout(() => {
      this.sub.unsubscribe();
    }, 7000)
  }
  public useRace(): void{
    this.setDescription(this.raceDescription);
    this.setElementVisibility(false,false,true,false);
    this.dataStream = this.defaultDataStream;

    const timer1 = Rx.timer(1000, 1000);
    const timer2 = Rx.timer(0, 2000);
    const raced = race(timer1, timer2);
    this.sub = raced.subscribe((value: any) =>  this.emittedValues.push(value));

    setTimeout(() => {
      this.sub.unsubscribe();
    }, 7000)
  }

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
    this.setElementVisibility(true, false, true, true);
    //const source = this.createIntervalObservable(1000, 0);
    const source$ = interval(1000);
    const clicks$ = fromEvent(document, 'dblclick');
    const result$ = source$.pipe(takeUntil(clicks$));
    this.subscription = result$.subscribe((value: number) => this.emittedValues.push(value));
  }

  public useDebounceTime(): void {
    this.reset();
    this.setDescription(this.debounceTimeDescription);
    this.setElementVisibility(true, false, false, true);
    const clicks = fromEvent(document, 'click');
    const result = clicks.pipe(tap((x) => this.clickCounts++), debounceTime(2000));
    this.subscription = result.subscribe(x => this.emittedValues.push(x.type+ `(${this.clickCounts}.)`));
  }

  public useThrottleTime(): void {
    this.reset();
    this.setDescription(this.throttleTimeDescription);
    this.setElementVisibility(true, false, false, true);
    const clicks = fromEvent(document, 'click');
    const result = clicks.pipe(tap((x) => this.clickCounts++), throttleTime(2000));
    this.subscription = result.subscribe(x => this.emittedValues.push(x.type+ `(${this.clickCounts}.)`));
  }

  //Utility operators
  public useTap(): void {
    this.setupExecution(this.tapDescription, this.defaultDataStream);
    this.observable$.pipe(tap((value: number) => console.log(value))).subscribe((value: number) => this.emittedValues.push(value));
  }

  // Transformation operators
  public useMap(): void {
    this.setupExecution(this.mapDescription, this.defaultDataStream);
    this.subscription = this.observable$.pipe(
      map((value: number) => 2 * value)
    ).subscribe((value: number) => this.emittedValues.push(value));
  }

  public useConcatMap(): void {
    const data1 = [1, 2, 3, 4];
    const data2 = ['A', 'B', 'C'];
    this.setupExecution(this.concatMapDescription, data1, data2);

    let source2$ = from(data2).pipe(
      concatMap( item => of(item).pipe ( delay( 500 ) )))

      this.subscription = this.observable$.pipe(
      concatMap(x => source2$.pipe(map(y => x + y)))
    ).subscribe((value: string) => this.emittedValues.push(value));
  }

  public useMergeMap(): void {
    const data1 = [1, 2, 3, 4];
    const data2 = ['A', 'B', 'C'];
    this.setupExecution(this.mergeMapDescription, data1, data2);

    let source2$ = from(data2).pipe(
      concatMap( item => of(item).pipe ( delay( 1000 ) )))

    this.subscription = this.observable$.pipe(
      mergeMap(x => source2$.pipe(map(y => x + y)))
    ).subscribe((value: string) => this.emittedValues.push(value));
  }

  public useSwitchMap(): void {
    const data1 = [1, 2];
    const data2 = ['A', 'B', 'C'];
    this.setupExecution(this.switchMapDescription, data1, data2);

    let source1$ = from(data1).pipe(
      concatMap( item => of(item).pipe ( delay( 1000 ) )))

    let source2$ = from(data2).pipe(
      concatMap( item => of(item).pipe ( delay( 600 ) )))

    this.subscription = source1$.pipe(
      switchMap(x => source2$.pipe(map(y => x + y)))
    ).subscribe((value: string) => this.emittedValues.push(value));
  }

  public reset(): void {
    this.hotHidden = true; this.coldHidden = true;
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
    this.setElementVisibility(true, true, true, true);
    this.emittedValues = [];
    this.description = '';
    this.clickCounts = 0;
  }

  private setupExecution(description: string, dataStream: number[], dataStream2?: any[]): void {
    this.reset();
    this.setDescription(description);
    this.dataStream = dataStream;
    this.dataStream2 = dataStream2!;
    this.setElementVisibility(false, false, true, dataStream2 ? false : true);
    this.observable$ = from(this.dataStream);
  }

  private setDescription(description: string): void {
    this.description = description;
  }

  private setElementVisibility(hideDataStream: boolean, hideDescription: boolean, hideClickCounts: boolean, hideDataStream2: boolean): void {
    this.hideDataStream = hideDataStream;
    this.hideDataStream2 = hideDataStream2;
    this.hideDescription = hideDescription;
    this.hideClickCounts = hideClickCounts;
  }

  public useUnicastObservable(): void {
    this.reset();
    this.setDescription(this.observableDescription);
    this.setElementVisibility(true, false, true, true);

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
    this.setElementVisibility(true, false, true, true);

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
    this.setElementVisibility(true, false, true, true);

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
    this.setElementVisibility(true, false, true, true);

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
    this.setElementVisibility(true, false, true, true);

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
    this.setElementVisibility(true, false, true, true);

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
