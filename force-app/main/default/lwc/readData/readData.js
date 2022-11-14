import { LightningElement, wire, api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';

export default class ReadData extends LightningElement {
    @api recordId;
    data;
    error;
    @wire(getRecord, {recordId:'$recordId', fields:[ACCOUNT_NAME_FIELD]})
    wiredAccount({data, error}) {
        console.log('Execute logic each time a new value is provisioned');
        if (data) {
            console.log(JSON.stringify(data));
            this.data = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }
}