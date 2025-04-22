export interface CustomButton {
    text: string;
    fontSize?: string;
    width?: string;
    height?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }