
export interface Namelist {
  filename: string;
  parsed: {
    [key: string]: string;
  };
}

export interface NamelistsByComponent {
  [component: string]: Namelist[];
}
