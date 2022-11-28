export class AlertPopup {
    title?: string;
    errorMessages: string[];
  
    constructor(errorMessages: string[], title?: string) {
      if (title) { this.title = title; }
  
      this.errorMessages = errorMessages;
    }
  }
  export const ACCESS_DENIED_MESSAGE = 'Your current security setting does not give you access to this information.  Please check with your Administrator for access.';
  export const ACCESS_DENIED_TITLE = 'Access Denied';