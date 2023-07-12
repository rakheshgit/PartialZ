declare module 'html2pdf.js' {
    function html2pdf(): {
      from(element: HTMLElement | Element): {
        set(options: any): any;
        save(): void;
      };
    };
  
    export = html2pdf;
  }  