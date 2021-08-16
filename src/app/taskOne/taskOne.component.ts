import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, AbstractControl, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-taskOne',
  templateUrl: './taskOne.component.html',
  styleUrls: ['./taskOne.component.scss']
})
export class TaskOneComponent implements OnInit {

  
  constructor(private fb: FormBuilder) { 
      this.userForm = this.fb.group({
      base_delivery_cost: ['', Validators.required],
      no_of_packges: ['',Validators.required],
      package: new FormArray([])
    })
 }

  userForm: FormGroup;
  submitted = false;
  result:any;

  ngOnInit(): void {  }

  get f() { return this.userForm?.controls; }
  get t() { return this.f.package as FormArray; }

  onChangePackage(e:any) {
    const numberOfPackages = e.target.value || 0;
    if (this.t.length < numberOfPackages) {
        for (let i = this.t.length; i < numberOfPackages; i++) {
            this.t.push(this.fb.group({
              pkg_id: ['', Validators.required],
              pkg_weight_in_kgs: ['', Validators.required],
              distance_in_kms:['',Validators.required],
              offer_code:['']
            }));
        }
    } else {
        for (let i = this.t.length; i >= numberOfPackages; i--) {
            this.t.removeAt(i);
        }
    }
}

  onReset() {
    // reset whole form back to initial state
    this.submitted = false;
    this.userForm.reset();
    this.t.clear();
    this.getOutput([]);
}

onSubmit() {
  this.submitted = true;
  // stop here if form is invalid
  if (this.userForm.invalid) {
      return;
  }
  // display form values on success
  //debugger;
  //alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.userForm.value, null, 4));
  this.getOutput(this.userForm.value);
}
  getOutput(FormSubmitedData:any){
    //Get the number of packages
    const Packages = FormSubmitedData.package;
    const base_delivery_cost = +FormSubmitedData.base_delivery_cost;
    this.result = [];
    for(let i=0;i<Packages.length;i++){
      const pac = Packages[i];
      const distance = +pac.distance_in_kms;
      const weight = +pac.pkg_weight_in_kgs;
      const appliedCoponCode = pac.offer_code;
      const percentageDis = this.getDiscountCategory(distance,weight);
      const DeliveryCost = this.getDeliveryCost(base_delivery_cost,weight,distance);
      if(percentageDis["Coupon_Code"] === appliedCoponCode){
        const Discount_amount = (DeliveryCost*percentageDis["Percentage"]/100);
        const Amount_to_be_paid = +(DeliveryCost - Discount_amount).toFixed(2);
        const calculationString = base_delivery_cost + " + " + "(" + pac.pkg_weight_in_kgs + " * " + "10)" + " + (" +  pac.distance_in_kms + " * 5)";   
        const obj = {'pkg_id':pac.pkg_id,'PercentageOfDiscount': percentageDis["Percentage"] ,'DeliveryCost': DeliveryCost, 'base_delivery_cost':base_delivery_cost,'pkg_weight_in_kgs': weight, 'distance_in_kms':distance,'offer_code':appliedCoponCode ,'Discount_amount': Discount_amount, 'Amount_to_be_paid': Amount_to_be_paid, 'calculationString': calculationString };
        this.result.push(obj);
      }
      else{//Not valid code or Not eligible
        const calculationString = base_delivery_cost + " + " + "(" + pac.pkg_weight_in_kgs + " * " + "10)" + " + (" +  pac.distance_in_kms + " * 5)";   
        const obj = {'pkg_id':pac.pkg_id,'PercentageOfDiscount': percentageDis["Percentage"], 'DeliveryCost': DeliveryCost, 'base_delivery_cost':base_delivery_cost,'pkg_weight_in_kgs': weight, 'distance_in_kms':distance, 'offer_code':appliedCoponCode , 'Discount_amount': 0, 'Amount_to_be_paid': DeliveryCost, 'calculationString': calculationString };
        this.result.push(obj);
      }
    } 
  }

   

  getDeliveryCost(base_delivery_cost:any,weight:any,distance:any){
    return base_delivery_cost + (10*weight) + (distance*5);
  }

  getDiscountCategory(distance:any,weight:any){

    if(distance < 200 && (weight >= 70 && weight < 200)){
      return {"Percentage" : 10 ,"Coupon_Code": "OFR001"}; //Means 10% discount
    }
    else if((distance >= 50 && distance < 150) &&(weight > 100 && weight < 250)){
      return {"Percentage" : 7 ,"Coupon_Code": "OFR002"}; //Means 7% discount
    }
    else if((distance >= 50 && distance < 250) &&(weight >= 10 && weight < 150) ){
      return {"Percentage" : 5 ,"Coupon_Code": "OFR003"};; //Means 5% discount
    }
    else{
      return {"Percentage" : 0 ,"Coupon_Code": ""};; //Means no discount
    }

  }

  onClear() {
    // clear errors and reset ticket fields
    this.submitted = false;
    this.t.reset();
}

}
