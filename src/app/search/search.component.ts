import { Component } from '@angular/core';
import { of, combineLatest } from 'rxjs';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  searchResults: string[] = [];
  fetchedData: { user: { name: string; age: number; job: string }, post: string }[] = [];
  loadingSearch = false;
  loadingFetch = false;
  errorSearch: string | null = null;
  errorFetch: string | null = null;

  private candies = [
    'Lollipop', 'Candy Cane', 'Gummy Bears', 'Chocolate Bar', 'Jelly Beans',
    'Skittles', 'M&Ms', 'Licorice', 'Caramel', 'Marshmallows',
    'Gumdrops', 'Sour Patch Kids', 'Twizzlers', 'Peanut Butter Cups', 'Starburst'
  ];

  private userDetails = [
    { name: 'John Doe', age: 30, job: 'Software Engineer' },
    { name: 'Jane Smith', age: 25, job: 'Graphic Designer' },
    { name: 'Mary Johnson', age: 35, job: 'Project Manager' }
  ];

  private userPosts = [
    'Post 1: Angular Tips and Tricks',
    'Post 2: Understanding RxJS Operators',
    'Post 3: Best Practices for TypeScript',
    'Post 4: Advanced Angular Techniques',
    'Post 5: How to Build Scalable Applications'
  ];

  private currentDetailIndex = 0;
  private currentPostIndex = 0;

  constructor(private http: HttpClient) {}

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const term = input.value || '';

    this.loadingSearch = true;
    this.errorSearch = null;

    if (!term.trim() || term.length < 3) {
      this.loadingSearch = false;
      return;
    }

    of(term).pipe(
      debounceTime(300),
      tap(() => {
        this.errorSearch = null;
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
      if (results.length === 0) {
        this.errorSearch = 'No such candy in the list. Try another term.';
      } else {
        this.searchResults = [...this.searchResults, ...results];
        this.searchResults = Array.from(new Set(this.searchResults));
      }
      this.loadingSearch = false;
    });
  }

  fetchCombinedData() {
    this.loadingFetch = true;
    this.errorFetch = null;

    if (this.currentDetailIndex >= this.userDetails.length || this.currentPostIndex >= this.userPosts.length) {
      this.errorFetch = 'No more user details or posts to display.';
      this.loadingFetch = false;
      return;
    }

    const userDetails$ = of(this.userDetails[this.currentDetailIndex]).pipe(
      tap(() => console.log('API call for user details')),
      debounceTime(500)
    );
    const userPosts$ = of(this.userPosts[this.currentPostIndex]).pipe(
      tap(() => console.log('API call for user posts')),
      debounceTime(500)
    );

    combineLatest([userDetails$, userPosts$]).pipe(
      map(([details, posts]) => ({ user: details, post: posts })),
      catchError(error => {
        this.errorFetch = 'Failed to fetch combined data. Please try again.';
        return of(null);
      })
    ).subscribe(combined => {
      if (combined) {
        this.fetchedData.push(combined);
        this.currentDetailIndex++;
        this.currentPostIndex++;
      }
      this.loadingFetch = false;
    });
  }

  private simulateApiCall(term: string) {
    if (term.toLowerCase() === 'user details' || term.toLowerCase() === 'user posts') {
      return of([]);
    } else {
      return of(this.candies.filter(candy => candy.toLowerCase().includes(term.toLowerCase()))).pipe(
        tap(() => console.log('API call for candies')),
        debounceTime(500)
      );
    }
  }
}
