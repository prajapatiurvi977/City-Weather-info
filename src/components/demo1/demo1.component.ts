import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CityService } from 'src/app/services/city.service';
import { GeoDbService } from 'wft-geodb-angular-client';
import { GeoResponse } from 'wft-geodb-angular-client/lib/model/geo-response.model';
import { PlaceDetails } from 'wft-geodb-angular-client/lib/model/place-details.model';
import { PlaceSummary } from 'wft-geodb-angular-client/lib/model/place-summary.model';
import { GetPlaceDetailsRequest } from 'wft-geodb-angular-client/lib/request/get-place-details-request.model';

@Component({
  selector: 'app-demo1',
  templateUrl: './demo1.component.html',
  styleUrls: ['./demo1.component.less']
})
export class Demo1Component implements OnInit {
  navbar = ['ABOUT', 'STRATASIM', 'CAREERS', 'CONTACT'];
  searchedCity = '';
  weatherResponse: any;
  selectedCity: PlaceDetails;
  cityControl: FormControl;
  filteredCities: Observable<PlaceSummary[]>;
  constructor(private cityService: CityService,
    private geoDbService: GeoDbService) { }

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
    // const geodbData: GetPlaceDetailsRequest = {
    //   placeId: 'London,UK'
    // };
    
    this.cityService.getWeatherInfo(cityName).subscribe(response => this.weatherResponse = response);
    // this.geoDbService.findPlace(geodbData).subscribe(geoData => console.log(geoData));
  }
  onInputChange(): void {

  }
  getCityDisplayName(city): string {
    return city.name + ', ' + city.country;
  }
  onCitySelected(city: PlaceSummary) {
    this.fetchWeatherData(this.getCityDisplayName(city));
    this.geoDbService.findPlace({
      placeId: city.id
    })
      .subscribe(
        (response: GeoResponse<PlaceDetails>) => {
          this.selectedCity = response.data;
        });
  }
}
