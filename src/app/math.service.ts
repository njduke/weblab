import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { tap } from 'rxjs';
import { MathRequest } from './math.requests';

@Injectable({
  providedIn: 'root'
})
export class MathService {

  private serverPort: number = 8001;
  private serverURL: string = 'http://localhost:'.concat(this.serverPort.toString());

  constructor(
    private http: HttpClient
  ) {}

  //todo: function to encode math function input string before GET request
  encodeMathFunction(mathFunction: string): string {
    let converted: string = encodeURIComponent(mathFunction).replace( // also encode () brackets for URI: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
        /[()]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    //console.log(`Encoded ${mathFunction} to ${converted}`);
    return converted;
  }

  decodeMathFunction(encoded: string): string {
    let converted: string = decodeURIComponent(encoded);
    //console.log(`Decoded: ${converted}`);
    return converted;
  }

  getMathResult(func: string, mathRequest: MathRequest): Observable<string> {
    const encodedFunction = this.encodeMathFunction(func);
    const finalUrl = this.serverURL.concat(mathRequest, `?function=${encodedFunction}`);
    console.log(`REQUEST MATH URL: ${finalUrl}`);
    return this.http.get(finalUrl, { responseType: "text" })
      .pipe(
        //tap(_ => console.log('fetched math function result')),
        catchError(this.handleError<string>('getMathResult', ' '))
      )
  }

  getMathPlot(func: string, mathRequest: MathRequest): Observable<Blob> {
    const encodedFunction = this.encodeMathFunction(func);
    const finalUrl = this.serverURL.concat(mathRequest, `?function=${encodedFunction}`);
    console.log(`REQUEST PLOT URL: ${finalUrl}`);
    return this.http.get(finalUrl, { responseType: "blob" })
      .pipe(
        //tap(_ => console.log('fetched math plot')),
        catchError(this.handleError<Blob>('getMathPlot'))
      )
  }

  /**
 * Handle Http operation that failed.
 * Let the app continue.
 *
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result1
 */
private handleError<T>(operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {

    // TODO: better job of transforming error for user consumption
    let ob = error.error;
    console.log(ob);

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}
}
