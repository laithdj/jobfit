import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AccordionModule} from 'primeng/accordion';     //accordion and accordion tab
import { MaterialModule } from '../material/material.module';
import {MenubarModule} from 'primeng/menubar';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {DropdownModule} from 'primeng/dropdown';
import { HttpClient } from '@angular/common/http';
import { SharedComponent } from './shared/shared.component';
import {BreadcrumbModule} from 'primeng/breadcrumb';
import { NavMenuComponent } from '../nav-menu/nav-menu.component';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {RatingModule} from 'primeng/rating';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ProgressBarModule} from 'primeng/progressbar';
import {TreeModule} from 'primeng/tree';
import {TreeTableModule} from 'primeng/treetable';
import { SideNavComponent } from './side-nav/side-nav.component';
import {MenuModule} from 'primeng/menu';
import { ApiAuthorizationModule } from '../api-authorization/api-authorization.module';
import {TabViewModule} from 'primeng/tabview';
import { LoginMenuComponent } from '../api-authorization/login-menu/login-menu.component';
import {MessageModule} from 'primeng/message';
import {CalendarModule} from 'primeng/calendar';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {DialogModule} from 'primeng/dialog';
import {InputNumberModule} from 'primeng/inputnumber';
import {SliderModule} from 'primeng/slider';
import {GalleriaModule} from 'primeng/galleria';
import {TabMenuModule} from 'primeng/tabmenu';
import {RadioButtonModule} from 'primeng/radiobutton';
import {CheckboxModule} from 'primeng/checkbox';
import {SidebarModule} from 'primeng/sidebar';
import {PaginatorModule} from 'primeng/paginator';
import {FileUploadModule} from 'primeng/fileupload';
import {MultiSelectModule} from 'primeng/multiselect';
import {CardModule} from 'primeng/card';
import { TreeCheckboxComponent } from './custom-controls/tree-checkbox/tree-checkbox.component';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import { TextComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/text/text.component';
import { WholeNumberComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/whole-number/whole-number.component';
import { SelectionComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/selection/selection.component';
import { TextAreaComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/text-area/text-area.component';
import { DateComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/date/date.component';
import { DateRangeComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/date-range/date-range.component';
import { DecimalNumberComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/decimal-number/decimal-number.component';
import { DecimalNumberRangeComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/decimal-number-range/decimal-number-range.component';
import { FileAttachmentComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/file-attachment/file-attachment.component';
import { WholeNumberRangeComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/whole-number-range/whole-number-range.component';
import { YesNoComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/yes-no/yes-no.component';
import { HealthHygieneControlsComponent } from './custom-controls/tree-checkbox/health-hygiene-controls/health-hygiene-controls.component';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {EditorModule} from 'primeng/editor';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {CarouselModule} from 'primeng/carousel';
import {ChartModule} from 'primeng/chart';
import { MaterialCheckboxComponent } from '../tasks/functional-analysis/material-handling/material-checkbox/material-checkbox.component';
import { MaterialResultComponent } from '../tasks/functional-analysis/material-handling/material-result/material-result.component';
import { GripInputBoxComponent } from '../tasks/functional-analysis/grip-strength/grip-input-box/grip-input-box.component';
import { ErrorComponent } from './error/error.component';



export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    SharedComponent,
    NavMenuComponent,
    SideNavComponent,
    MaterialResultComponent,
    MaterialCheckboxComponent,
    TreeCheckboxComponent,
    GripInputBoxComponent,
    TextComponent,
    WholeNumberComponent,
    SelectionComponent,
    TextAreaComponent,
    DateComponent,
    DateRangeComponent,
    DecimalNumberComponent,
    DecimalNumberRangeComponent,
    FileAttachmentComponent,
    WholeNumberRangeComponent,
    YesNoComponent,
    HealthHygieneControlsComponent,
    ErrorComponent,
  ],
  imports: [
    CommonModule,
    TabViewModule,
    ApiAuthorizationModule,
    MessageModule,
    PaginatorModule,
    InputNumberModule,
    AccordionModule,
    CarouselModule,
    ChartModule,
    TabMenuModule,
    AutoCompleteModule,
    GalleriaModule,
    FileUploadModule,
    RadioButtonModule,
    SliderModule,
    EditorModule,
    DialogModule,
    ProgressSpinnerModule,
    CardModule,
    TableModule,
    MultiSelectModule,
    ConfirmDialogModule,
    CheckboxModule,
    MaterialModule,
    DynamicDialogModule,
    TreeTableModule,
    SidebarModule,
    RatingModule,
    MenuModule,
    CalendarModule,
    ProgressBarModule,
    MenubarModule,
    DropdownModule,
    InputTextModule,
    TreeModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    BreadcrumbModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    ErrorComponent,
    MaterialModule,
    InputTextModule,
    TreeTableModule,
    DialogModule,
    PaginatorModule,
    GripInputBoxComponent,
    AutoCompleteModule,
    MessageModule,
    ConfirmDialogModule,
    AccordionModule,
    SliderModule,
    ProgressSpinnerModule,
    CarouselModule,
    ChartModule,
    SideNavComponent,
    EditorModule,
    MessageModule,
    TextComponent,
    WholeNumberComponent,
    MaterialResultComponent,
    MaterialCheckboxComponent,
    SelectionComponent,
    TextAreaComponent,
    DateComponent,
    DateRangeComponent,
    DecimalNumberComponent,
    DecimalNumberRangeComponent,
    FileAttachmentComponent,
    WholeNumberRangeComponent,
    YesNoComponent,
    HealthHygieneControlsComponent,
    CheckboxModule,
    TranslateModule,
    CardModule,
    SidebarModule,
    FileUploadModule,
    GalleriaModule,
    InputNumberModule,
    MultiSelectModule,
    CalendarModule,
    TabMenuModule,
    RadioButtonModule,
    TabViewModule,
    BreadcrumbModule,
    NavMenuComponent,
    FormsModule,
    ApiAuthorizationModule,
    MenuModule,
    ReactiveFormsModule,
    TreeModule,
    ProgressBarModule,
    MenubarModule,
    RatingModule,
    TableModule,
    DropdownModule,
    ButtonModule,
    TreeCheckboxComponent
  ]
})
export class SharedModule {
}