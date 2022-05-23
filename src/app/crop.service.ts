import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Crop } from './crop';



@Injectable({
  providedIn: 'root'
})
export class CropService {

  private baseUrl = "http://localhost:8080/api/";

  constructor(private http : HttpClient) { }

  selectedCrops: any[] = [];

  posPolyCultivations: any = [];
  negPolyCultivations: any = [];

  positiveN: any[] = [];
  negativeN: any[] = [];
  undefinedN: any[] = [];

  //GET request that interprets the body as a JSON object and returns the response body in a given type.
  
  getCrops(): Observable<Crop[]>{
    return this.http.get<Crop[]>(`${this.baseUrl}`+`crops`);
  }

  getCrop(crop_id: Number) {
    return this.http.get<Crop>(`${this.baseUrl}`+`crops/`+crop_id);
  }

  getPosPolyCultivations() {
    return this.http.get(`${this.baseUrl}`+`posPolyCultivations`);
  }

  getNegPolyCultivations() {
    return this.http.get(`${this.baseUrl}`+`negPolyCultivations`);
  }
}
