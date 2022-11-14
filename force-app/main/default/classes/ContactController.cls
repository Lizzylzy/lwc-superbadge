public with sharing class ContactController {
        @AuraEnabled(cacheable=true)
        public static List<Contact> getContactsBornAfter(Date birthDate) {
            return [
                SELECT Name, Title, Email, Phone
                FROM Contact
                WHERE Birthdate > :birthDate
                WITH SECURITY_ENFORCED
        ];
        }
}