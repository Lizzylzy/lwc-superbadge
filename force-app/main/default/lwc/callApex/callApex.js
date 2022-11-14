import { LightningElement, api, wire } from 'lwc';
import getContactsBornAfter  from '@salesforce/apex/ContactController.getContactsBornAfter';

export default class CallApex extends LightningElement {
    // @api minBirthDate;
    contacts;
    // @wire(getContactsBornAfter, {birthDate: '1995-08-12'})
    // getContacs({data,error}) {
    //     this.contacts = data;
    //     console.log(JSON.stringify(data));
    //     console.log(error);
    //     console.log('get contact list');
    // }
    handleButtonClick() {
        getContactsBornAfter({
            birthDate: '1995-08-12'
        })
            .then(contacts => {
                this.contacts = contacts;
                console.log('call Apex Imperative');
            })

            .catch(error => {

            })
    }
    
}