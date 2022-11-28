import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { EInputType, HealthHygieneInputItemView, HHListItem,  } from 'src/app/shared/models/health-hygeine.model';

@Component({
  selector: 'health-hygiene-controls',
  templateUrl: './health-hygiene-controls.component.html',
  styleUrls: ['./health-hygiene-controls.component.css']
})

export class HealthHygieneControlsComponent implements OnInit , OnChanges{
  @Input() typeId: number = 0;
  @Input() inputItem?: HealthHygieneInputItemView = undefined;
  @Input() initialValue?: string = undefined;
  @Input() criteria?: boolean = false;
  @Input() disabled: boolean = false;
  @Output() valueChange =  new EventEmitter<any>();
  value: any;
  value2: any;
  hygieneId: any;  
  listItem: HHListItem[] = [];
  selectionLimit: number = 1;
 

  constructor() { }

  ngOnInit(): void {
    switch (this.typeId) {
      case EInputType.Date: this.setDate(); break;
      case EInputType.Comments:
      case EInputType.Text: this.setTextItems(); break;
      case EInputType.Selection: this.setSelectionItems(); break;
      case EInputType.Decimal:
      case EInputType.WholeNumber: this.setNumberInput(); break;
      case EInputType.YesNo: this.setYesNoItems(); break;
      case EInputType.DateRange: this.setDateRangeItems(); break;
      case EInputType.DecimalRange:
      case EInputType.WholeNumberRange: this.setRangeItems(); break;
     
      // TODO
      case EInputType.FileAttachment:
      
      default:
        this.value = (this.inputItem && this.initialValue) ? this.initialValue : "";
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    
  switch (this.typeId) {
    case EInputType.Date:
    case EInputType.Comments:
    case EInputType.Text: this.setTextItems(); break;
    case EInputType.Selection: this.setSelectionItems(); break;
    case EInputType.Decimal:
    case EInputType.WholeNumber: this.setNumberInput(); break;
    case EInputType.YesNo: this.setYesNoItems(); break;
    case EInputType.DateRange: 
    case EInputType.DecimalRange:
    case EInputType.WholeNumberRange: this.setRangeItems(); break;
   
    // TODO
    case EInputType.FileAttachment:
    
    default:
      this.value = (this.inputItem && this.initialValue) ? this.initialValue : "";
  }
}
  setRangeItems() {
    if (this.inputItem && this.initialValue) {
      var delimiter = this.initialValue.indexOf(";") > -1 ?  ";": ",";
      const splitValue = this.initialValue?.split(delimiter)?.map(i => this.inputItem?.inputTypeId != EInputType.DateRange ?  Number(i): i);
      if (splitValue) {
        this.value = splitValue[0];
        this.value2 = splitValue[1];
      }
    } else {
      this.value = undefined;
      this.value2 = undefined;
    }
  }
  setDateRangeItems() {
    if (this.inputItem && this.initialValue) {
      var delimiter = this.initialValue.indexOf(";") > -1 ?  ";": ",";
      const splitValue = this.initialValue?.split(delimiter)?.map(i => this.inputItem?.inputTypeId != EInputType.DateRange ?  Number(i): i);
      if (splitValue) {
        this.value = new Date(splitValue[0]);
        this.value2 = new Date(splitValue[1]);
      }
    } else {
      this.value = undefined;
      this.value2 = undefined;
    }
  }
  setDate() {
    if (this.inputItem) {
      if(this.initialValue) {
        this.value = new Date(this.initialValue);
      }
    }
  }
  setTextItems() {
    if (this.inputItem) {
      this.value = this.initialValue;
    }
  }
  
  setSelectionItems() {
    this.listItem = [];
    if (this.inputItem) {
      if (this.inputItem.settings.length > 0) {
        this.selectionLimit = this.inputItem.settings[0].selectLimit;
      }
      this.inputItem.listItems.forEach(element => {
        this.listItem.push({
          id: element.id,
          name: element.itemText,
          isActive: element.isActive
        })
      });
      if (this.initialValue && !this.criteria) {
        const splitValues = this.initialValue?.split(/[,;]/)?.map(i => Number(i));
        this.value = splitValues;
      } else if (this.initialValue && this.criteria){
        const splitValues = this.initialValue?.split(/[,;]/)?.map(i => String(i));
        this.value = splitValues;
      }
    }
  }


  setNumberInput() {
    if (this.inputItem) {
      this.value = this.initialValue != null && this.initialValue != "" ? Number(this.initialValue): undefined;
    }
  }

  setYesNoItems() {
    if (this.inputItem && (this.initialValue === "Y" || this.initialValue === "Yes")) {
      this.value = "Yes";
    } else if (this.inputItem && (this.initialValue === "N" || this.initialValue === "No")){
      this.value = "No";
    } else {
      this.value = undefined;
    }
  }
  
  onValueChange(range?: boolean){
    if(range){
      this.valueChange.emit(this.value + ';' + this.value2);
    } else {
      this.valueChange.emit(this.value);
    }
  }
}
