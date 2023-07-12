import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog, } from '@angular/material/dialog';
import { TermsandtonditionsComponent } from '../termsandtonditions/termsandtonditions.component';
import { PartialzService } from '../Service/partialz.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  constructor(private _formBuilder: FormBuilder,
    private readonly _partialzService: PartialzService,
    private readonly _activateRoute: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar,
    public _dialog: MatDialog) { }
  @ViewChild('stepper') stepper!: MatStepper;
  // local variable 
  isButtonDisabled = true;
  isButtonHidden = true;
  isLinear = true;
  hide = true;
  cHide = true;
  selectedStepIndex: number = 0;
  employeEmailID = "";
  token: string = "";
  //Form variable  
  firstFormGroup = this._formBuilder.group({
    UserName: ['', [Validators.required, Validators.email]],
    Password: ['', Validators.required],
    Confirmpassword: ['', Validators.required],
  }, { validator: this.passwordMatchValidator });
  secondFormGroup = this._formBuilder.group({
    EANNumber: ['', [Validators.required, this.lengthValidator]],
    FEINNumber: ['', [Validators.required, this.lengthValidator]],
  });
  thirdFormGroup = this._formBuilder.group({
    aEANNumber: ['', [Validators.required, this.lengthValidator]],
    aFEINNumber: ['', [Validators.required, this.lengthValidator]],
    Email: ['', [Validators.required, Validators.email]],
    employerName: ['', Validators.required],
    employerAddress: ['', Validators.required],
    City: ['', Validators.required],
    State: ['', Validators.required],
    Zipcode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    businessTitle: ['', Validators.required],
    Phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    payrollEndDay: ['', Validators.required],
    terms: [false, Validators.requiredTrue]
  });

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    console.log(this.stepper);
    this._activateRoute.queryParams.subscribe(
      (queryParams) => {
        this.token = queryParams['token'];
        if (this.token != null) {
          this.Veifyemail(this.token);
        }
      }
    );
  }
  //terms and condition
  setAll(completed: boolean) {
    console.log(completed);
  }
  haserror = (iteam: string, errorName: string) => {
    return this.firstFormGroup.controls[iteam].hasError(errorName);
  }
  openDialog() {
    const dialogRef = this._dialog.open(TermsandtonditionsComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  //message dispaly
  private showSnackbar(message: string, action: string): void {
    this._snackBar.open(message, action, {
      duration: 6000, // Duration in milliseconds
    });
  }
  // Custom validator function to check if Password and Confirmpassword fields match
  passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('Password');
    const confirmPassword = control.get('Confirmpassword');

    // Check if both fields are present and their values match
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }
  // Custom validator function for EAN and FEINNumber length
  lengthValidator(control: AbstractControl): ValidationErrors | null {
    const eanNumber = control.value;
    if (eanNumber && eanNumber.length !== 16) {
      return { invalidLength: true };
    }
    return null;
  }
  // Custom validator function to validate US phone numbers
  usPhoneNumberValidator(control: AbstractControl): { [key: string]: any } | null {
    const phoneNumber = control.value;
    const phoneNumberPattern = /^\(\d{3}\) \d{3}-\d{4}$/; // Format: (123) 456-7890

    if (phoneNumber && !phoneNumberPattern.test(phoneNumber)) {
      return { 'invalidPhoneNumber': true };
    }

    return null;
  }
  onPayrollEndDaySelected(event: MatDatepickerInputEvent<Date>) {
    // Update the value of the payrollEndDay FormControl
    if (event.value != null)
      this.thirdFormGroup.get('payrollEndDay')?.setValue(event.value.toDateString());
  }
  //Step 1
  SaveandsendVeifyemail() {
    this.isButtonDisabled = true;
    const userName = this.firstFormGroup.get('UserName'),
      password = this.firstFormGroup.get('Password'),
      confipassword = this.firstFormGroup.get('Confirmpassword');
    if (this.firstFormGroup.valid) {
      if (userName !== null && password !== null) {
        this.sendVeifyemail(userName.value, password.value);
      }
    } else {
      if (confipassword !== null && password !== null && (password.value != confipassword.value)) {
        this.showSnackbar("Password and confirm password does not match", "Close");
      } else {
        this.showSnackbar("Invalid form data", "Close");
      }
    }
  }
  //Step 2
  SaveEANandFEIN() {
    this.isButtonHidden = true;
    const eanNumber = this.secondFormGroup.get('EANNumber'),
      feinNumber = this.secondFormGroup.get('FEINNumber');
    if (this.secondFormGroup.valid) {

      if (eanNumber !== null && feinNumber !== null) {
        const eanNumberValue = eanNumber.value;
        const feinNumberValue = feinNumber.value;
        if (eanNumberValue && feinNumberValue)
          this.authorizEANandFEIN(eanNumberValue, feinNumberValue);
      }
    } else {
      this.showSnackbar("Invalid data", "Close");
    }
  }
  //Step 3
  SubmitApplication() {
    const eanNumber = this.thirdFormGroup.get('aEANNumber'),
      feinNumber = this.thirdFormGroup.get('aFEINNumber'),
      email = this.thirdFormGroup.get('Email'),
      employerName = this.thirdFormGroup.get('employerName'),
      employerAddress = this.thirdFormGroup.get('employerAddress'),
      city = this.thirdFormGroup.get('City'),
      state = this.thirdFormGroup.get('State'),
      zipcode = this.thirdFormGroup.get('Zipcode'),
      firstName = this.thirdFormGroup.get('firstName'),
      lastName = this.thirdFormGroup.get('lastName'),
      businessTitle = this.thirdFormGroup.get('businessTitle'),
      phoneNUmber = this.thirdFormGroup.get('Phone'),
      payrollEndDay = this.thirdFormGroup.get('payrollEndDay');;
    if (this.thirdFormGroup.valid) {
      if (eanNumber !== null && feinNumber !== null && email !== null &&
        employerName !== null && employerAddress !== null && city !== null &&
        state !== null && zipcode !== null && firstName !== null &&
        lastName !== null && businessTitle !== null && phoneNUmber !== null && payrollEndDay !== null
      ) {


        const body = {
          Eannumber: eanNumber.value,
          Feinnumber: feinNumber.value,
          EmployerEmail: email.value,
          Name: employerName.value,
          Address: employerAddress.value,
          City: city.value,
          State: state.value,
          ZipCode: zipcode.value,
          FirstName: firstName.value,
          LastName: lastName.value,
          Email: this.employeEmailID,
          BusinessTitle: businessTitle.value,
          PhoneNumber: phoneNUmber.value,
          PayrollEndDay: payrollEndDay.value
        };
        this.AffidavitRegistration(body);
      }
    } else {
      this.showSnackbar("Invalid data", "Close");
    }
  }
  //Api Calls
  performGetRequest(): void {
    this._partialzService.get<any>('https://localhost:7178/api/Employee?EmailID=rakhi.rakesh237@gamil.com').subscribe(
      (response) => {
        console.log(response);
        if (response == 1) {
          this.showSnackbar("We have sent you the verification mail please confirm", "OK");
        } else {
          this.showSnackbar("Something went wrong please try again", "Close");
        }
      },
      (error) => {
        this.showSnackbar('Error occurred while while processing your request.', "Close");
      }
    );
  }
  sendVeifyemail(emailID: string, Password: string): void {
    const body = {
      Email: emailID,
      Password: Password
    };
    this._partialzService.post<any>('https://localhost:7178/api/Employee', body).subscribe(
      (response) => {
        if (response == 1) {
          this.isButtonDisabled = true;
          this.showSnackbar("We have sent you the verification mail please confirm", "OK");
          this.employeEmailID = emailID;
        } else {
          this.showSnackbar("Something went wrong please try again", "Close");
        }
      },
      (error) => {
        this.showSnackbar('Error occurred while while processing your request.', "Close");
      }
    );
  }
  authorizEANandFEIN(eannumber: string, feinnumber: string): void {
    const body = {
      Eannumber: eannumber,
      Feinnumber: feinnumber
    };
    this._partialzService.post<any>('https://localhost:7178/api/Employer', body).subscribe(
      (response) => {
        if (response == 1) {
          this.isButtonHidden = false;
          this.showSnackbar("Authorization successful,Please click on Next", "OK");
          this.thirdFormGroup.get('aEANNumber')?.setValue(eannumber);
          this.thirdFormGroup.get('aFEINNumber')?.setValue(feinnumber);
        } else {
          this.showSnackbar("Something went wrong please try again", "Close");
        }
      },
      (error) => {
        this.showSnackbar('Error occurred while while processing your request.', "Close");
      }
    );
  }
  AffidavitRegistration(body: any): void {
    this._partialzService.post<any>('https://localhost:7178/api/Employer/AffidavitRegistration', body).subscribe(
      (response) => {
        if (response == 1) {
          this.showSnackbar("Application successfully submitted", "OK");
          this.router.navigate(['/profile'], { queryParams: { type: '2' } });
        } else {
          this.showSnackbar("Something went wrong please try again", "Close");
        }
      },
      (error) => {
        this.showSnackbar('Error occurred while while processing your request.', "Close");
      }
    );
  }
  Veifyemail(token: string): void {
    this._partialzService.get<any>('https://localhost:7178/api/Employee/VerifyEmployee?token=' + token).subscribe(
      (response) => {
        if (response == 1) {
          console.log(this.stepper);
          this.firstFormGroup.get('UserName')?.setValue("yourmail@gmail.com");
          this.firstFormGroup.get('Password')?.setValue("yourpwd");
          this.firstFormGroup.get('Confirmpassword')?.setValue("yourpwd");
          this.stepper.selectedIndex = 1;
          this.showSnackbar("Email verified successfully", "Close");
          this.employeEmailID = token;
        } else {
          this.showSnackbar("Something went wrong please try again", "Close");
        }
      },
      (error) => {
        this.showSnackbar('Error occurred while while processing your request.', "Close");
      }
    );
  }
}
