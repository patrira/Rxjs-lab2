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
  persistentSearchResults: string[] = [];
  combinedData: { userDetails: string; userPosts: string[] }[] = [];
  currentFetchIndex = 0;
  loadingSearch = false;
  loadingCombined = false;
  errorSearch: string | null = null;
  errorCombined: string | null = null;

  // Expanded candies array
  private candies = [
    'Chocolate', 'Gummy Bears', 'Lollipop', 'Candy Cane', 'Toffee',
    'Jelly Beans', 'Marshmallows', 'Licorice', 'Fudge', 'Taffy',
    'Caramel', 'Peanut Brittle', 'Nougat', 'Gumdrops', 'Candy Corn'
  ];

  // Multiple sets of user details and posts for cyclic display
  private userDetailsSets = [
    { details: 'John Doe - Staff', posts: ['Post 1: Welcome to the team', 'Post 2: Project Update'] },
    { details: 'Jane Smith - Manager', posts: ['Post 1: New Project Launch', 'Post 2: Team Building Activities'] },
    { details: 'Bob Johnson - Developer', posts: ['Post 1: Code Review', 'Post 2: Sprint Planning'] },
    { details: 'Alice Brown - Designer', posts: ['Post 1: UI/UX Best Practices', 'Post 2: Design System Updates'] }
  ];

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
      this.persistentSearchResults = [...this.persistentSearchResults, ...results];
      this.loadingSearch = false;
    });
  }

  fetchCombinedData() {
    this.loadingCombined = true;

    const currentData = this.userDetailsSets[this.currentFetchIndex];
    const userDetails$ = this.simulateApiCall([currentData.details]);
    const userPosts$ = this.simulateApiCall(currentData.posts);

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
      if (combined) {
        this.combinedData.push(combined);
        this.currentFetchIndex = (this.currentFetchIndex + 1) % this.userDetailsSets.length;
      }
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
