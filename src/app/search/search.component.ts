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
  combinedData: { userDetails: string; userPosts: string[] } | null = null;
  loadingSearch = false;
  loadingCombined = false;
  errorSearch: string | null = null;
  errorCombined: string | null = null;

  // Simulated candies array
  private candies = ['Chocolate', 'Gummy Bears', 'Lollipop', 'Candy Cane', 'Toffee'];

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
      map(searchTerm => this.candies.filter(candy => candy.toLowerCase().includes(searchTerm.toLowerCase()))),
      switchMap(filteredResults => 
        this.simulateApiCall(filteredResults).pipe(
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

    const userDetails$ = this.simulateApiCall(['John Doe - Staff']);
    const userPosts$ = this.simulateApiCall(['Post 1: Welcome to the team', 'Post 2: Project Update']);

    combineLatest([userDetails$, userPosts$]).pipe(
      map(([details, posts]) => ({
        userDetails: details[0],
        userPosts: posts
      })),
      catchError(error => {
        this.errorCombined = 'Failed to fetch combined data. Please try again.';
        return of(null);
      })
    ).subscribe(combined => {
      this.combinedData = combined;
      this.loadingCombined = false;
    });
  }

  private simulateApiCall(data: string[]) {
    return of(data).pipe(
      tap(() => console.log('Simulated API call for:', data)),
      debounceTime(500)
    );
  }
}
