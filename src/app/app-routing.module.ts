import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowseComponent } from './browse/browse.component';
import { CropSearchComponent } from './crop-search-app/crop-search-app.component';
import { FaqComponent } from './faq/faq.component';

import { ViewCropComponent } from './view-crop/view-crop.component';

const routes: Routes = [
  { path: 'crop', component: CropSearchComponent},
  { path: 'faq', component: FaqComponent},
  { path: 'browse', component: BrowseComponent },
  { path: 'view-crop/:crop_id', component: ViewCropComponent },
  { path: '', redirectTo: '/crop', pathMatch: 'full' },
  { path: '**', component: CropSearchComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
