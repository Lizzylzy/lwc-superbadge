import { LightningElement, wire, api, track } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { reduceErrors } from 'c/ldsUtils';


const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = [
    {label: 'Name', fieldName: 'Name', editable: true},
    {label: 'Length', fieldName: 'Length__c', type: 'number'},
    {label: 'Price', fieldName: 'Price__c', type: 'currency'},
    {label: 'Description', fieldName: 'Description__c'},
  ];
  boatTypeId = '';
  @track
  boats;
  isLoading = false;
  @track
  draftValues = [];
  
  // wired message context
  @wire(MessageContext)
  messageContext;

  @wire(getBoats, {boatTypeId: '$boatTypeId'})
  // wired getBoats method 
  wiredBoats({data,error}) { 
    if (data) {
        this.boats = data;
        this.notifyLoading(false);
    } else if (error) {
        console.log('data.error')
        console.log(error);
        this.notifyLoading(false);
    }
  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading

  async refresh() {
    this.notifyLoading(true);
    await refreshApex(this.boats);
    this.notifyLoading(false);
  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    const message = {
      recordId: boatId
    }
    publish(this.messageContext, BOATMC, message)
    // explicitly pass boatId to the parameter recordId
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    this.notifyLoading(true);
    // notify loading
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then((result) => {
      const toast = new ShowToastEvent({
          title: SUCCESS_TITLE,
          message: MESSAGE_SHIP_IT,
          variant: SUCCESS_VARIANT,
      });
      this.dispatchEvent(toast);
      this.draftValues = [];
      return this.refresh();
    })
    .catch(error => {
      error = reduceErrors(error);
      const toast = new ShowToastEvent({
          title: ERROR_TITLE,
          message: JSON.stringify(error),
          variant: ERROR_VARIANT,
      });
      this.dispatchEvent(toast);
    })
    .finally(() => {
      this.notifyLoading(false);
    });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    if (isLoading) {
        this.dispatchEvent(new CustomEvent('loading'));
    } else {
        this.dispatchEvent(new CustomEvent('doneloading'));
    }
  }
}