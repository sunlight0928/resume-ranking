declare module "react-to-print" {
    import * as React from "react";
  
    export interface ReactToPrintProps {
      trigger: () => React.ReactElement;
      content: () => React.ReactInstance | null;
      onBeforeGetContent?: () => Promise<void> | void;
      onAfterPrint?: () => void;
      onBeforePrint?: () => Promise<void> | void;
      onPrintError?: (errorLocation: string, error: Error) => void;
      documentTitle?: string;
      pageStyle?: string | (() => string);
      removeAfterPrint?: boolean;
      suppressErrors?: boolean;
      bodyClass?: string;
    }
  
    const ReactToPrint: React.FC<ReactToPrintProps>;
    export default ReactToPrint;
  }