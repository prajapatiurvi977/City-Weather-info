import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CityService } from 'src/app/services/city.service';
import { GeoDbService } from 'wft-geodb-angular-client';
import { GeoResponse } from 'wft-geodb-angular-client/lib/model/geo-response.model';
import { PlaceDetails } from 'wft-geodb-angular-client/lib/model/place-details.model';
import { PlaceSummary } from 'wft-geodb-angular-client/lib/model/place-summary.model';

@Component({
  selector: 'app-demo1',
  templateUrl: './demo1.component.html',
  styleUrls: ['./demo1.component.less']
})
export class Demo1Component implements OnInit {
  displayedColumns = ['id', 'location', 'population', 'elevation', 'weatherMain', 'weatherDescr'];
  weatherResponse: any;
  selectedCity: PlaceDetails;
  cityControl: FormControl;
  filteredCities: Observable<PlaceSummary[]>;

  constructor(private cityService: CityService,
              private geoDbService: GeoDbService,
              private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cityControl = new FormControl();

    this.filteredCities = this.cityControl.valueChanges
      .pipe(
        switchMap((cityNamePrefix: string) => {
          let citiesObservable: Observable<PlaceSummary[]> = of([]);

          if (cityNamePrefix && cityNamePrefix.length >= 3) {

            citiesObservable = this.geoDbService.findPlaces({
              namePrefix: cityNamePrefix,
              minPopulation: 0,
              types: ['CITY'],
              sortDirectives: ['-population'],
              limit: 10,
              offset: 0
            })
              .pipe(
                map(
                  (response: GeoResponse<PlaceSummary[]>) => {
                    return response.data;
                  },
                  (error: any) => console.log(error)
                )
              );
          }
          return citiesObservable;
        })
      );
  }
  fetchWeatherData(cityName: string): void {
    this.cityService.getWeatherInfo(cityName).subscribe(response => this.weatherResponse = response);
  }

  getCityDisplayName(city): string {
    if (!!city) {
      return city.name + ', ' + city.country;
    }
    return '';
  }

  onCitySelected(city: PlaceSummary): void {
    this.fetchWeatherData(this.getCityDisplayName(city));
    this.geoDbService.findPlace({
      placeId: city.id
    }).subscribe(
      (response: GeoResponse<PlaceDetails>) => {
        this.selectedCity = response.data;
        this.runChangeDetector();
      });
  }

  private runChangeDetector(): void {
    this.cd.detectChanges();
  }
}
