import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CropService } from '../crop.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-crop',
  templateUrl: './view-crop.component.html',
  styleUrls: ['./view-crop.component.css']
})
export class ViewCropComponent implements OnInit {

  constructor(private route: ActivatedRoute, private cropService: CropService, private _Router: Router) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const crop_id = Number(routeParams.get('crop_id'));

    this.cropService.getCrop(crop_id).subscribe( data => {
      this.crop = data;
      console.log("Got Crop with ID: ", crop_id, " = ", data);
    });
  }

  crop: any;

  /**
   * adds the crop to crop service list
   */
  addCrop() {

    if(!this.cropService.selectedCrops.includes(this.crop)) {
      this.cropService.selectedCrops.push(this.crop);
    }

    this._Router.navigate(['/crop']);
  }
}
