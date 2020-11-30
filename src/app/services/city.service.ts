import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  weatherAPI='http://api.openweathermap.org/data/2.5/weather?';
  weatherAPIkey='6f9c58b9527660b6e5a050738a91490b';
  constructor(private httpClient: HttpClient) { }
  getWeatherInfo(cityName: string){
    const apiURL= this.weatherAPI + 'q=' + cityName + '&appid=' + this.weatherAPIkey;
    return this.httpClient.get(apiURL);
    
  }
}
