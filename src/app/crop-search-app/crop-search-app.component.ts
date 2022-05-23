import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CropService } from '../crop.service';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import { FormGroup } from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';
import {FormControl} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { NutrFilter } from './nutr-filter';
import { FamFilter } from './fam-filter';


@Component({
  selector: 'app-crop',
  templateUrl: './crop-search-app.component.html',
  styleUrls: ['./crop-search-app.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ transform: 'translateY(2%)', opacity: 0 }),
            animate('0.75s ease-out', 
                    style({ transform: 'translateY(0%)', opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ opacity: 1 }),
            animate('0.01s ease-in', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class CropSearchComponent implements OnInit, OnChanges {

  showFiller = false;

  separatorKeysCodes: number[] = [ENTER, COMMA];

  public debugView = false;

  //sets defualt selection to "Neutrale Nachbarn"
  selectedIndex = 0;

  crops: any[];
  crop_dict: any = {};
  crop_name_dict: any = {};
  crop_families: string[] = [];
  crop_nutrient_requirements: string[] = [];

  posPolyCultivations: any;
  negPolyCultivations: any;

  collapsed: boolean[] = [];
  default_toggle = true;
  refineGroup: FormGroup;


  constructor(private cropService: CropService, private _snackBar: MatSnackBar) { }

  nutrient_refine_toggle: boolean = false;

  nFilter: NutrFilter[] = [
    {value:"none",viewValue:"Keine"}
  ]
  
  fFilter: FamFilter[] = [
    {value:"none",viewValue:"Keine"}
  ]

  famliy_value: string = "";
  nutr_req_value: string = ""

  /**
   * Triggers Filterfunction
   * @param value of Filter Option
   * @param type Filter in relation
   */
  triggerFilter(value: any, type:string){
    switch(type){

      case "family":
        if (value == "none") {
          this.famliy_value = "";
          break;
        }
        this.famliy_value = value;
        break;

      case "nutrients_requirment":
        if (value == "none") {
          this.nutr_req_value = "";
          break;
        }
        this.nutr_req_value = value;
        break;

      default:
        console.log("[ERROR]: no type specified...");
    }
    this.updateLists(); 
  }

  ngOnChanges(changes: SimpleChanges): void { }

  @Input()
  cropControl: FormControl = new FormControl();

  // opens on first visit
  ngOnInit(): void {

    this.getCropsFromService();

    this.getPosCultivationsFromService();

    this.getNegPolycultivationsFromService();

    this.restoreSavedListsFromService();
  }

  private getCropsFromService(): void {
    this.cropService.getCrops().subscribe((data) =>{
      
      this.crops = data;

      for (let crop of this.crops) {

        this.crop_dict[crop.crop_id] = crop;
        this.crop_name_dict[crop.crop_name.toLowerCase()] = crop;
        
        //Liste für Filteroptionen füllen
        if (!this.crop_families.includes(crop.crop_family)) {
          this.crop_families.push(crop.crop_family);
        }
        if (!this.crop_nutrient_requirements.includes(crop.crop_nutrient_requirements)){
          this.crop_nutrient_requirements.push(crop.crop_nutrient_requirements);
        }
      }

      for (let nutrient_requirement of this.crop_nutrient_requirements){

        if(nutrient_requirement!=null) {
          this.nFilter.push({ value: nutrient_requirement.toString(), viewValue: nutrient_requirement.toString() })
        }
      }
      for (let family of this.crop_families){

        if(family!=null){
          this.fFilter.push({ value:family.toString(), viewValue: family.toString()})
        }
      }

      this.undefinedN = this.crops;
      this.undefinedN.sort(this.sortFnct);

      for (let crop of this.crops) {

        this.collapsed[crop.crop_id] = false;
      }
      this.cropControl = new FormControl();
      
      //FOR DEBUGGING
      //console.log("filtered crops: ", this.filteredCrops.subscribe((data) => console.log("filtered crops: ", data)));
     
      //SAVE SELECTED CROP LIST 
      //While switching between subpages selected crops being saved
      if (this.cropService.selectedCrops.length > 0) {
        this.selectedCrops = this.cropService.selectedCrops;
      }
    });
  }

  private getPosCultivationsFromService(): void {

    if (this.cropService.posPolyCultivations.length <= 0) {

      this.cropService.getPosPolyCultivations().subscribe((data)=>{
        console.log(data);
        this.posPolyCultivations = data;
        this.cropService.posPolyCultivations = data;
      });
    }
    else {

      this.posPolyCultivations = this.cropService.posPolyCultivations;
    }
  }

  private getNegPolycultivationsFromService(): void {

    if (this.cropService.negPolyCultivations.length <= 0) {

      this.cropService.getNegPolyCultivations().subscribe((data)=>{
        console.log("negPolyCultivations: ", data);
        this.negPolyCultivations =data;
        this.cropService.negPolyCultivations = data;
      });
    }
    else {
      this.negPolyCultivations = this.cropService.negPolyCultivations;
    }
  }

  private restoreSavedListsFromService(): void {

    if (this.cropService.negativeN.length >= 0) {
      this.negativeN = this.cropService.negativeN;
    }

    if (this.cropService.positiveN.length >= 0) {
      this.positiveN = this.cropService.positiveN;
    }

    if (this.cropService.undefinedN.length >= 0) {
      this.undefinedN = this.cropService.undefinedN;
    }
  } 

  addCropToSelectionByInput(event: MatChipInputEvent): void {
    const value = (event.value || '').trim().toLowerCase();

    if (!(value in this.crop_name_dict)) {
      
     return; 
    }

    //this.checkIfCropAlreadyInSelection(value);

    if (value) {

      this.addCropToSelection(this.crop_name_dict[value].crop_id);
      
    }
    
    // Clear the input value
    event.chipInput!.clear();

    this.cropControl.setValue(null);
  }
  private checkIfCropAlreadyInSelection(id:number): boolean{
    console.log("[INFO]: Crop to check if selected ", this.crop_dict[id].crop_name);
    if (this.selectedCrops.includes(this.crop_dict[id])) {
      this._snackBar.open("Crop already in Selection...", "Dismis")
      return true;
    }
    else if (this.negativeN.includes(this.crop_dict[id])) {
      this._snackBar.open("Crop is a bad neighbour...", "Dismis")
      return true;
    }
    return false;
   
  }

  filterN: any[] = [];

  applySearchExpressionToLists() {
    
    this.updateLists();
    //search only for the name of crop
    this.positiveN = this.positiveN.filter( (data) => {
     
      if(data.crop_name.toLowerCase().includes(this.cropControl.value.toLowerCase())){
        return true;
      }
      return false;
    });

    this.undefinedN = this.undefinedN.filter( (data) => {
    
      if(data.crop_name.toLowerCase().includes(this.cropControl.value.toLowerCase())){
        return true;
      }
      return false;
    });

    this.negativeN = this.negativeN.filter( (data) => {

      if(data.crop_name.toLowerCase().includes(this.cropControl.value.toLowerCase())){
        return true;
      }
      return false;
    });
  }

  positiveN: any[] = [];
  negativeN: any[] = [];
  undefinedN: any[] = [];

  selectedCrops: any[] = [];

  @ViewChild('cropInput') cropInput: ElementRef<HTMLInputElement>;

  /**
   * sort two crops by alphabet
   * @param a crop a
   * @param b crop b
   * @returns 
   */
  private sortFnct(a:any, b:any) {
    var nameA :string = a.crop_name;
    var nameB :string = b.crop_name;
    if (nameA < nameB) {
      return -1;
    }
    else {
      return 1
    }
  }

  /**
   * main Function that is called when a Crop is being added to selection
   * @param id id of crop to add
   * @returns 
   */
  addCropToSelection(id : number) {

    if(this.checkIfCropAlreadyInSelection(id) == true){
      return;
    }
    this.selectedCrops.push(this.crop_dict[id]);

    this.selectedCrops.sort(this.sortFnct);

    this.updateLists();
    //emty searchbar input
    this.cropControl.setValue(null);
  }

  /**
   * update all List enteries und backup to CropService
   */
  public updateLists() {
    this.updateNegativeNeighbors();

    this.updatePositiveNeighbors();

    this.updateUndefinedNeighbors();
    
    //filter crops when Filter is triggered
    
    this.filterTabsByFamily();

    this.filterTabsByNurtiRequ();

    this.saveStateToCropService();
  }

  private saveStateToCropService() {
    this.cropService.selectedCrops = this.selectedCrops;
    this.cropService.negativeN = this.negativeN;
    this.cropService.positiveN = this.positiveN;
    this.cropService.undefinedN = this.undefinedN;
  }

 private filterTabsByNurtiRequ(){
    if (this.nutr_req_value != "") {
      //undefindes Tab
      this.undefinedN = this.undefinedN.filter((crop) => {
        if (crop.crop_nutrient_requirements == this.nutr_req_value) {
          return true;
        }
        return false;
      });
      //positive Tab
      this.positiveN = this.positiveN.filter((crop) => {
        if (crop.crop_nutrient_requirements == this.nutr_req_value) {
          return true;
        }
        return false;
      });
      //negative Tab
      this.negativeN = this.negativeN.filter((crop) => {
        if (crop.crop_nutrient_requirements == this.nutr_req_value) {
          return true;
        }
        return false;
      });
    }

  }

  private filterTabsByFamily(){
    if (this.famliy_value != "") {
      //undefindes Tab
      this.undefinedN = this.undefinedN.filter((crop) => {
        if (crop.crop_family == this.famliy_value) {
          return true;
        }
        return false;
      });
      //positive Tab
      this.positiveN = this.positiveN.filter((crop) => {
        if (crop.crop_family == this.famliy_value) {
          return true;
        }
        return false;
      });
      //negative Tab
      this.negativeN = this.negativeN.filter((crop) => {
        if (crop.crop_family == this.famliy_value) {
          return true;
        }
        return false;
      });
    }
  }

  private updateUndefinedNeighbors() {
    //reset list to remove duplicates
    this.undefinedN = [];
    if (this.default_toggle == true) {

      for (let crop of this.crops) {

        //check if crops is not in pos or neg list => becomes undefined
        if (!this.negativeN.includes(crop) && !this.positiveN.includes(crop) && !this.selectedCrops.includes(crop)) {

          this.undefinedN.push(this.crop_dict[crop.crop_id]);
        }
      }
    }

    this.undefinedN.sort(this.sortFnct);
    console.log("[INFO]: Updated undefinedN: ", this.positiveN);
  }

  private updateNegativeNeighbors() {
    //reset list to remove duplicates
    this.negativeN = [];

    if (this.selectedCrops.length == 0) {
      //return when selection is empty...
      return;
    }

    if (this.default_toggle == true) {
      for (let crop of this.selectedCrops) {
        for (let item of this.negPolyCultivations) {
          
          if (crop.crop_id == item.crop.crop_id ) {

            //only add if its not included yet
            if (!this.negativeN.includes(this.crop_dict[item.neg_crop_id]) && !this.selectedCrops.includes(this.crop_dict[item.neg_crop_id])) {

              this.negativeN.push(this.crop_dict[item.neg_crop_id]);
            }
          }

          //reverse lookup
          if (crop.crop_id == item.neg_crop_id) {
            
            if (!this.negativeN.includes(this.crop_dict[item.crop.crop_id]) && !this.selectedCrops.includes(this.crop_dict[item.crop.crop_id])) {

              this.negativeN.push(this.crop_dict[item.crop.crop_id]);
            }
          }

        }
      }
    }
    this.applyNutrReqRefineIfToggeled();

    this.negativeN.sort(this.sortFnct);
    console.log("[INFO]: Updated negativeN: ", this.positiveN);
  }

  private applyNutrReqRefineIfToggeled(){
    if (this.nutrient_refine_toggle == true) {

      var nutr_value = "Mittelzehrer";
      for (let crop of this.selectedCrops) {
          if (crop.crop_nutrient_requirements == "Schwachzehrer") {
            nutr_value = crop.crop_nutrient_requirements;
          }
          else if (crop.crop_nutrient_requirements == "Starkzehrer") {
            nutr_value = crop.crop_nutrient_requirements;
          }
      }

      switch (nutr_value) {
        
        case "Starkzehrer":
          this.refineNegativeNByNutriReq("Schwachzehrer");
          console.log("new Set: ", this.negativeN);
          break;

        case "Schwachzehrer":
          this.refineNegativeNByNutriReq("Starkzehrer");
          break;

        default:
          this.negativeN = [];
          break;
      }
    }
  }

  private refineNegativeNByNutriReq(nutriReq:string){
    this.negativeN = [...new Set([...this.negativeN, ...this.crops.filter((crop) => {
      if (crop.crop_nutrient_requirements == nutriReq && !this.selectedCrops.includes(crop)) {
        return true;
      }
      return false;
    })])];
  }
  /**
   * Removes given crop from selected list and updates a lists
   * @param id id of prop to remove
   */
  removeCropFromSelection(id:number) {

    console.log("[INFO]: removing: ", this.crop_dict[id].crop_name);
    this.selectedCrops.splice(this.selectedCrops.indexOf(this.crop_dict[id]), 1);
    this.updateLists();
    let snackBarRef = this._snackBar.open(this.crop_dict[id].crop_name+ ' entfernt', 'Undo', this.snackBarConfig);
  }

  private snackBarConfig: MatSnackBarConfig = {

    panelClass: ['style-accent'], 
    duration: 3000   
  };

  private updatePositiveNeighbors() {
    //reset List to remove duplicates...
    this.positiveN = [];

    if (this.selectedCrops.length == 0) {
      //return when slection is empty...
      console.log("[INFO]: Cleared positiveN...");
      return;
    }

    if (this.default_toggle == true) {

      for (let crop of this.selectedCrops) {

        for (let item of this.posPolyCultivations) {

          if (crop.crop_id == item.crop.crop_id) {

            //add crop to good neighbors list
            if (!this.selectedCrops.includes(this.crop_dict[item.pos_crop_id]) && !this.negativeN.includes(this.crop_dict[item.pos_crop_id]) 
            && !this.positiveN.includes(this.crop_dict[item.pos_crop_id])) {
              this.positiveN.push(this.crop_dict[item.pos_crop_id]);
            }
          }
        }
      }
    }

    if (this.nutrient_refine_toggle == true) {

      //is set to Startkzehrer or Schwachzehrer...
      var nutr_value = "Mittelzehrer";
      for (let crop of this.selectedCrops) {
          if (crop.crop_nutrient_requirements == "Schwachzehrer") {
            nutr_value = crop.crop_nutrient_requirements;
          }
          else if (crop.crop_nutrient_requirements == "Starkzehrer") {
            nutr_value = crop.crop_nutrient_requirements;
          }
      }

      switch (nutr_value) {
        case "Starkzehrer":
          this.positiveN = [...new Set([...this.positiveN, ...this.crops.filter((crop) => {
            if (( crop.crop_nutrient_requirements == "Mittelzehrer" || crop.crop_nutrient_requirements == "Starkzehrer" ) && !this.selectedCrops.includes(crop)
            && !this.negativeN.includes(crop)) {
              return true;
            }
            return false;
          }) ])]

          break;
        case "Schwachzehrer":
          this.positiveN = [...new Set([...this.positiveN,   ...this.crops.filter((crop) => {
            if ((crop.crop_nutrient_requirements == "Mittelzehrer" || crop.crop_nutrient_requirements == "Schwachzehrer" ) && !this.selectedCrops.includes(crop) &&
            !this.negativeN.includes(crop)) {
              return true;
            }
            return false;
          }) ])]
          break;
        default:
          break;
      }
    }

    this.positiveN.sort(this.sortFnct);

    console.log("[INFO]: Updated positiveN: ", this.positiveN);
  }

  id: number = 0
  message = ""

  /**
   * Resets all 'temporary' lists and refills the initial List.
   */
  resetAllLists() {
    this.negativeN = [];
    this.positiveN = [];
    this.undefinedN = this.crops;
    this.selectedCrops = [];

    this.saveStateToCropService();
  }

}
