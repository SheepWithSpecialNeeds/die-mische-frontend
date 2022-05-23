import { Component, OnInit } from '@angular/core';
import { CropService } from '../crop.service';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.css']
})
export class BrowseComponent implements OnInit {

  constructor(private cropService: CropService) { }

  ngOnInit(): void {
    this.cropService.getCrops().subscribe(data => {
      this.crops = data;
    })
  }

  crops: any[];

}
