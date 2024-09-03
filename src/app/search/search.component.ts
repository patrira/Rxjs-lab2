import { Component } from '@angular/core';
import { of, combineLatest } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  searchResults: string[] = [];
  combinedData: string | null = null;
  loadingSearch = false;
  loadingCombined = false;
  errorSearch: string | null = null;
  errorCombined: string | null = null;

  constructor(private http: HttpClient) {}

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const term = input.value || '';

    this.loadingSearch = true;
    of(term).pipe(
      debounceTime(300),
      filter(term => term.length >= 3),
      tap(() => {
        this.errorSearch = null;
        this.searchResults = [];
      }),
      switchMap(searchTerm => 
        this.simulateApiCall(searchTerm).pipe(
          catchError(error => {
            this.errorSearch = 'Search failed. Please try again.';
            return of([]); 
          })
        )
      )
    ).subscribe(results => {
      this.searchResults = results;
      this.loadingSearch = false;
    });
  }

  fetchCombinedData() {
    this.loadingCombined = true;
    const userDetails$ = this.simulateApiCall('User Details');
    const userPosts$ = this.simulateApiCall('User Posts');

    combineLatest([userDetails$, userPosts$]).pipe(
      map(([details, posts]) => `${details[0]} and ${posts[0]}`),
      catchError(error => {
        this.errorCombined = 'Failed to fetch combined data. Please try again.';
        return of(null);
      })
    ).subscribe(combined => {
      this.combinedData = combined;
      this.loadingCombined = false;
    });
  }

  private simulateApiCall(term: string) {
    return of([`Results for ${term}`]).pipe(
      tap(() => console.log(`API call for: ${term}`)),
      debounceTime(500)
    );
  }
}
