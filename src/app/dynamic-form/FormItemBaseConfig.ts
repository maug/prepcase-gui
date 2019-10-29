export interface FormItemBaseConfig<T> {
  controlType?: string;
  help?: string;
  key: string;
  label: string;
  order?: number;
  required?: boolean;
  value?: T;
}
